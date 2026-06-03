---
type: debt
summary: "Schema is created via Payload dev push locally; production needs a real migration before first deploy."
tags: [data, build]
status: open
created: 2026-06-03
updated: 2026-06-03
related: ["[[payload-backend]]", "[[payload-esm-and-kysely-pin]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
severity: med
effort: low
---
## Problem
Locally, `getPayload` (dev) auto-pushes the Postgres schema (verified against Neon). Production (`NODE_ENV=production`) does NOT push — it expects migrations. There are none yet, so a fresh prod deploy would have no tables. Also: `scripts/seed.ts` relies on the env being loaded (e.g. `tsx --env-file=.env`); document that for CI/Vercel.
## Fix
Run `payload migrate:create` to generate the initial migration from the schema, commit `src/migrations/*`, and run `payload migrate` in the deploy step (and seed the Kryscar tenant). Medium severity (blocks first prod deploy), low effort.
