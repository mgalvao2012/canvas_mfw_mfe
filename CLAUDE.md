# sdo-261007-prod

## Gotchas

- **Agentforce Conversation Client (ACC) in UI bundles stays invisible when the agent is unreachable.** The widget is mounted with `opacity: 0` and only shown on the `accready` event. `Lightning Out ready` in the console does NOT mean the chat loaded. Silent failure causes: placeholder/invalid `agentId`, or the user lacking agent access.
- **Employee Agents need explicit `<agentAccesses>` in a permission set** — even System Admin can't load them otherwise. Check with `SELECT Parent.Name FROM SetupEntityAccess WHERE SetupEntityId = '<0Xx id>'`.
- **Deploying `<agentAccesses>` via `sf project deploy start` was silently ignored** in this org (result `Succeeded` / state `Unchanged`, SetupEntityAccess stayed empty). Granting via Setup → Permission Set → Agent Access worked and retrieves as the exact same XML. Always verify with SetupEntityAccess after deploy.
- **Salesforce Mobile App renders the ACC "Start a chat" FAB even when the agent is unusable**; desktop LEX does not. Don't use mobile as proof the config works.
- **[OPEN, 2026-10-09] ACC 12.11.0 floating FAB never shows in desktop browsers**, even with valid active Employee agent + agent access. LO emits `ready` but `runtime_copilot-acc-sdk-wrapper` never fires `accready`; bridge `open()` stays pending; no console errors. Ruled out: LEX embedding (fails top-level too), Chrome profile/extensions (Safari fails too), form factor (Chrome iPhone emulation fails too). Only Salesforce Mobile App WebView shows the FAB. Undocumented — escalate, don't keep guessing.
