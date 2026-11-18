# Operations

## Dev tunnel

The Node app runs on the developer machine. A Cloudflare **quick tunnel** gives it a public HTTPS URL, which changes on every run (`*.trycloudflare.com`). `scripts/dev-tunnel.sh` keeps Salesforce pointed at the current URL.

```bash
npm run dev:tunnel                          # confirm, deploy, run app
npm run dev:tunnel -- --yes                 # deploy without asking
npm run dev:tunnel -- --validate-only       # sf project deploy validate; org unchanged, files restored
npm run dev:tunnel -- --no-deploy           # tunnel + app only
npm run dev:tunnel -- --target-org <alias>  # default: $SF_TARGET_ORG or the project target-org
TUNNEL_PROTOCOL=http2 npm run dev:tunnel    # default: quic (UDP 7844); http2 uses TCP 7844
```

Steps:

1. Reads `PORT` from `src/.env` (prints nothing else from it) and refuses to start if the port is busy.
2. Starts `cloudflared tunnel --url http://localhost:$PORT`, extracts the URL and waits for `Registered tunnel connection`. Nothing is changed before the tunnel is connected.
3. Shows the target org (alias / username / instance URL), the components and the new URL, then asks for confirmation (default: no).
4. Backs up the 3 URL-carrying files to `.dev/backup`, rewrites the URL in place and runs `sf project deploy start|validate` with `--metadata` for the 4 components.
5. Starts the app with `npm start` in `src/` and probes `<tunnel>/config.json`.
6. Ctrl+C stops the app and the tunnel.

State:

- After a real deploy the new URL stays in the files (see `git diff`); commit or discard it as you prefer.
- After `--validate-only`, or an interrupted validate, originals are restored from `.dev/backup`.
- If a deploy fails, the files keep the new URL; originals are in `.dev/backup`.

### Production org

`demo-org` is Production. The deploy-gate hook blocks `sf project deploy start`; run `--validate-only` first and obtain explicit approval for the real deploy. Check the printed target org: the CLI default may not be the org you expect (`--target-org` overrides it).

### Stable URL

A quick tunnel forces a deploy on every run. For a stable URL use a named tunnel (`TUNNEL_NAME` + `npm run tunnel` in `src/`) or host the app, then set the URL once in the three files above and deploy normally.

## Run the app alone

```bash
cd src
npm start                 # http://localhost:$PORT
# local dev outside the iframe:
open "http://localhost:$PORT/?recordId=<AccountId>"
```

## Deploy manually

```bash
sf org display
sf project deploy validate --metadata CspTrustedSite:FinancialAccounts \
  --metadata FlexiPage:Account_Record_Page \
  --metadata LightningComponentBundle:externalAppEmbed \
  --metadata LightningComponentBundle:vendorLwcShell --target-org <alias>
# after approval: sf project deploy start (same --metadata flags)
```

`flexipages/Account_Record_Page` references `externalAppEmbed`, and `externalAppEmbed` imports `c/vendorLwcShell`: deploy them together, with the full LWC bundles.

## UI Bundles

```bash
cd force-app/main/default/uiBundles/<bundle>
npm install
npm run build          # produces dist/
npm run dev            # local dev server
```

After deploying a UI Bundle, verify the data it needs: permission sets (`*_Access`), object/field access, and, for Agentforce, the `<agentAccesses>` entries (check `SetupEntityAccess`).

## Backups

Before rewriting Apex, LWC, complex Flows or org-shape metadata (profiles, permission sets, layouts), keep a `.bak` copy next to the file (`**/*.bak` is in `.forceignore`).
