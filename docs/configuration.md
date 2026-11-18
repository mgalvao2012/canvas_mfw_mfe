# Configuration

## `src/.env`

Read by `npm start` (`node --env-file=.env server.js`) and `npm run tunnel`. Copy from `src/.env.example`. The file is git-ignored and must not be printed or committed.

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | yes | Local port; also used by `scripts/dev-tunnel.sh` for the tunnel target |
| `SF_ORIGIN` | yes | Comma-separated Lightning origins. Used for `frame-ancestors` and to validate `postMessage` origins. A host without scheme gets `https://`; trailing slashes are removed |
| `DB_FILE` | yes | SQLite file path (directory is created) |
| `DATA_FILE` | yes | JSON seed loaded into SQLite at boot (replaces the table content) |
| `TUNNEL_NAME` | no | Only for `npm run tunnel` in `src/`: runs an existing named tunnel instead of a quick tunnel |

The server exits at boot when a required variable is missing.

## npm scripts

### Root

| Script | Does |
|---|---|
| `npm run dev:tunnel` | Tunnel + metadata URL update + deploy + app. See [operations.md](operations.md#dev-tunnel) |
| `npm run lint` | ESLint over `aura` and `lwc` |
| `npm test` | LWC Jest (`sfdx-lwc-jest`) |
| `npm run prettier` / `prettier:verify` | Format / check formatting |

### `src/`

| Script | Does |
|---|---|
| `npm start` | Run the Express app with `.env` |
| `npm run tunnel` | Only the `cloudflared` tunnel (quick tunnel, or named with `TUNNEL_NAME`) |

## Metadata that carries the app URL

`scripts/set-tunnel-url.js` rewrites these in place:

| File | Element |
|---|---|
| `cspTrustedSites/FinancialAccounts.cspTrustedSite-meta.xml` | `<endpointUrl>` |
| `flexipages/Account_Record_Page.flexipage-meta.xml` | `appUrl` component property `<value>` |
| `lwc/externalAppEmbed/externalAppEmbed.js-meta.xml` | `appUrl` property `default` |

`externalAppEmbed.js` has no default for `appUrl`: the value comes from the page property, falling back to the `default` in `externalAppEmbed.js-meta.xml`.

## `externalAppEmbed` properties

| Property | Default | Notes |
|---|---|---|
| `appUrl` | tunnel URL | Origin and path of the external app |
| `height` | `60` | Initial height in px (60 in both meta and JS); the app grows/shrinks it through `resize` |
| `shellTitle` | `External app` | iframe title (accessibility) |

## Project files

| File | Notes |
|---|---|
| `sfdx-project.json` | Single package directory `force-app`, API 67.0. `src/` is not a package directory and is never deployed |
| `.forceignore` | Standard SFDX ignores |
| `.dev/` | Written by `dev-tunnel.sh`: `url`, `tunnel.log`, `deploy.json`, `backup/` (git-ignored) |
