# OpportunityManager

Opportunity pipeline chart and list for an Account. Custom Application (`c__OpportunityManager`) and also embedded in the Account record page through the `opportunityManagerEmbed` LWC (`lightning-ui-embedding`), which requires `public/sf-embedding-heartbeat.js`.

This UI Bundle lives inside the SFDX project `demo-org` (project root = directory with `force-app/` and `sfdx-project.json`). Stack: React, Vite, TypeScript, Tailwind, shadcn/ui, `@salesforce/platform-sdk`.

## Run (development)

From `force-app/main/default/uiBundles/OpportunityManager`:

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
(cd force-app/main/default/uiBundles/OpportunityManager && npm install && npm run build)
sf project deploy validate --source-dir force-app/main/default/uiBundles/OpportunityManager --target-org <alias>
# after approval: sf project deploy start (same --source-dir flag)
```

After deploying, assign the `OpportunityManager_Access` permission set and open the app from the App Launcher.

## Test

```bash
npm run test         # Vitest
npm run test:e2e     # Playwright (requires: npx playwright install chromium)
```
