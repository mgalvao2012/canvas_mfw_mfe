# Setup

## Prerequisites

| Tool | Notes |
|---|---|
| Node.js >= 22.13 | `src/` uses `node:sqlite` and `--env-file` |
| Salesforce CLI 2 (`sf`) | Never use the deprecated `sfdx` commands |
| `cloudflared` | `brew install cloudflared` |
| `jq`, `curl`, `lsof` | Used by `scripts/dev-tunnel.sh` |
| Org access | A user that can deploy metadata and edit Lightning pages in **demo-org** |

The org needs Lightning Experience and the features used by the UI Bundles (UI Bundles / Multi-Framework). Confirm the org has them before adding new bundles.

## 1. Authorize the org

```bash
sf org login web --alias demo-org
sf config set target-org demo-org
sf org display            # confirm instance URL and that it is the intended org
```

`demo-org-prod` is a **Production** org. Check the target before every deploy (`sf org display`).

## 2. Install dependencies

```bash
npm install                                   # root: lint, prettier, LWC Jest
(cd src && npm install)                       # Node.js app
```

## 3. Configure the Node.js app

```bash
cd src
cp .env.example .env
```

Set in `src/.env` (never commit it; it is git-ignored):

| Variable | Value |
|---|---|
| `PORT` | e.g. `3001` |
| `SF_ORIGIN` | Lightning origin(s), comma separated: `https://<my-domain>.lightning.force.com` [UNKNOWN: exact domain of demo-org; read it from `sf org open --url-only` and replace `.my.salesforce.com` with `.lightning.force.com`] |
| `DB_FILE` | `./data/financial.db` |
| `DATA_FILE` | `./dados.json` |

`dados.json` is keyed by Salesforce Account Id. Replace the ids with accounts that exist in the org.

## 4. Validate and deploy the embed metadata

```bash
npm run dev:tunnel -- --validate-only   # tunnel + deploy validate; files restored, org unchanged
npm run dev:tunnel                      # asks for confirmation, deploys, then runs the app
```

The script deploys these components with the new tunnel URL:

- `CspTrustedSite:FinancialAccounts`
- `FlexiPage:Account_Record_Page`
- `LightningComponentBundle:externalAppEmbed`
- `LightningComponentBundle:vendorLwcShell`

See [operations.md](operations.md#dev-tunnel) for flags and behavior.

## 5. Activate the record page

A deployed flexipage is not automatically assigned. In Setup, open **Lightning App Builder → Account_Record_Page → Activation** and assign it (Org Default, App Default or App/Record Type/Profile). Then open a **person** Account (desktop) and check the **External app** panel. Business accounts show the Opportunity Manager panel instead (visibility rules on `Record.IsPersonAccount`).

## 6. UI Bundles (optional)

```bash
cd force-app/main/default/uiBundles/<bundle>
npm install
npm run build
```

Assign the matching permission set (`AccountsApp_Access`, `OpportunityManager_Access`) to users, then open the app from the App Launcher.

## 7. CRUD App (Canvas SSO)

Set up from its own repository, [mgalvao2012/nodejs-sso-salesforce](https://github.com/mgalvao2012/nodejs-sso-salesforce) (`docs/salesforce-setup.md`): deploy its `salesforce/` metadata (validate first, this is a Production org), assign `NodeCrud_Access`, run `npm run init-env`, then link users by Salesforce User Id. Do not deploy `NodeCrudEca` or `NodeCrudCanvasEca` from this repo: the copies here are partial.

## Adding another embedded external app

1. Add the origin as a CSP Trusted Site with `isApplicableToFrameSrc=true`.
2. Make the app send `bridge-ready`, then `bridge-event` with the shell `id` (copy `src/public/app.js`).
3. Send `frame-ancestors` with the Lightning origin from the app.
4. Add `externalAppEmbed` to the target page and set `appUrl`.
