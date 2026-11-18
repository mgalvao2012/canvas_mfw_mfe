# Security

## What is protected

| Control | Where |
|---|---|
| Only Lightning origins can frame the app | `Content-Security-Policy: frame-ancestors 'self' <SF_ORIGIN>` in `src/server.js` |
| Salesforce allows only the tunnel as `frame-src` | `FinancialAccounts` CSP Trusted Site (`isApplicableToFrameSrc`, `isApplicableToStyleSrc`); camera/microphone off |
| Messages accepted only from the shell | `src/public/app.js` checks `e.source === window.parent` and `e.origin` in `SF_ORIGIN` |
| iframe sandbox | `lwc-shell` forces `allow-scripts allow-same-origin allow-pointer-lock`; `externalAppEmbed` adds `allow-forms allow-modals`; `allow-top-navigation` and `allow-popups` are blocked |
| Secrets stay out of git | `.env`, `data/` and `node_modules/` are ignored in `src/.gitignore`; `.dev/` in the root `.gitignore` |
| DOM output | The front end builds cells with `textContent`, never `innerHTML` |

## Residual risks

- **No authentication on `/api/financial-accounts`.** Anyone with the tunnel URL can read the data of any `accountId`. Acceptable only for demo data. For real data, authenticate the call (Salesforce user token validation, or a signed token issued by the host LWC) and authorize the Account.
- **Quick tunnel URL is public** while the script runs. It is random but not secret; stop the script when not in use.
- **Outbound `postMessage` uses `'*'`** in the app (`bridge-ready`, `bridge-event`). The payloads carry no secrets (ready flag, height).
- **`dados.json` contains Account Ids and amounts** committed to the repo. Treat them as demo data.
- **`allow-same-origin` + `allow-scripts`** in the sandbox is required by the shell. The embedded app runs on its own origin, so it cannot read Salesforce cookies, but it is fully trusted to render in the page.
- **Production deploys.** Every tunnel run changes CSP Trusted Sites in a Production org. Review the printed URL before confirming.

## CRUD App (Canvas SSO)

Full model in [`docs/security.md` of the CRUD repo](https://github.com/mgalvao2012/nodejs-sso-salesforce/blob/main/docs/security.md). Summary:

- `POST /auth/canvas` creates a session only after: trusted `Origin`, valid HMAC-SHA256 signature, expected org Id, single-use payload (24 h), active token introspection, `client_id` equals the consumer key, user/org match, and a local user linked by `sf_user_id`.
- Who may use SSO is enforced by Salesforce: ECA with admin-approved users, pre-authorized only for `NodeCrud_Access`. Watch the Setup Audit Trail for changes to `NodeCrudEca`.
- Sessions: `HttpOnly; Secure; SameSite=None; Partitioned` cookie; Canvas sessions 15 min, local sessions 8 h.
- Cutting a user's SSO: remove `NodeCrud_Access` **and** clear their Salesforce User Id in the app.
- Consumer secret rotation, logs and alerting (`auth.canvas.rejected`) are documented in the CRUD repo.

## Credentials

- Never print or commit `.env` files, tokens, keys or ECA secrets. `scripts/dev-tunnel.sh` reads only `PORT` from `src/.env`.
- `NodeCrudEca` and `React_Agentforce_Demo` are External Client Apps; their consumer secrets are managed in the org (and, for `NodeCrudEca`, in the CRUD app's git-ignored `.env`), never in this repo.
