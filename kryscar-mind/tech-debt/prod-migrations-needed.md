---
type: debt
summary: "Schema is created via Payload dev push locally; production needs a real migration before first deploy."
tags: [data, build]
status: open
created: 2026-06-03
updated: 2026-06-04
related: ["[[payload-backend]]", "[[payload-esm-and-kysely-pin]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
severity: med
effort: low
---
## Problem
Locally, `getPayload` (dev) auto-pushes the Postgres schema (verified against Neon). Production (`NODE_ENV=production`) does NOT push — it expects migrations. There are none yet, so a fresh prod deploy would have no tables. Also: `scripts/seed.ts` relies on the env being loaded (e.g. `tsx --env-file=.env`); document that for CI/Vercel.

The `services` collection (8 catalog services, added 2026-06-04), the `media` collection (Vercel Blob, blur hook), and the `lawns` collection (customer "My Lawn" 3a, added 2026-06-04) were also created via dev push and likewise need a production migration baseline alongside the original `admins`/tenant tables.

3b.1 (Service Selection & Pricing, 2026-06-04) added two more schema changes via dev push: the **`services.pricing` columns** (the new `pricing` group: kind + basePrice/pricePerM2/pricePerUnit/unitLabel/recurring) on the existing `services` table, and a brand-new **`service_requests` table** (owner, lawn rel, items array sub-table, estMin/estMax, note, status) plus its related Payload system tables. Both need to be in the production migration baseline.
## Fix
Run `payload migrate:create` to generate the initial migration from the schema (covering `admins`, `media`, `services` — including the new `pricing` columns — `lawns`, `service_requests`, and all related Payload system tables), commit `src/migrations/*`, and run `payload migrate` in the deploy step (and seed the Kryscar tenant + services). Medium severity (blocks first prod deploy), low effort.
