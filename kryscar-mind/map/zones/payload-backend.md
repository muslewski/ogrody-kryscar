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
  anchors: ["symbol:Admins", "symbol:Media", "symbol:Services", "symbol:generateBlurDataURL"]
  globs: ["src/payload.config.ts", "src/collections/Admins.ts", "src/collections/Media.ts", "src/collections/Services.ts", "src/collections/hooks/**", "src/app/(payload)/**", "scripts/seed.ts", "next.config.ts"]
depends: []
invariants:
  - rule: "payload.config.ts reads process.env directly (NOT src/lib/env.ts) — it is loaded by `payload generate:types` where DB/secret env may be absent"
    enforcedBy: []
  - rule: "the project is ESM (package.json type:module) — required for Payload config resolution and `payload generate:types`"
    enforcedBy: []
  - rule: "Media files are stored on Vercel Blob (BLOB_READ_WRITE_TOKEN); when the token is absent the plugin self-disables and falls back to local storage — no build-time token needed"
    enforcedBy: []
verifiedAt: "0edd4d16cb23146fd271d9276b0bc776d44adb10"
---
## Purpose
Payload owns the Postgres database (Neon, `idType: 'uuid'`) and the `/admin` panel. Staff/devs log in via the `admins` collection (Payload-native `auth: true`). `next.config.ts` is wrapped with `withPayload` so the admin bundles (incl. its CSS); the `(payload)` route group holds `/admin` + Payload REST/GraphQL. `scripts/seed.ts` idempotently seeds the single Kryscar tenant and the 8 catalog services (with images uploaded to Blob).

The `services` collection stores the full service record (slug, name, category, order, price, hero content, tenant, and a media relation). `lib/catalog.getCatalogServices` (async) + `lib/services` accessors read this collection (see [[service-catalog]], [[service-pages]]).

The `media` collection handles image uploads with two sizes (thumbnail 400px, card 768px). Files land on Vercel Blob (via `@payloadcms/storage-vercel-blob`). The `generateBlurDataURL` beforeChange hook mirrors `scripts/gen-blur.mjs`: resizes to 16px, encodes as WebP quality-40, stores `"data:image/webp;base64,…"` on `blurDataURL` — enabling `placeholder="blur"` for Payload-served images via the `MediaImage` wrapper (see [[image-loading]]).
## Anchors
`Admins` (the admin auth collection), `Services` (catalog service collection), `Media` (uploads collection), `generateBlurDataURL` (blur hook), `src/payload.config.ts` (collections + storage plugin + postgres adapter), `src/app/(payload)/**` (admin + API), `scripts/seed.ts`.
## Lineage
sources → [[2026-06-03-payload-better-auth-foundation-design]]; build/ESM choices → [[payload-esm-and-kysely-pin]]; services collection → [[services-as-payload-collection]]; Blob+blur → [[media-vercel-blob-blur-hook]].
