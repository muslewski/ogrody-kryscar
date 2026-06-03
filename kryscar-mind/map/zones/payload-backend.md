---
type: zone
summary: "Payload CMS as the app backend: the /admin panel (staff/dev auth via the admins collection), the Postgres (Neon) adapter, ESM/withPayload wiring, and the seed."
tags: [feature, data, auth]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[customer-auth]]", "[[tenancy-and-roles]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
owns:
  routes: ["/admin"]
  anchors: ["symbol:Admins"]
  globs: ["src/payload.config.ts", "src/collections/Admins.ts", "src/app/(payload)/**", "scripts/seed.ts", "next.config.ts"]
depends: []
invariants:
  - rule: "payload.config.ts reads process.env directly (NOT src/lib/env.ts) — it is loaded by `payload generate:types` where DB/secret env may be absent"
    enforcedBy: []
  - rule: "the project is ESM (package.json type:module) — required for Payload config resolution and `payload generate:types`"
    enforcedBy: []
verifiedAt: "f51a2305c2c1052a667a67ee2c10e0458843d733"
---
## Purpose
Payload owns the Postgres database (Neon, `idType: 'uuid'`) and the `/admin` panel. Staff/devs log in via the `admins` collection (Payload-native `auth: true`). `next.config.ts` is wrapped with `withPayload` so the admin bundles (incl. its CSS); the `(payload)` route group holds `/admin` + Payload REST/GraphQL. `scripts/seed.ts` idempotently seeds the single Kryscar tenant.
## Anchors
`Admins` (the admin auth collection), `src/payload.config.ts` (collections + postgres adapter), `src/app/(payload)/**` (admin + API), `scripts/seed.ts`.
## Lineage
sources → [[2026-06-03-payload-better-auth-foundation-design]]; build/ESM choices → [[payload-esm-and-kysely-pin]].
