---
type: zone
summary: "Payload CMS as the app backend: the /admin panel (staff/dev auth via the admins collection), the Postgres (Neon) adapter, ESM/withPayload wiring, Media collection (Vercel Blob + blur hook), and the seed."
tags: [feature, data, auth]
status: active
created: 2026-06-03
updated: 2026-06-04
related: ["[[customer-auth]]", "[[tenancy-and-roles]]", "[[image-loading]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
owns:
  routes: ["/admin"]
  anchors: ["symbol:Admins", "symbol:Media", "symbol:generateBlurDataURL"]
  globs: ["src/payload.config.ts", "src/collections/Admins.ts", "src/collections/Media.ts", "src/collections/hooks/generate-blur.ts", "src/app/(payload)/**", "scripts/seed.ts", "next.config.ts"]
depends: []
invariants:
  - rule: "payload.config.ts reads process.env directly (NOT src/lib/env.ts) — it is loaded by `payload generate:types` where DB/secret env may be absent"
    enforcedBy: []
  - rule: "the project is ESM (package.json type:module) — required for Payload config resolution and `payload generate:types`"
    enforcedBy: []
  - rule: "Media files are stored on Vercel Blob (BLOB_READ_WRITE_TOKEN); when the token is absent the plugin self-disables and falls back to local storage — no build-time token needed"
    enforcedBy: []
verifiedAt: "c17d0152551d4f0f88e27feec9a720b633afb905"
---
## Purpose
Payload owns the Postgres database (Neon, `idType: 'uuid'`) and the `/admin` panel. Staff/devs log in via the `admins` collection (Payload-native `auth: true`). `next.config.ts` is wrapped with `withPayload` so the admin bundles (incl. its CSS); the `(payload)` route group holds `/admin` + Payload REST/GraphQL. `scripts/seed.ts` idempotently seeds the single Kryscar tenant.

The `media` collection handles image uploads with two sizes (thumbnail 400px, card 768px). Files land on Vercel Blob (via `@payloadcms/storage-vercel-blob`). The `generateBlurDataURL` beforeChange hook mirrors `scripts/gen-blur.mjs`: resizes to 16px, encodes as WebP quality-40, stores `"data:image/webp;base64,…"` on `blurDataURL` — enabling `placeholder="blur"` for Payload-served images (see [[image-loading]]).
## Anchors
`Admins` (the admin auth collection), `Media` (uploads collection), `generateBlurDataURL` (blur hook), `src/payload.config.ts` (collections + storage plugin + postgres adapter), `src/app/(payload)/**` (admin + API), `scripts/seed.ts`.
## Lineage
sources → [[2026-06-03-payload-better-auth-foundation-design]]; build/ESM choices → [[payload-esm-and-kysely-pin]].
