#!/usr/bin/env bash
# Starts a Cloudflare quick tunnel to the local Node app (src/), writes its (new, random) URL into the
# project metadata (CSP Trusted Site, Account record page, externalAppEmbed default), deploys those
# components and runs the app behind the tunnel. Ctrl+C stops app and tunnel.
#
#   npm run dev:tunnel                         # asks for confirmation before deploying
#   npm run dev:tunnel -- --yes                # deploy without asking
#   npm run dev:tunnel -- --validate-only      # `deploy validate` only; org unchanged, files restored afterwards
#   npm run dev:tunnel -- --no-deploy          # tunnel + app only (metadata and Salesforce untouched)
#   npm run dev:tunnel -- --target-org <alias> # default: $SF_TARGET_ORG or the project's target-org
#   TUNNEL_PROTOCOL=http2 npm run dev:tunnel   # default: quic (UDP 7844). Use http2 (TCP 7844) if UDP is blocked.
#
# The URL is written in place in the tracked metadata (see `git diff`) and deployed with --metadata.
# After a real deploy the new URL stays in the files; after --validate-only the originals are restored
# from .dev/backup. The current URL is written to .dev/url. Requires src/.env.
set -euo pipefail

ORG=""
YES=false
DEPLOY=true
VALIDATE_ONLY=false

while [ $# -gt 0 ]; do
  case "$1" in
    --yes|-y) YES=true ;;
    --no-deploy) DEPLOY=false ;;
    --validate-only) VALIDATE_ONLY=true ;;
    --target-org) ORG="$2"; shift ;;
    -h|--help) sed -n '2,13p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

for cmd in cloudflared sf jq node npm lsof curl; do
  command -v "$cmd" >/dev/null || { echo "missing dependency: $cmd" >&2; exit 2; }
done

ROOT=$(cd "$(dirname "$0")/.." && pwd)
APP_DIR="$ROOT/src"
META="force-app/main/default"
DEV_DIR="$ROOT/.dev"
BACKUP_DIR="$DEV_DIR/backup"
mkdir -p "$DEV_DIR"

[ -f "$APP_DIR/.env" ] || { echo "src/.env not found (cp src/.env.example src/.env)" >&2; exit 2; }
PORT=$(sed -n 's/^PORT=//p' "$APP_DIR/.env" | head -1 | tr -d '[:space:]')
[ -n "$PORT" ] || { echo "PORT missing in src/.env" >&2; exit 2; }

# Org: --target-org > $SF_TARGET_ORG > project target-org
if [ -z "$ORG" ]; then
  ORG=${SF_TARGET_ORG:-$(cd "$ROOT" && sf config get target-org --json 2>/dev/null | jq -r '.result[0].value // empty')}
fi
[ -n "$ORG" ] || { echo "no target org: pass --target-org <alias>, set SF_TARGET_ORG or sf config set target-org" >&2; exit 2; }

# Files that carry the app URL (rewritten in place).
FILES=(
  "cspTrustedSites/FinancialAccounts.cspTrustedSite-meta.xml"
  "flexipages/Account_Record_Page.flexipage-meta.xml"
  "lwc/externalAppEmbed/externalAppEmbed.js-meta.xml"
)
# Components deployed (externalAppEmbed imports c/vendorLwcShell).
COMPONENTS=(
  "CspTrustedSite:FinancialAccounts"
  "FlexiPage:Account_Record_Page"
  "LightningComponentBundle:externalAppEmbed"
  "LightningComponentBundle:vendorLwcShell"
)

TUNNEL_PID=""
PROBE_PID=""
RESTORE=false
restore_files() {
  for f in "${FILES[@]}"; do
    [ -f "$BACKUP_DIR/$f" ] && cp "$BACKUP_DIR/$f" "$ROOT/$META/$f"
  done
  return 0
}
cleanup() {
  [ -n "$PROBE_PID" ] && kill "$PROBE_PID" 2>/dev/null || true
  [ -n "$TUNNEL_PID" ] && kill "$TUNNEL_PID" 2>/dev/null || true
  [ "$RESTORE" = true ] && restore_files
  return 0
}
trap cleanup EXIT
trap 'exit 130' INT TERM

if lsof -tiTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "port $PORT is already in use — stop the running app first." >&2
  exit 1
fi

echo "starting tunnel to http://localhost:$PORT ..."
cloudflared tunnel --no-autoupdate --protocol "${TUNNEL_PROTOCOL:-quic}" --url "http://localhost:$PORT" > "$DEV_DIR/tunnel.log" 2>&1 &
TUNNEL_PID=$!

URL=""
for _ in $(seq 1 30); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$DEV_DIR/tunnel.log" | head -1 || true)
  [ -n "$URL" ] && break
  kill -0 "$TUNNEL_PID" 2>/dev/null || { echo "tunnel exited, see $DEV_DIR/tunnel.log" >&2; exit 1; }
  sleep 1
done
[ -n "$URL" ] || { echo "no tunnel URL after 30s, see $DEV_DIR/tunnel.log" >&2; exit 1; }
echo "$URL" > "$DEV_DIR/url"
echo "tunnel URL: $URL"

# The URL is printed before the tunnel reaches the edge; wait for registration before touching Salesforce.
REGISTERED=""
for _ in $(seq 1 30); do
  REGISTERED=$(grep -m1 'Registered tunnel connection' "$DEV_DIR/tunnel.log" || true)
  [ -n "$REGISTERED" ] && break
  kill -0 "$TUNNEL_PID" 2>/dev/null || { echo "tunnel exited, see $DEV_DIR/tunnel.log" >&2; exit 1; }
  sleep 1
done
if [ -z "$REGISTERED" ]; then
  echo "tunnel did not connect to Cloudflare after 30s, nothing was changed." >&2
  echo "  check VPN/firewall (outbound 7844 to Cloudflare) and $DEV_DIR/tunnel.log" >&2
  exit 1
fi
echo "tunnel connected"

if [ "$DEPLOY" = true ]; then
  ORG_INFO=$(sf org display --target-org "$ORG" --json 2>/dev/null | jq -r '.result | "\(.alias // "-") / \(.username) / \(.instanceUrl)"')
  echo
  echo "target org:  $ORG_INFO"
  echo "components:  ${COMPONENTS[*]}"
  echo "new URL:     $URL"
  if [ "$YES" != true ] && [ "$VALIDATE_ONLY" != true ]; then
    answer=""
    read -r -p "Deploy this change to $ORG? [y/N] " answer || true
    case "$answer" in y|Y|yes|sim|s) ;; *) echo "deploy skipped; metadata and Salesforce keep the previous URL."; DEPLOY=false ;; esac
  fi
fi

if [ "$DEPLOY" = true ]; then
  # Back up the originals, then rewrite the URL in place.
  for f in "${FILES[@]}"; do
    mkdir -p "$BACKUP_DIR/$(dirname "$f")"
    cp "$ROOT/$META/$f" "$BACKUP_DIR/$f"
  done
  [ "$VALIDATE_ONLY" = true ] && RESTORE=true
  FULL=()
  for f in "${FILES[@]}"; do FULL+=("$ROOT/$META/$f"); done
  node "$ROOT/scripts/set-tunnel-url.js" "$URL" "${FULL[@]}"

  if [ "$VALIDATE_ONLY" = true ]; then ACTION=validate; else ACTION=start; fi
  META_ARGS=()
  for c in "${COMPONENTS[@]}"; do META_ARGS+=(--metadata "$c"); done
  echo "deploy $ACTION..."
  (cd "$ROOT" && sf project deploy "$ACTION" "${META_ARGS[@]}" --target-org "$ORG" --wait 30 --json) \
    > "$DEV_DIR/deploy.json" 2>/dev/null || true
  if [ "$(jq -r '.result.success // false' "$DEV_DIR/deploy.json")" != "true" ]; then
    echo "deploy failed (metadata files keep the new URL unless --validate-only; originals in $BACKUP_DIR):" >&2
    jq -r '.message // "unknown error (see .dev/deploy.json)"' "$DEV_DIR/deploy.json" >&2
    jq -r '.result.details.componentFailures // [] | (if type=="array" then . else [.] end)[] | "  \(.fullName): \(.problem)"' "$DEV_DIR/deploy.json" >&2 || true
    exit 1
  fi
  if [ "$VALIDATE_ONLY" = true ]; then
    echo "validated ($(jq -r '.result.id' "$DEV_DIR/deploy.json")); org unchanged, files restored."
  else
    echo "deployed ($(jq -r '.result.id' "$DEV_DIR/deploy.json")): Salesforce now points to $URL"
  fi
fi

echo "starting app (src/, port $PORT) — Ctrl+C stops app and tunnel"
cd "$APP_DIR"
(
  status=""
  for _ in $(seq 1 30); do
    sleep 2
    status=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$URL/config.json" || true)
    [ "$status" = 200 ] && { echo "✔ app reachable through the tunnel: $URL"; exit 0; }
  done
  echo "⚠ app not reachable through the tunnel after 60s (last status: ${status:-none})" >&2
) &
PROBE_PID=$!
npm start
