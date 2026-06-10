---
type: debt
summary: "RESOLVED — production migrations are wired: push:false in prod, a committed baseline migration (all collections), and `payload migrate` in the Vercel build."
tags: [data, build]
status: resolved
created: 2026-06-03
updated: 2026-06-10
related: ["[[payload-backend]]", "[[payload-esm-and-kysely-pin]]", "[[prod-migrations]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
severity: med
effort: low
---
## Problem
Locally, `getPayload` (dev) auto-pushes the Postgres schema (verified against Neon). Production (`NODE_ENV=production`) does NOT push — it expects migrations. There were none, so a fresh prod deploy would have no tables.

## Resolution (2026-06-10)
Done in the team-schedule MVP branch. The postgres adapter now sets
`push: process.env.NODE_ENV !== "production"` — dev keeps fast schema push, prod
NEVER pushes and runs the committed SQL migrations in `src/migrations`. The baseline
migration (`src/migrations/20260610_171222.ts`) covers EVERY collection — admins,
the BA models (users/sessions/accounts/verifications), tenants, media, services
(incl. the `pricing` columns), lawns, service_requests (incl. the widened 6-value
status enum + declineReason), the new visits table, and the plugin's
payload_mcp_api_keys — plus all Payload system tables. It was generated with
`payload migrate:create`, then **applied and smoke-tested against a real Postgres 18**
(full request→accept→visit→done/decline/cancel lifecycle green), and `next build`
passed end-to-end with the prod command.

`package.json` adds `migrate` / `migrate:create` / `migrate:status`, and the prod
build is `payload migrate && next build`, so Vercel applies pending migrations before
building. Rationale + the future-change workflow: decision [[prod-migrations]].

## First-deploy note (carried forward)
The prod Neon DB may still hold tables from earlier dev-pushes WITHOUT a
`payload_migrations` ledger. Because the baseline does `CREATE TABLE`, it must run
against a clean schema: drop the prod public schema (the team confirmed no real prod
data yet) — or point at a fresh Neon branch — then `payload migrate` baselines it.
The exact steps live in the deploy runbook (decision [[prod-migrations]]).
