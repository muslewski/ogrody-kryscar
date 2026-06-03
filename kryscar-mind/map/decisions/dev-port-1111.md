---
type: decision
summary: "Local dev/start run on port 1111 (not 3000) — baked into the npm scripts and the auth-origin fallbacks — because 3000 collides with other local projects on this machine."
tags: [build, auth]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[customer-auth]]", "[[payload-backend]]"]
sources: []
decided: 2026-06-03
supersededBy: ""
---
## Context
Port 3000 is occupied by the user's other local projects, so assuming it for this app causes conflicts and breaks Better Auth's same-origin check in dev.
## Decision
The dev port is **1111**, fixed in three places so it never has to be remembered:
- `package.json` — `dev: "next dev -p 1111"`, `start: "next start -p 1111"`.
- `src/lib/base-url.ts` — the localhost dev fallback is `http://localhost:1111`.
- `src/lib/auth.ts` — the hardcoded trusted-origin localhost entry is `http://localhost:1111`.
Local `.env` (gitignored) sets `NEXT_PUBLIC_APP_URL` / `BETTER_AUTH_URL` to `http://localhost:1111`.
## Why
A single distinctive dev port avoids 3000 collisions and keeps Better Auth's `trustedOrigins` satisfied in dev with zero per-run configuration — even on a fresh clone with no `.env` (the fallback already resolves to 1111).
## Consequences
`npm run dev` / `npm run start` serve on 1111; verified in-browser (`/admin`, `/sign-in`, gates) on 1111. Production is unaffected — Vercel resolves the origin from `VERCEL_*` vars, never the localhost fallback.
