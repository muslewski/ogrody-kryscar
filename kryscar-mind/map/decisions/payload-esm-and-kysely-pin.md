---
type: decision
summary: "Three integration fixes that make the Payload + Better Auth + Next 16 (Turbopack) build green: type:module, withPayload, and a kysely@0.28 override."
tags: [build, auth]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[payload-backend]]", "[[customer-auth]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
Adding Payload + Better Auth to the existing Next 16 marketing site surfaced three build/runtime integration issues, none obvious.
## Decision
1. **`"type": "module"`** in package.json — Payload's config + `payload generate:types` need ESM resolution (extensionless imports failed otherwise). All root configs were already ESM-safe.
2. **`withPayload(nextConfig)`** — owns Payload's bundling incl. its admin CSS. Do NOT put `@payloadcms/*` in `serverExternalPackages` (externalizing them makes Node load their `.css` imports → ERR_UNKNOWN_FILE_EXTENSION at build).
3. **`overrides: { kysely: "0.28.17" }`** — `@better-auth/kysely-adapter` (dead code for us; we use the Payload adapter) imports kysely exports removed in 0.29; npm resolved 0.29 over the working 0.28. Turbopack statically bundles the dead adapter, so the pin is required.
## Why
Each is a hard build error or silent ESM failure; all three match delieta's working tree.
## Consequences
`npm run build` green (52 static pages, /admin + /api/auth compile). Prod needs Payload migrations, not dev push — see debt [[prod-migrations-needed]].
