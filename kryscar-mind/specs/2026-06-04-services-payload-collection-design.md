---
type: spec
summary: "Sub-project 2 of the customer-portal arc: model services as a Payload `services` collection (full service — catalog fields + price + landing content + tenant), add a `media` collection backed by Vercel Blob storage with a sharp blur-up hook, migrate the async accessors (catalog + /uslugi) to read Payload, and seed the 8 existing services. Live marketing consumers switch source; design-variant pages stay on the static arrays."
tags: [payload, services, data, media]
status: active
created: 2026-06-04
related: ["[[payload-backend]]", "[[service-catalog]]", "[[service-pages]]", "[[city-landing-pages]]", "[[tenancy-and-roles]]", "[[image-loading]]"]
supersedes: []
---

# Services → Payload collection — design

## Context

**Sub-project 2** of the customer-portal arc (1 app shell ✓ → **2 services-as-Payload** →
3 customer lawn MVP → 4 page-builder). It makes the service catalog CMS-editable and is
the data source the customer panel's service picker (sub-project 3) will read.

A "service" today is stitched from three code layers:
- `src/lib/data.ts` — `SERVICES` (slug, category, title, short, **description**, icon) +
  `SERVICE_BADGES` (per-slug `{ label, tone: "primary"|"accent" }`) + `CATEGORIES` (static
  taxonomy `{ id, label }`).
- `src/lib/catalog.ts` — `getCatalogServices()` (SYNC) enriches `SERVICES` with `SERVICE_IMAGES`
  (slug → `/img/garden/…` path) + `PRICES` (slug → `{ from, duration }`).
- `src/lib/services.ts` — `SERVICE_CONTENT` (landing content: `hero[]`, `includes[]`,
  `pricingNote`, `faq[]`, `metaTitle`, `metaDescription`) + `compose()` + the **async**
  accessors `getAllServices` / `getServiceBySlug` / `getServiceSlugs`.

Consumers:
- **Live, migrate to Payload:** the homepage (`(public)/example-9` via `getCatalogServices()`),
  city pages (`/ogrodnik/[miasto]` via `getCatalogServices()`), realizacje detail
  (`/realizacje/[slug]` via `getCatalogServices().find`), `/uslugi/[usluga]` (async accessors),
  `sitemap.ts` (`getServiceSlugs()`), and the `ServiceCatalog` island.
- **Stay static:** the design-variant pages `example-1,4,6,7,8` import the raw `SERVICES`
  array directly — they are throwaway design experiments ([[homepage-and-variants]]); they keep
  using the static array.

Infra facts: Payload 3.85, `idType:'uuid'`, `lexicalEditor()` configured; collections registered
in `payload.config.ts` as a plain array; `sharp` 0.34.5 is installed and `scripts/gen-blur.mjs`
already uses `sharp(file).resize(16).webp({quality:40}).toBuffer()` → base64 for blur placeholders
(the media hook reuses this). Tenancy seam: `Tenants.ts` documents that "domain rows carry
`tenant` from birth" — so `services` carries a `tenant` relationship like `users`.

## Decisions (from brainstorming)

- **Full service** in one collection (catalog + price + landing content + SEO), not catalog-only.
- **Real media uploads** (a `media` collection) **now**, not a static path string — backed by
  **Vercel Blob storage**, with a **sharp blur-up hook** so the instant-preview quality is kept.
- Landing content as **structured fields** (matching the current `/uslugi` rendering), NOT richText.
- `CATEGORIES` stays a **static taxonomy**; `services.category` is a select over its ids.
- **Design-variant pages stay** on the static `SERVICES`/`SERVICE_BADGES` arrays; only the live
  consumers migrate. The arrays remain in `data.ts` as the seed source + variant data.
- Services carry a **`tenant`** relationship (default Kryscar), consistent with the tenancy seam.

## Goals

- `Services` + `Media` appear in `/admin`; editing a service (text, price, image, content) reflects
  on the live frontend.
- The live catalog, `/uslugi/[slug]`, city pages, realizacje detail, and the sitemap all read from
  Payload, with the blur-up image quality preserved.
- Uploaded media persist on Vercel Blob in production.

## Non-goals (scope boundary)

- No customer-panel service picker (sub-project 3), no page-builder (sub-project 4).
- No migration of projects / guides / winter / locations to Payload — they keep their static data
  layers and `BlurImage`/`BLUR_DATA` ([[image-loading]]).
- No change to the design-variant pages.
- No retiring of `BLUR_DATA`/`BlurImage` — they still serve all non-service static images.

## Architecture

### A. `media` collection (`src/collections/Media.ts`)
- `slug: "media"`, `upload: { imageSizes: [...] , mimeTypes: ["image/*"] }`, `admin.group: "Content"`.
- Fields: `alt` (text, required), `blurDataURL` (text, admin-readOnly — set by the hook).
- **Blur hook** (`hooks.beforeChange` or `beforeOperation` on create/update with a file): read the
  uploaded buffer, `sharp(buffer).resize(16).webp({ quality: 40 }).toBuffer()`, set
  `data.blurDataURL = "data:image/webp;base64," + buf.toString("base64")`. (Mirrors `gen-blur.mjs`.)
  Implemented in a small `src/collections/hooks/generate-blur.ts` so it is testable in isolation.

### B. Vercel Blob storage (`payload.config.ts`)
- Add dependency `@payloadcms/storage-vercel-blob` (matching `^3.85.0`).
- Register the plugin in `plugins: [vercelBlobStorage({ collections: { media: true }, token: process.env.BLOB_READ_WRITE_TOKEN })]`.
- `payload.config.ts` reads `process.env` directly (NOT `src/lib/env.ts`) — matches the existing
  config invariant. `BLOB_READ_WRITE_TOKEN` is the new env var (added to `.env` for dev + Vercel for
  prod by the user; the user provisions the Blob store).

### C. `services` collection (`src/collections/Services.ts`)
- `slug: "services"`, `admin: { useAsTitle: "title", group: "Catalog" }`, `idType` inherited (uuid).
- Fields:
  - `slug` (text, required, unique, index), `order` (number, required — catalog sort)
  - `title` (text, required), `short` (text, required), `description` (textarea, required)
  - `category` (select, required, options = CATEGORIES ids: trawnik/ciecie/sadzenie/porzadki/projekt)
  - `icon` (select, required, options: scissors/leaf/rake/sprout/hedge/broom/compass/flowers)
  - `badge` (group, optional: `{ label: text, tone: select(primary|accent) }`)
  - `priceFrom` (text, required), `duration` (text, required)
  - `image` (upload, relationTo: "media", required)
  - `hero` (array, required: `{ paragraph: textarea }`)
  - `includes` (array, required: `{ item: text }`)
  - `pricingNote` (textarea, required)
  - `faq` (array: `{ question: text, answer: textarea }`)
  - `seo` (group: `{ metaTitle: text, metaDescription: textarea }`)
  - `tenant` (relationship → tenants, required) — assigned by a `beforeChange` hook when unset
    (reuse the same default-Kryscar logic as `Users.ts`; extract it to a shared
    `src/collections/hooks/assign-default-tenant.ts` so both collections share one implementation).
- Register both collections in `payload.config.ts` `collections: [..., Tenants, Media, Services]`.

### D. Accessor migration (the seam)
- `src/lib/catalog.ts`: `getCatalogServices()` becomes **async** and reads Payload
  (`getPayload({config}).find({ collection: "services", sort: "order", depth: 1, limit: 100 })`),
  projecting each doc to the existing `CatalogItem` shape PLUS the image as
  `{ url, blurDataURL, alt }` (from the populated `image` media doc). `SERVICE_IMAGES`/`PRICES`
  maps are deleted (now in Payload).
- `src/lib/services.ts`: `compose()` reads Payload (or composes from the same find), keeping the
  `ServicePage` shape (now image = `{ url, blurDataURL, alt }`); `getAllServices`/`getServiceBySlug`/
  `getServiceSlugs` stay the same signatures. `SERVICE_CONTENT` is deleted (now in Payload).
- Live sync consumers gain `await`: `example-9/page.tsx`, `ogrodnik/[miasto]/page.tsx`,
  `realizacje/[slug]/page.tsx` (all server components — `await getCatalogServices()`).
- `data.ts`: `SERVICES`, `SERVICE_BADGES`, `CATEGORIES` REMAIN (seed source + variant data).

### E. Image rendering (keep blur-up)
- The `CatalogItem` / `ServicePage` `img` field is replaced by `image: { url, blurDataURL, alt }`.
- The service-image renderers — `ServiceCatalog` (cards), `/uslugi/[slug]` hero, city pages,
  realizacje detail — render `next/image` with `src={image.url}` `placeholder="blur"`
  `blurDataURL={image.blurDataURL}` `alt={image.alt}`. A tiny shared `MediaImage` wrapper
  (`src/components/MediaImage.tsx`) encapsulates this (parallel to `BlurImage`, but for Payload media).
- `BlurImage`/`BLUR_DATA` are UNTOUCHED — still used by projects, guides, winter, the auth hero, etc.

### F. Seed (`scripts/seed-services.ts`, idempotent)
- Run via `npx tsx --env-file=.env scripts/seed-services.ts` (mirrors the existing seeds).
- Ensures the Kryscar tenant exists. For each of the 8 services (from the current `SERVICES` order):
  1. Upload its photo (read `public${SERVICE_IMAGES[slug]}` from disk) into `media` via the Local
     API (`payload.create({ collection: "media", data: { alt }, filePath })`) — the blur hook fires.
     Upsert by a deterministic key (e.g. existing media with matching `alt`/filename → reuse).
  2. Upsert the `services` doc by `slug` (find → update, else create), composing every field from
     `SERVICES` + `SERVICE_BADGES` + `PRICES` + `SERVICE_IMAGES` + `SERVICE_CONTENT`, linking the media
     id, `order` = index, `tenant` = Kryscar.
- The source maps live in the seed (copied from the current catalog.ts/services.ts before those are
  trimmed), so the seed is self-contained.

## Data flow
1. Editor edits a `services` doc (or uploads `media`) in `/admin` → Payload (Neon) + Vercel Blob.
2. Live page (server) → `getCatalogServices()` / `getAllServices()` → `getPayload().find` → projects
   to `CatalogItem`/`ServicePage` with `image:{url,blurDataURL,alt}`.
3. Component renders `MediaImage` (next/image + placeholder blur). Marketing pages keep daily ISR
   (`revalidate=86400`), so edits show within a day (or immediately in dev).

## Edge cases
- **Missing media / blurDataURL:** `MediaImage` falls back to `placeholder="empty"` when
  `blurDataURL` is absent (defensive — the hook should always set it).
- **A slug authored in SERVICES without a Payload doc** (post-migration drift): `getServiceBySlug`
  returns null → `/uslugi/[slug]` 404s (current behavior preserved).
- **Blob token absent in an env:** Payload admin media upload fails loudly; reads of already-stored
  media still work (URLs are absolute). Documented in the env note.
- **`depth`/N+1:** a single `find({depth:1})` populates the `image` media per service — fine for ~8 rows.
- **Tenancy:** every service gets `tenant`=Kryscar via the shared hook; access stays open for reads
  (public catalog) — admin-write is gated by the `admins` collection as today.

## Testing / verification
- `npm run check` (tsc + eslint + payload generate:types regenerates `services`/`media` types + mind).
- `npm run build` succeeds; marketing routes stay `○` where they were (catalog pages remain ISR `○`,
  not flipped to `ƒ`).
- `npx tsx --env-file=.env scripts/seed-services.ts` runs clean against Neon; re-running is idempotent.
- `/admin` shows **Services** + **Media**; a service has its image, price, content, tenant.
- Browser: the homepage catalog, `/uslugi/[slug]`, a city page, and a realizacje detail render from
  Payload with blur-up intact; editing a service `title`/`priceFrom` in `/admin` changes the frontend.

## Mind maintenance (on finish)
- Update zones [[service-catalog]] + [[service-pages]] (source is now Payload; accessor bodies read
  the collection; image is media) and re-stamp `verifiedAt`.
- Update [[payload-backend]] (new `media` + `services` collections, Vercel Blob storage).
- New decision records: "services-as-payload-collection" (the migration + why full service) and
  "media-vercel-blob-blur-hook" (uploads on Blob + sharp blur placeholder).
- Tech-debt note if any (e.g. variants still on static arrays; projects/guides/winter not yet migrated).
- `npm run mind` + commit the regenerated index.
