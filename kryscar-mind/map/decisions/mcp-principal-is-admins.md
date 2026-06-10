---
type: decision
summary: "@payloadcms/plugin-mcp authenticates each /api/mcp request as an `admins`-collection principal running with overrideAccess:false; the closed ops collections (lawns/service-requests/visits) gate on `mcpOnly` (req.user.collection === 'admins') instead of () => false, so MCP gets CRUD while customers stay denied."
tags: [payload, mcp, access-control, security]
status: active
created: 2026-06-10
updated: 2026-06-10
related: ["[[payload-backend]]", "[[customer-lawns]]", "[[service-requests]]"]
sources: []
decided: 2026-06-10
supersededBy: ""
---
## Context
Task 11 exposes the ops collections (services, service-requests, lawns, visits, tenants) for full CRUD over MCP at `/api/mcp` via `@payloadcms/plugin-mcp@3.85.0` (exact peer-match to payload@3.85.0; the floating `@payloadcms/plugin-mcp@3.85.1` peers on payload@3.85.1 and would not resolve — pinning to 3.85.0 avoids `--force`). `lawns`, `service-requests`, `visits` were hard-closed (`access: { read/create/update/delete: () => false }`) because the app reaches them only via the owner-scoped Local API. MCP CRUD inherits the API key's access, so a closed collection would be invisible to MCP.

## Investigation (read the installed dist — not docs)
`node_modules/@payloadcms/plugin-mcp/dist`:
- `collections/createApiKeysCollection.js` — the plugin registers an auth-enabled collection `payload-mcp-api-keys` (`auth: { disableLocalStrategy: true, useAPIKey: true }`) with a required `user` relationship to `userCollection`.
- `endpoints/mcp.js` — on each request it hashes the Bearer key, finds the `payload-mcp-api-keys` row, takes `docs[0].user` (the related user doc) and sets `user.collection = pluginOptions.userCollection` and `user._strategy = 'mcp-api-key'`. `userCollection` defaults to `config.admin.user` (= our `admins`).
- `mcp/getMcpHandler.js` — `const user = mcpAccessSettings.user`; passes it to every tool.
- `mcp/tools/resource/{find,create,update,delete}.js` — all call `payload.{find,create,update,delete}` with **`overrideAccess: false`** and **`user`**.

So this is **path A** (the access-principal path), NOT overrideAccess:true. An authenticated MCP request reaches access functions as a real principal with `req.user.collection === userCollection`.

## Decision
Pin `userCollection: "admins"` (explicit, = the default) and add `src/collections/access/mcp.ts`:
`export const mcpOnly: Access = ({ req }) => req.user?.collection === "admins"`.
Change `lawns`, `service-requests`, `visits` access from `() => false` to `mcpOnly` for all four ops. `services` (create/update/delete unset → admin-only) and `tenants` (no access → admin-only) already admit the `admins` principal, so they need no carve-out and were left untouched. Only services/service-requests/lawns/visits/tenants are listed in the plugin's `collections` — auth collections (users/sessions/accounts/verifications), admins, and media have no MCP surface.

## Why `admins`, not a dedicated slug
The principal's `.collection` is whatever `userCollection` is, and the plugin's `user` relation is `required` — making the api-keys collection self-referential would be clunky. `admins` is the same privileged identity that already sees these collections in /admin, and the codebase already uses `req.user?.collection === "admins"` as the admin discriminator (Users.ts `adminOnlyAccess`). Crucially it can NEVER match a customer (`users`), so the data-layer ownership boundary is preserved: customer reads still flow through the owner-scoped Local API in src/lib/{lawns,requests,visits}.ts, never through these access functions.

## Consequences
- An MCP API key reaches all customer ops data — it is an admin-equivalent credential. README documents "treat like an admin password".
- The plugin adds its own `payload-mcp-api-keys` collection to payload-types.ts (expected); it is NOT part of the MCP surface.
- `mcpOnly` also widens these three collections to /admin superadmins (previously `() => false`). For lawns this matches the prior intent (the old comment already said "/admin superadmins still see them"); for service-requests/visits it is a deliberate, security-neutral broadening to the admin principal only.
