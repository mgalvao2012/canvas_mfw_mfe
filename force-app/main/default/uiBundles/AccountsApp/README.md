# AccountsApp

Custom Application (`c__AccountsApp`) for browsing Accounts. Its `public/sf-embedding-heartbeat.js` is the reference copy for other bundles embedded via `lightning-ui-embedding`.

This UI Bundle lives inside the SFDX project `demo-org` (project root = directory with `force-app/` and `sfdx-project.json`). Stack: React, Vite, TypeScript, Tailwind, shadcn/ui, `@salesforce/platform-sdk`.

## Run (development)

From `force-app/main/default/uiBundles/AccountsApp`:

```bash
npm install
npm run dev          # Vite dev server (e.g. http://localhost:5173)
npm run dev:design   # design mode
```

## Build

```bash
npm run build        # output in dist/ (git-ignored)
```

## Deploy

**`demo-org` is a Production org.** Run `sf org display` first, validate, and get explicit approval before `deploy start`. From the project root:

```bash
(cd force-app/main/default/uiBundles/AccountsApp && npm install && npm run build)
sf project deploy validate --source-dir force-app/main/default/uiBundles/AccountsApp --target-org <alias>
# after approval: sf project deploy start (same --source-dir flag)
```

After deploying, assign the `AccountsApp_Access` permission set and open the app from the App Launcher.

## Test

```bash
npm run test         # Vitest
npm run test:e2e     # Playwright (requires: npx playwright install chromium)
```
