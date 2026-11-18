# Troubleshooting

## External app panel (`externalAppEmbed`)

| Symptom | Cause | Fix |
|---|---|---|
| Red alert "Não foi possível carregar a aplicação externa" after ~5 s | No `bridge-ready`/`widget-ready` from the app: tunnel down or changed, CSP Trusted Site does not match the URL, or the app's `frame-ancestors` does not include the Lightning origin | Check the tunnel is running; compare `.dev/url` with the CSP `endpointUrl` and the page `appUrl`; set `SF_ORIGIN` in `src/.env` to the real Lightning origin and restart |
| Browser console: "Refused to frame" | Missing/old CSP Trusted Site, or `frame-ancestors` mismatch | Redeploy with `npm run dev:tunnel`; verify `SF_ORIGIN` |
| Cloudflare error page in the panel (530, 502) | Tunnel not registered or app not listening | Look at `.dev/tunnel.log`; confirm `npm start` is running on `PORT` |
| Panel stays blank, table never appears | App never receives `salesforce-data` or ignores it because the origin is not in `SF_ORIGIN` | `SF_ORIGIN` must contain `https://<domain>.lightning.force.com` exactly, no path |
| "Nenhuma conta financeira encontrada" | `accountId` not in `dados.json` | Add the Account Id to `dados.json` and restart (the DB is reloaded at boot) |
| Panel keeps resizing / flickers | Loop of `resize` and context pushes | `externalAppEmbed` ignores sub-pixel changes and re-sends context only when `recordId` changes; do not remove those guards |
| Works on desktop but not in the mobile app | Different embedding path | Test on desktop Lightning Experience |
| Page shows no panel | `externalAppEmbed` is visible only on person accounts (`Record.IsPersonAccount` = true); business accounts get `opportunityManagerEmbed`. Or the page is not activated | Test with a person account; check the page assignment |

## `npm run dev:tunnel`

| Message | Cause | Fix |
|---|---|---|
| `missing dependency: cloudflared` | Not installed | `brew install cloudflared` |
| `src/.env not found` | Missing config | `cp src/.env.example src/.env` and fill it |
| `port <n> is already in use` | App or another process on `PORT` | Stop it (`lsof -iTCP:<n> -sTCP:LISTEN`) |
| `tunnel did not connect to Cloudflare after 30s` | VPN/firewall blocks outbound 7844 (UDP for QUIC, the default) | Retry with `TUNNEL_PROTOCOL=http2` (TCP 7844), disconnect the VPN or allow it; see `.dev/tunnel.log` |
| `no target org` | No default org | `sf config set target-org <alias>` or `--target-org` |
| `No base file for markup://c:externalAppEmbed` / `couldn't retrieve the design time component information` | The LWC bundle was deployed without its `.js`/`.html` | Deploy full bundles (`--metadata LightningComponentBundle:externalAppEmbed`); do not use only the `-meta.xml` |
| `Succeeded` but nothing changed | Verify in the org; some metadata is silently ignored | Compare in Setup (see platform gotchas) |

If a run was killed and the files still show a tunnel URL you did not intend, restore from `.dev/backup` or `git checkout -- <file>` for tracked files.

## CRUD App (Canvas SSO)

Start with the CRUD app log: every failure logs `auth.canvas.rejected` with a `reason`. Full table in the [CRUD repo](https://github.com/mgalvao2012/nodejs-sso-salesforce/blob/main/docs/troubleshooting.md).

| Symptom | Likely cause | Fix |
|---|---|---|
| Tab not visible | User lacks `NodeCrud_Access` | `sf org assign permset --name NodeCrud_Access --on-behalf-of <username>` |
| "Refused to display ... in a frame" or Cloudflare 530 | Quick tunnel not registered (VPN/firewall blocking 7844) | Check `.dev/tunnel.log` in the CRUD repo for `Registered tunnel connection`; retry on another network or with `TUNNEL_PROTOCOL=http2` |
| "connection is blocked because it was initiated by a public page" | Canvas URL points to `localhost` | Use a public HTTPS URL (`npm run dev:tunnel` or `set-app-url`) |
| `untrusted_origin`, `org_not_allowed` | `SF_TRUSTED_ORIGINS` / `SF_ALLOWED_ORG_ID` wrong | `npm run init-env` in the CRUD repo |
| `invalid_signature`, `token_introspection_unavailable` (`invalid_client`) | Consumer secret out of sync, e.g. after a rotation | `npm run rotate-credentials -- --sync-only`, restart |
| Login form "is not linked to this application" | No local user with that Salesforce User Id | Set it in **Users → Edit** (open the app directly in a browser) |
| Canvas URL reverted to an old value | A deploy of the tracked metadata overwrote the tunnel URL | Run `npm run dev:tunnel` again |

## Platform gotchas

- **UI Bundle embedded with `lightning-ui-embedding` renders blank in LEX** even though the direct URL works: the iframe stays `visibility: hidden` (`data-state="pre-heartbeat"`) until the bundle posts `{ type: "sf-embedding/ready", protocolVersion: "1.0.0", instanceId }` to `hostAppOrigin` (both from the `?hostMetaData=` parameter). Each bundle needs `public/sf-embedding-heartbeat.js` (copy from `AccountsApp`) loaded in `index.html`.
- **SLDS `--slds-g-*` hooks do not reach an embedded UI Bundle** (cross-origin iframe). Always give hooks a fallback; `OpportunityManager` maps shadcn tokens to SLDS 2 values in `src/styles/global.css`.
- **`@salesforce/platform-sdk` `graphql.query` caches for 300 s.** After a mutation, pass `cacheControl: 'no-cache'` or call `result.refresh()`. Use `mutate()` for mutations.
- **Record links from an embedded UI Bundle:** use an absolute `*.lightning.force.com` URL with `target="_blank"`; `/lightning/r/...` does not resolve on `*.my.salesforce.app` and `_top` is blocked by the sandbox.
- **Agentforce Conversation Client stays invisible when the agent is unreachable** (opacity 0 until `accready`). It needs a valid `agentId` and an explicit `<agentAccesses>` in a permission set. Deploying `<agentAccesses>` was silently ignored here: grant it in Setup and verify with `SELECT Parent.Name FROM SetupEntityAccess WHERE SetupEntityId = '<0Xx id>'`.
- **[OPEN] ACC 12.11.0 floating button never shows in desktop browsers** (no `accready`). Only the Salesforce Mobile App shows it. Undocumented: escalate instead of guessing.
- **Permission set with Read Account fails to deploy without Read Contact** ("Permission Read Account depends on permission(s): Read Contact").
- **`sf template generate ui-bundle -t reactbasic`** needs fixes: add `<target>CustomApplication</target>` to `uibundle-meta.xml`, add the `@` alias to `vitest.config.ts`, and remove the root `.graphqlrc.yml` it creates.
- **Playwright MCP cannot launch Chrome** on this machine (MDM policy); visual checks need a manual browser.
