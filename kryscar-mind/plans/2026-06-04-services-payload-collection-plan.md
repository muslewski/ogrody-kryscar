# Services → Payload Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Model the 8 services as a Payload `services` collection (full service: catalog fields + price + landing content + tenant), add a `media` collection backed by Vercel Blob with a sharp blur-up hook, migrate the async accessors to read Payload, and seed the existing data — so the live marketing catalog + `/uslugi/[slug]` pages are CMS-driven, with the customer-panel picker (sub-project 3) unblocked.

**Architecture:** Two new Payload collections (`media` upload + `services`) registered in `payload.config.ts`, with the `@payloadcms/storage-vercel-blob` plugin for production-durable uploads and a `beforeChange` sharp hook that writes a base64 blur placeholder onto each media doc. The data accessors (`getCatalogServices`, `compose`/`getAllServices`/`getServiceBySlug`/`getServiceSlugs`) are rewritten to read Payload; `getCatalogServices` becomes async and its few server-component callers gain an `await`. The static `SERVICES`/`SERVICE_BADGES`/`CATEGORIES` arrays stay in `data.ts` (seed source + design-variant pages); the per-service content/price/image maps move to a seed-only module. An idempotent seed uploads the 8 photos and upserts the service docs.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, PayloadCMS 3.85 (`@payloadcms/db-postgres`, `@payloadcms/storage-vercel-blob`), Neon Postgres, sharp, Tailwind v4.

**Verification model:** No unit-test framework. The gate is `npm run check` (`tsc --noEmit && eslint && payload generate:types && node scripts/mind/generate.mjs`) + `npm run build` + a manual browser pass at `http://localhost:1111`. Each task ends by running the gate + committing. Expect 3 pre-existing `<img>` eslint warnings in unrelated files (`example-10/page.tsx`, `CoverageMap.tsx`) — ignore; 0 errors is the bar.

**⚠ INFRA DEPENDENCY (manual, by the user):** Tasks 1–5 compile/build WITHOUT any new env. **Task 6 (seed) and Task 7 (browser verify) require a Vercel Blob store + `BLOB_READ_WRITE_TOKEN`** (added to `.env` for dev and to Vercel for prod). If that token is not yet set when reaching Task 6, STOP and surface it to the user — do not fake it.

---

## File Structure

**New:**
- `src/collections/Media.ts` — upload collection (Vercel Blob), `alt` + `blurDataURL`.
- `src/collections/Services.ts` — the services collection.
- `src/collections/hooks/generate-blur.ts` — sharp blur-placeholder beforeChange hook.
- `src/collections/hooks/assign-default-tenant.ts` — shared default-Kryscar-tenant hook.
- `src/lib/services-seed-data.ts` — seed-only maps (`SERVICE_IMAGES`, `PRICES`, `SERVICE_CONTENT`) moved out of catalog.ts/services.ts.
- `src/components/MediaImage.tsx` — `next/image` wrapper for Payload media (url + blurDataURL).
- `scripts/seed-services.ts` — idempotent seed (upload media + upsert services).
- `kryscar-mind/map/decisions/services-as-payload-collection.md`, `kryscar-mind/map/decisions/media-vercel-blob-blur-hook.md`.

**Modified:**
- `package.json` (+ `@payloadcms/storage-vercel-blob`), `next.config.ts` (Blob host in `remotePatterns`).
- `src/payload.config.ts` (register `Media` + `Services`, add the storage plugin).
- `src/collections/auth/Users.ts` (use the shared tenant hook).
- `src/lib/catalog.ts`, `src/lib/services.ts` (read Payload), `src/components/service-catalog.tsx` (CatalogItem type + badge source).
- `src/app/(public)/example-9/page.tsx`, `…/ogrodnik/[miasto]/page.tsx`, `…/realizacje/[slug]/page.tsx`, `…/uslugi/[usluga]/page.tsx` (await + MediaImage hero).
- `kryscar-mind/map/zones/{service-catalog,service-pages,payload-backend}.md`, `kryscar-mind/map/index.md`.

**Unchanged (explicit):** `data.ts` `SERVICES`/`SERVICE_BADGES`/`CATEGORIES`; `BlurImage`/`BLUR_DATA`; the design-variant pages; projects/guides/winter/locations data layers.

---

## Task 1: Media collection + blur hook + Vercel Blob storage

**Files:** Create `src/collections/hooks/generate-blur.ts`, `src/collections/Media.ts`; Modify `package.json`, `src/payload.config.ts`, `next.config.ts`.

- [ ] **Step 1: Add the storage adapter dependency**

Run:
```bash
npm install @payloadcms/storage-vercel-blob@^3.85.0
```
Expected: added to `dependencies`, lockfile updated, no peer-dep errors.

- [ ] **Step 2: Create the blur hook**

Create `src/collections/hooks/generate-blur.ts`:
```ts
import type { CollectionBeforeChangeHook } from "payload";
import sharp from "sharp";

/**
 * On upload, generate a tiny base64 WebP blur placeholder (mirrors
 * scripts/gen-blur.mjs) and store it on `blurDataURL`, so next/image can render
 * placeholder="blur" for Payload media. Runs only when a new file buffer is
 * present (create or replace) — a metadata-only update keeps the existing value.
 */
export const generateBlurDataURL: CollectionBeforeChangeHook = async ({
  data,
  req,
}) => {
  const file = (req as { file?: { data?: Buffer } }).file;
  if (file?.data) {
    const buf = await sharp(file.data).resize(16).webp({ quality: 40 }).toBuffer();
    data.blurDataURL = "data:image/webp;base64," + buf.toString("base64");
  }
  return data;
};
```

- [ ] **Step 3: Create the Media collection**

Create `src/collections/Media.ts`:
```ts
import type { CollectionConfig } from "payload";

import { generateBlurDataURL } from "./hooks/generate-blur";

/**
 * Uploads collection. Files are stored on Vercel Blob (configured in
 * payload.config.ts); each image gets a generated `blurDataURL` so the
 * frontend keeps its instant blur-up preview (see [[image-loading]]).
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Treść" },
  access: { read: () => true },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 768 },
    ],
  },
  fields: [
    { name: "alt", type: "text", required: true },
    {
      name: "blurDataURL",
      type: "text",
      admin: {
        readOnly: true,
        description: "Auto-generated tiny blur placeholder.",
      },
    },
  ],
  hooks: { beforeChange: [generateBlurDataURL] },
  timestamps: true,
};
```

- [ ] **Step 4: Register the collection + storage plugin in payload.config.ts**

In `src/payload.config.ts`: add the imports near the other collection imports:
```ts
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { Media } from "./collections/Media";
```
Add `Media` to the `collections` array (after `Tenants`):
```ts
  collections: [Admins, Users, Sessions, Accounts, Verifications, Tenants, Media],
```
Add a `plugins` key to the config object (if none exists yet):
```ts
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
```
(Read `process.env.BLOB_READ_WRITE_TOKEN` directly — payload.config.ts reads `process.env`, never `src/lib/env.ts`, per the existing invariant.)

- [ ] **Step 5: Whitelist the Blob host for next/image**

In `next.config.ts`, add to `images.remotePatterns`:
```ts
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
```

- [ ] **Step 6: Gate + commit**

Run: `npm run check && npm run build`
Expected: PASS — 0 errors; `payload generate:types` regenerates `src/payload-types.ts` to include `Media`; build succeeds. (No Blob token is needed to compile/build; uploads only happen at runtime in the seed.)
```bash
git add package.json package-lock.json next.config.ts src/payload.config.ts src/collections/Media.ts src/collections/hooks/generate-blur.ts src/payload-types.ts
git commit -m "feat(payload): media collection on Vercel Blob + sharp blur hook

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Shared tenant hook + Services collection

**Files:** Create `src/collections/hooks/assign-default-tenant.ts`, `src/collections/Services.ts`; Modify `src/collections/auth/Users.ts`, `src/payload.config.ts`.

- [ ] **Step 1: Extract the default-tenant hook**

Create `src/collections/hooks/assign-default-tenant.ts`:
```ts
import type { CollectionBeforeChangeHook } from "payload";

/**
 * Assign the single Kryscar tenant on create when `tenant` is unset. The
 * structural tenancy seam ([[tenancy-and-roles]]): every domain row carries a
 * tenant from birth. Shared by `users` and `services`.
 */
export const assignDefaultTenant: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation === "create" && !data.tenant) {
    const res = await req.payload.find({
      collection: "tenants",
      where: { slug: { equals: "kryscar" } },
      limit: 1,
      depth: 0,
    });
    if (res.docs[0]) data.tenant = res.docs[0].id;
  }
  return data;
};
```

- [ ] **Step 2: Use the shared hook in Users.ts**

In `src/collections/auth/Users.ts`, replace the inline `hooks.beforeChange` array with an import of the shared hook. Add at the top (with the other imports):
```ts
import { assignDefaultTenant } from "../hooks/assign-default-tenant";
```
Replace the entire `hooks: { beforeChange: [ async ({ data, operation, req }) => { … } ] }` block with:
```ts
  hooks: {
    beforeChange: [assignDefaultTenant],
  },
```
(Behavior is identical — the inline hook body was the same logic.)

- [ ] **Step 3: Create the Services collection**

Create `src/collections/Services.ts`:
```ts
import type { CollectionConfig } from "payload";

import { assignDefaultTenant } from "./hooks/assign-default-tenant";

/**
 * The service catalog as a Payload collection — one record per service. Drives
 * the live marketing catalog ([[service-catalog]]) and the /uslugi landing
 * pages ([[service-pages]]) via the async accessors in lib/catalog + lib/services.
 * `image` is a Vercel-Blob-backed media upload; `tenant` is the tenancy seam.
 */
export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "title",
    group: "Katalog",
    defaultColumns: ["title", "slug", "category", "order"],
  },
  access: { read: () => true },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "order", type: "number", required: true, defaultValue: 0 },
    { name: "title", type: "text", required: true },
    { name: "short", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Trawnik", value: "trawnik" },
        { label: "Cięcie", value: "ciecie" },
        { label: "Sadzenie", value: "sadzenie" },
        { label: "Porządki", value: "porzadki" },
        { label: "Projekt", value: "projekt" },
      ],
    },
    {
      name: "icon",
      type: "select",
      required: true,
      options: [
        "scissors",
        "leaf",
        "rake",
        "sprout",
        "hedge",
        "broom",
        "compass",
        "flowers",
      ].map((v) => ({ label: v, value: v })),
    },
    {
      name: "badge",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        {
          name: "tone",
          type: "select",
          options: [
            { label: "Emerald (primary)", value: "primary" },
            { label: "Amber (accent)", value: "accent" },
          ],
        },
      ],
    },
    { name: "priceFrom", type: "text", required: true },
    { name: "duration", type: "text", required: true },
    { name: "image", type: "upload", relationTo: "media", required: true },
    {
      name: "hero",
      type: "array",
      required: true,
      fields: [{ name: "paragraph", type: "textarea", required: true }],
    },
    {
      name: "includes",
      type: "array",
      required: true,
      fields: [{ name: "item", type: "text", required: true }],
    },
    { name: "pricingNote", type: "textarea", required: true },
    {
      name: "faq",
      type: "array",
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "metaTitle", type: "text" },
        { name: "metaDescription", type: "textarea" },
      ],
    },
    { name: "tenant", type: "relationship", relationTo: "tenants", required: true },
  ],
  hooks: { beforeChange: [assignDefaultTenant] },
  timestamps: true,
};
```

- [ ] **Step 4: Register Services**

In `src/payload.config.ts`: import `import { Services } from "./collections/Services";` and append to the array:
```ts
  collections: [Admins, Users, Sessions, Accounts, Verifications, Tenants, Media, Services],
```

- [ ] **Step 5: Gate + commit**

Run: `npm run check`
Expected: PASS — `payload generate:types` regenerates `src/payload-types.ts` with the `Service` type.
```bash
git add src/collections/Services.ts src/collections/hooks/assign-default-tenant.ts src/collections/auth/Users.ts src/payload.config.ts src/payload-types.ts
git commit -m "feat(payload): services collection + shared default-tenant hook

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Isolate the seed-only data maps

**Files:** Create `src/lib/services-seed-data.ts`; Modify `src/lib/catalog.ts`, `src/lib/services.ts` (move the maps out; no behavior change yet).

- [ ] **Step 1: Create the seed-data module**

Create `src/lib/services-seed-data.ts` and MOVE into it, verbatim, the three current consts:
- `SERVICE_IMAGES` (currently the `const SERVICE_IMAGES` map in `src/lib/catalog.ts`),
- `PRICES` (currently `const PRICES` in `src/lib/catalog.ts`),
- `SERVICE_CONTENT` (currently `const SERVICE_CONTENT: ServicePageContent[]` in `src/lib/services.ts`) plus the `ServicePageContent` + `ServiceFaq` interfaces it depends on.

Export each (`export const SERVICE_IMAGES`, `export const PRICES`, `export const SERVICE_CONTENT`, `export interface ServiceFaq`, `export interface ServicePageContent`). Add `import { IMG } from "@/lib/data";` (SERVICE_IMAGES references `IMG.*`). This file is the single source the seed reads from; the live accessors stop using it after Task 5.

- [ ] **Step 2: Point catalog.ts + services.ts at the moved consts (temporary, no behavior change)**

In `src/lib/catalog.ts`, delete the moved `SERVICE_IMAGES` + `PRICES` consts and import them:
```ts
import { SERVICE_IMAGES, PRICES } from "@/lib/services-seed-data";
```
In `src/lib/services.ts`, delete the moved `SERVICE_CONTENT` const + the `ServicePageContent`/`ServiceFaq` interfaces and import them:
```ts
import { SERVICE_CONTENT, type ServiceFaq } from "@/lib/services-seed-data";
```
(Keep `ServiceFaq` exported from `services.ts` if other modules import it from there — re-export: `export type { ServiceFaq } from "@/lib/services-seed-data";`. The `/uslugi` page imports nothing of these directly; verify with a grep before deleting.)

- [ ] **Step 3: Gate + commit**

Run: `npm run check && npm run build`
Expected: PASS, identical runtime behavior (the accessors still compose from these maps — just imported from a new module). The catalog + /uslugi pages render exactly as before.
```bash
git add src/lib/services-seed-data.ts src/lib/catalog.ts src/lib/services.ts
git commit -m "refactor(services): isolate seed-only data maps into services-seed-data

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: MediaImage component

**Files:** Create `src/components/MediaImage.tsx`.

- [ ] **Step 1: Create MediaImage**

Create `src/components/MediaImage.tsx`:
```tsx
import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper for Payload media: pass the media `url` + the generated
 * `blurDataURL` and it renders placeholder="blur" for the instant preview.
 * (BlurImage/BLUR_DATA stays the wrapper for the STATIC /img assets; this one
 * is for Payload-managed uploads, whose blur lives on the media doc.)
 */
type MediaImageProps = Omit<ImageProps, "src" | "blurDataURL" | "placeholder"> & {
  url: string;
  blurDataURL?: string | null;
};

export function MediaImage({ url, blurDataURL, alt, ...props }: MediaImageProps) {
  if (blurDataURL) {
    return (
      <Image
        src={url}
        alt={alt}
        placeholder="blur"
        blurDataURL={blurDataURL}
        {...props}
      />
    );
  }
  return <Image src={url} alt={alt} {...props} />;
}
```

- [ ] **Step 2: Gate + commit**

Run: `npm run check`
Expected: PASS (not yet imported anywhere).
```bash
git add src/components/MediaImage.tsx
git commit -m "feat(ui): MediaImage wrapper for Payload media blur-up

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Migrate the accessors + consumers to Payload (atomic)

This is ONE commit because turning `getCatalogServices()` async breaks its sync callers until they all `await` — the tree must be green at the commit.

**Files:** Modify `src/components/service-catalog.tsx`, `src/lib/catalog.ts`, `src/lib/services.ts`, `src/app/(public)/example-9/page.tsx`, `…/ogrodnik/[miasto]/page.tsx`, `…/realizacje/[slug]/page.tsx`, `…/uslugi/[usluga]/page.tsx`.

- [ ] **Step 1: Redefine `CatalogItem` + badge source in service-catalog.tsx**

In `src/components/service-catalog.tsx`:
- Change the import line `import { SERVICES, CATEGORIES, SERVICE_BADGES } from "@/lib/data";` to `import { CATEGORIES } from "@/lib/data";`.
- Replace the type block:
```tsx
type Service = (typeof SERVICES)[number];
export type CatalogItem = Service & {
  img: string;
  from: string;
  duration: string;
};
```
with an explicit, source-decoupled type:
```tsx
export type CatalogItem = {
  slug: string;
  category: string;
  title: string;
  short: string;
  description: string;
  icon: string;
  img: string;
  from: string;
  duration: string;
  badge?: { label: string; tone: "primary" | "accent" };
};
```
- Replace the badge lookup `const badge = SERVICE_BADGES[s.slug];` with `const badge = s.badge;`.
(No other JSX changes — `s.img` is still a string URL for `WarpedHoverImage`, `s.from`/`s.duration`/`s.title`/`s.short` unchanged.)

- [ ] **Step 2: Rewrite `getCatalogServices` to read Payload**

Replace the body of `src/lib/catalog.ts` with:
```ts
import { getPayload } from "payload";
import config from "@payload-config";

import type { CatalogItem } from "@/components/service-catalog";
import type { Service } from "@/payload-types";

function img(image: Service["image"]): string {
  return typeof image === "object" && image ? (image.url ?? "") : "";
}

/** Catalog projection, now sourced from the Payload `services` collection
 *  (sorted by `order`). Display image is the media URL. */
export async function getCatalogServices(): Promise<CatalogItem[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "services",
    sort: "order",
    depth: 1,
    limit: 100,
  });
  return docs.map((s) => ({
    slug: s.slug,
    category: s.category,
    title: s.title,
    short: s.short,
    description: s.description,
    icon: s.icon,
    img: img(s.image),
    from: s.priceFrom,
    duration: s.duration,
    badge: s.badge?.label
      ? { label: s.badge.label, tone: (s.badge.tone ?? "primary") as "primary" | "accent" }
      : undefined,
  }));
}
```
(The old `SERVICE_IMAGES`/`PRICES` imports are gone — they live in `services-seed-data.ts` now.)

- [ ] **Step 3: Rewrite the `/uslugi` accessors to read Payload**

Replace `src/lib/services.ts` with:
```ts
// src/lib/services.ts
/**
 * Landing-page accessors for /uslugi/[usluga], now sourced from the Payload
 * `services` collection (was SERVICE_CONTENT). Components consume ONLY these
 * async accessors (the migration boundary). Image is the media URL + its
 * generated blurDataURL (rendered via MediaImage).
 */
import { getPayload } from "payload";
import config from "@payload-config";

import type { Service } from "@/payload-types";

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServicePage {
  slug: string;
  category: string;
  title: string;
  short: string;
  icon: string;
  img: string;
  blurDataURL: string | null;
  imageAlt: string;
  from: string;
  duration: string;
  hero: string[];
  includes: string[];
  pricingNote: string;
  faq: ServiceFaq[];
  metaTitle: string;
  metaDescription: string;
}

function project(s: Service): ServicePage {
  const image = typeof s.image === "object" && s.image ? s.image : null;
  return {
    slug: s.slug,
    category: s.category,
    title: s.title,
    short: s.short,
    icon: s.icon,
    img: image?.url ?? "",
    blurDataURL: image?.blurDataURL ?? null,
    imageAlt: image?.alt ?? s.title,
    from: s.priceFrom,
    duration: s.duration,
    hero: (s.hero ?? []).map((h) => h.paragraph),
    includes: (s.includes ?? []).map((i) => i.item),
    pricingNote: s.pricingNote,
    faq: (s.faq ?? []).map((f) => ({ q: f.question, a: f.answer })),
    metaTitle: s.seo?.metaTitle ?? s.title,
    metaDescription: s.seo?.metaDescription ?? s.short,
  };
}

export async function getAllServices(): Promise<ServicePage[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "services",
    sort: "order",
    depth: 1,
    limit: 100,
  });
  return docs.map(project);
}

export async function getServiceSlugs(): Promise<string[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "services",
    sort: "order",
    depth: 0,
    limit: 100,
  });
  return docs.map((s) => s.slug);
}

export async function getServiceBySlug(slug: string): Promise<ServicePage | null> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "services",
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  });
  return docs[0] ? project(docs[0]) : null;
}
```

- [ ] **Step 4: `await` the now-async catalog accessor in its 3 sync callers**

- `src/app/(public)/example-9/page.tsx`: change `const services = getCatalogServices();` to `const services = await getCatalogServices();` (the component function is already `async`).
- `src/app/(public)/ogrodnik/[miasto]/page.tsx`: change `const services = getCatalogServices();` to `const services = await getCatalogServices();`.
- `src/app/(public)/realizacje/[slug]/page.tsx`: change `const service = getCatalogServices().find(` to `const service = (await getCatalogServices()).find(` (keep the `.find(...)` predicate intact). Ensure the enclosing function is `async` (it is — it's an async page component).

- [ ] **Step 5: Swap the `/uslugi` hero to MediaImage**

In `src/app/(public)/uslugi/[usluga]/page.tsx`:
- Change the import `import { BlurImage } from "@/components/BlurImage";` to `import { MediaImage } from "@/components/MediaImage";`.
- Replace the hero block:
```tsx
            <BlurImage
              src={svc.img}
              alt={svc.title}
              fill
              preload
              className="object-cover"
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
```
with:
```tsx
            <MediaImage
              url={svc.img}
              blurDataURL={svc.blurDataURL}
              alt={svc.imageAlt}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
```
(`preload` was not a valid next/image prop; `priority` is the correct above-the-fold hint. If any OTHER use of `BlurImage` remains in this file, leave it — only the service hero changes.)

- [ ] **Step 6: Gate + commit**

Run: `npm run check && npm run build`
Expected: PASS. The build prerenders the marketing pages by calling the accessors against Neon; with the `services` collection **empty (pre-seed)** they return `[]`, so the catalog renders empty and `/uslugi/[usluga]` has no static params — both are fine (no error). Marketing routes stay `○` (still statically generated; they read at build, not per-request). 0 errors.
```bash
git add src/components/service-catalog.tsx src/lib/catalog.ts src/lib/services.ts "src/app/(public)/example-9/page.tsx" "src/app/(public)/ogrodnik/[miasto]/page.tsx" "src/app/(public)/realizacje/[slug]/page.tsx" "src/app/(public)/uslugi/[usluga]/page.tsx"
git commit -m "feat(services): read catalog + /uslugi from Payload (accessor migration)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Seed script (upload media + upsert services)  ⚠ NEEDS BLOB TOKEN

**Files:** Create `scripts/seed-services.ts`.

**PRECONDITION:** `BLOB_READ_WRITE_TOKEN` must be in `.env` (the user provisions a Vercel Blob store + adds it). If it's absent, STOP and report BLOCKED — the media upload will fail without it.

- [ ] **Step 1: Create the seed**

Create `scripts/seed-services.ts`:
```ts
/**
 * Seed the `services` + `media` collections from the existing static data.
 * Idempotent: upserts each service by slug, and reuses an existing media doc
 * (matched by alt) instead of re-uploading. One-time data migration; after this
 * Payload is the source of truth.
 *
 * Run: npx tsx --env-file=.env scripts/seed-services.ts
 */
import path from "node:path";
import { getPayload } from "payload";

import config from "../src/payload.config";
import { SERVICES, SERVICE_BADGES } from "../src/lib/data";
import { SERVICE_IMAGES, PRICES, SERVICE_CONTENT } from "../src/lib/services-seed-data";

async function main() {
  const payload = await getPayload({ config });

  const tenant = await payload.find({
    collection: "tenants",
    where: { slug: { equals: "kryscar" } },
    limit: 1,
    depth: 0,
  });
  if (!tenant.docs[0]) {
    await payload.create({
      collection: "tenants",
      data: { name: "Ogrody Kryscar", slug: "kryscar" },
    });
  }

  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    const content = SERVICE_CONTENT.find((c) => c.slug === s.slug);
    if (!content) {
      console.warn(`skip ${s.slug}: no SERVICE_CONTENT`);
      continue;
    }
    const price = PRICES[s.slug] ?? { from: "wycena", duration: "indywidualnie" };
    const imgPath = SERVICE_IMAGES[s.slug];
    const alt = s.title;

    // media: reuse by alt, else upload from disk (public/<imgPath>)
    let mediaId: string;
    const existingMedia = await payload.find({
      collection: "media",
      where: { alt: { equals: alt } },
      limit: 1,
      depth: 0,
    });
    if (existingMedia.docs[0]) {
      mediaId = String(existingMedia.docs[0].id);
    } else {
      const created = await payload.create({
        collection: "media",
        data: { alt },
        filePath: path.join(process.cwd(), "public", imgPath),
      });
      mediaId = String(created.id);
    }

    const badge = SERVICE_BADGES[s.slug];
    const data = {
      slug: s.slug,
      order: i,
      title: s.title,
      short: s.short,
      description: s.description,
      category: s.category,
      icon: s.icon,
      badge: badge ? { label: badge.label, tone: badge.tone } : undefined,
      priceFrom: price.from,
      duration: price.duration,
      image: mediaId,
      hero: content.hero.map((paragraph) => ({ paragraph })),
      includes: content.includes.map((item) => ({ item })),
      pricingNote: content.pricingNote,
      faq: content.faq.map((f) => ({ question: f.q, answer: f.a })),
      seo: { metaTitle: content.metaTitle, metaDescription: content.metaDescription },
    } as const;

    const existing = await payload.find({
      collection: "services",
      where: { slug: { equals: s.slug } },
      limit: 1,
      depth: 0,
    });
    if (existing.docs[0]) {
      await payload.update({ collection: "services", id: existing.docs[0].id, data });
      console.log(`updated ${s.slug}`);
    } else {
      await payload.create({ collection: "services", data });
      console.log(`created ${s.slug}`);
    }
  }

  console.log("services seed done");
  process.exit(0);
}

main().catch((err) => {
  console.error("services seed failed:", err);
  process.exit(1);
});
```
Note on types: `SERVICE_CONTENT` faq uses `{ q, a }`; the collection uses `{ question, answer }` — the seed maps between them (as above). `badge.tone` from `SERVICE_BADGES` is `"primary"|"accent"` already. If TS complains about the `data` object shape vs the generated `Service` create type, narrow with `as any` ONLY on the `payload.create/update` `data` arg as a last resort and note it — prefer matching the generated type.

- [ ] **Step 2: Run the seed against Neon**

Run:
```bash
npx tsx --env-file=.env scripts/seed-services.ts
```
Expected: prints `created koszenie … created rabaty` (8 lines) then `services seed done`. Re-running prints `updated …` (idempotent). If it errors with a Blob/token error, STOP — the token isn't set.

- [ ] **Step 3: Verify in the DB + commit**

Quick check (inline tsx) that 8 services exist with a populated image + blurDataURL:
```bash
cat > scripts/_verify-services.ts <<'EOF'
import { getPayload } from "payload";
import config from "../src/payload.config";
async function main() {
  const p = await getPayload({ config });
  const { docs, totalDocs } = await p.find({ collection: "services", sort: "order", depth: 1, limit: 100 });
  console.log("total services:", totalDocs);
  for (const s of docs) {
    const img: any = s.image;
    console.log(`RESULT ${s.slug} order=${s.order} price=${s.priceFrom} img=${img?.url ? "yes" : "NO"} blur=${img?.blurDataURL ? "yes" : "NO"}`);
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
EOF
npx tsx --env-file=.env scripts/_verify-services.ts 2>&1 | grep -E "^RESULT|total services"
rm -f scripts/_verify-services.ts
```
Expected: `total services: 8`, each `RESULT … img=yes blur=yes`.
```bash
git add scripts/seed-services.ts
git commit -m "feat(services): idempotent seed (upload media + upsert services)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Browser verification  ⚠ NEEDS SEEDED DATA

**Files:** none (manual). Requires Task 6 to have run (data + Blob token).

- [ ] **Step 1: Start the dev server** — `npm run dev` (background) → `http://localhost:1111`.

- [ ] **Step 2: Homepage catalog** — at `/`: the 8 service cards render with their photos (from Blob), prices, and the "Najpopularniejsze"/"Projekt + realizacja" badges; the category filter works; order matches `order`.

- [ ] **Step 3: `/uslugi/[slug]`** — at `/uslugi/koszenie`: the hero photo renders with blur-up (a blurred preview that sharpens), hero paragraphs, the "co obejmuje" list, pricing note, and FAQ all show; meta title/description in the `<head>`.

- [ ] **Step 4: City page** — at `/ogrodnik/bydgoszcz`: the embedded catalog renders the same Payload services.

- [ ] **Step 5: Admin round-trip** — at `/admin`, open **Services**, change a service `priceFrom` (e.g. koszenie → "od 209 zł"), save; reload `/` (dev is not cached) → the new price shows. Open **Media** → the 8 uploads are listed with `blurDataURL` populated. (Revert the price after.)

- [ ] **Step 6: Stop the dev server.**

---

## Task 8: Mind maintenance

**Files:** Create `kryscar-mind/map/decisions/services-as-payload-collection.md`, `…/media-vercel-blob-blur-hook.md`; Modify `kryscar-mind/map/zones/{service-catalog,service-pages,payload-backend}.md`, `…/index.md`.

- [ ] **Step 1: Capture HEAD** — `git rev-parse HEAD` → HEAD_SHA.

- [ ] **Step 2: Decision — services-as-payload-collection**

Create `kryscar-mind/map/decisions/services-as-payload-collection.md`:
```markdown
---
type: decision
summary: "The 8 services are a Payload `services` collection (full service: catalog + price + landing content + tenant). The async accessors (lib/catalog, lib/services) read Payload; getCatalogServices is now async. Static SERVICES/SERVICE_BADGES/CATEGORIES stay in data.ts as the seed source + the design-variant pages' data."
tags: [payload, services, data]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[service-catalog]]", "[[service-pages]]", "[[payload-backend]]", "[[tenancy-and-roles]]"]
sources: ["[[2026-06-04-services-payload-collection-design]]"]
decided: 2026-06-04
supersededBy: ""
---
## Context
The service catalog needed to be CMS-editable and to back the customer-panel
service picker. The codebase already had an async-accessor migration boundary.
## Decision
A `services` collection holds the whole service. `lib/catalog.getCatalogServices`
(now async) + `lib/services` accessors read Payload (`find` sorted by `order`,
depth 1 for the media image). The static `SERVICES`/`SERVICE_BADGES` arrays remain
in data.ts as the seed source + the design-variant pages' data; the per-service
content/price/image maps moved to `lib/services-seed-data.ts` (seed-only). The few
live sync callers gained an `await`.
## Why
Full service in one record avoids a split entity and makes /uslugi CMS-driven too.
Keeping the static arrays for the throwaway variant pages avoids churn; the live
boundary is the accessors.
## Consequences
`getCatalogServices` is async — server-component callers await it. `CatalogItem` is
now an explicit type (decoupled from `typeof SERVICES`), and the badge comes from the
service doc. Projects/guides/winter/locations are NOT migrated (still static).
```

- [ ] **Step 3: Decision — media-vercel-blob-blur-hook**

Create `kryscar-mind/map/decisions/media-vercel-blob-blur-hook.md`:
```markdown
---
type: decision
summary: "Payload uploads live in a `media` collection on Vercel Blob storage; a sharp beforeChange hook writes a base64 blur placeholder onto each media doc so next/image keeps blur-up (via the MediaImage wrapper). BlurImage/BLUR_DATA stays for the static /img assets."
tags: [payload, media, storage, image]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[payload-backend]]", "[[image-loading]]", "[[service-pages]]"]
sources: ["[[2026-06-04-services-payload-collection-design]]"]
decided: 2026-06-04
supersededBy: ""
---
## Context
Service images moved into Payload. Vercel's filesystem is ephemeral, so uploads
need durable storage; and the site values instant blur-up previews.
## Decision
Register `@payloadcms/storage-vercel-blob` (token `BLOB_READ_WRITE_TOKEN`) for the
`media` collection. A `beforeChange` hook runs `sharp(buf).resize(16).webp().toBuffer()`
→ base64 and stores it on `media.blurDataURL` (mirrors scripts/gen-blur.mjs). The new
`MediaImage` component renders next/image with that blur; `BlurImage`/`BLUR_DATA` keep
serving the static /img assets (projects, guides, winter, auth hero).
## Why
Durable prod storage + preserved image quality, with one CMS media library.
## Consequences
`BLOB_READ_WRITE_TOKEN` is a required env (dev + prod); next.config `remotePatterns`
allows `*.public.blob.vercel-storage.com`. A future full media migration of the other
static images is possible but out of scope.
```

- [ ] **Step 4: Update the zones**

- `kryscar-mind/map/zones/service-catalog.md`: rewrite the invariant `"SERVICES drives both the homepage catalog and the city pages"` to the new truth: `rule: "the live catalog + city pages read the Payload services collection via getCatalogServices (async); SERVICES/SERVICE_BADGES stay static for the design-variant pages + as seed source"`, `enforcedBy: []`. Add `src/lib/services-seed-data.ts` to `owns.globs`. Update the Purpose prose (Payload-sourced now). Add `"[[payload-backend]]"` to related. Re-stamp `verifiedAt` to HEAD_SHA.
- `kryscar-mind/map/zones/service-pages.md`: update the Purpose/invariant — the accessors now read Payload (the migration the module was built for is done); image is Payload media via `MediaImage`. Add `"[[payload-backend]]"` to related. Re-stamp `verifiedAt`.
- `kryscar-mind/map/zones/payload-backend.md`: note the new `media` (Vercel Blob) + `services` collections and the storage plugin in the Purpose; add `src/collections/Media.ts`, `src/collections/Services.ts`, `src/collections/hooks/**` to `owns.globs`. Re-stamp `verifiedAt`.
- Keep all invariants in the `rule:`/`enforcedBy:` object form (bare strings break the generator).

- [ ] **Step 5: Regenerate + commit**

Run: `npm run mind` then verify `grep -c 'invariant "undefined"' kryscar-mind/map/index.md` prints `0` and there are no broken-anchor errors. Then `npm run check`.
```bash
git add kryscar-mind/
git commit -m "docs(mind): services + media collections — zones + decisions

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- `services` collection (full fields + tenant) → Task 2. ✅
- `media` collection + Vercel Blob + sharp blur hook → Task 1. ✅
- next/image Blob host whitelist → Task 1 Step 5. ✅
- Accessor migration (catalog async + /uslugi) reading Payload → Task 5. ✅
- `MediaImage` + blur-up preserved on /uslugi hero; catalog keeps WarpedHoverImage(url) → Tasks 4 + 5. ✅
- Sync callers await → Task 5 Step 4. ✅
- Static arrays stay; seed-only maps isolated → Task 3. ✅
- Idempotent seed (upload media + upsert services) → Task 6. ✅
- Shared default-tenant hook → Task 2. ✅
- Categories static (select options) → Task 2 (collection). ✅
- Infra (storage dep + token) called out → header + Task 1 + Task 6 precondition. ✅
- Verification (admin round-trip, blur-up, badges) → Task 7. ✅
- Mind (zones + 2 decisions, rewrite the stale invariant) → Task 8. ✅
- Scope boundary (no panel/page-builder/other-collection migration) honored. ✅

**Placeholder scan:** No TBD/TODO; every code step has full code; commands have expected output. The only conditional is the `as any` last-resort note in the seed (Task 6 Step 1) — bounded + justified. ✅

**Type/name consistency:** `CatalogItem` (explicit, with `badge?: {label, tone}`) defined in Task 5 Step 1 and produced by `getCatalogServices` in Step 2; consumed by ServiceCatalog + realizacje. `ServicePage` (with `blurDataURL`, `imageAlt`) defined + produced in Task 5 Step 3; consumed by `/uslugi` (MediaImage in Step 5). `Service`/`Media` payload types come from the regenerated `payload-types.ts` (Tasks 1–2). `SERVICE_IMAGES`/`PRICES`/`SERVICE_CONTENT` move to `services-seed-data.ts` (Task 3) and are read by the seed (Task 6). `assignDefaultTenant` defined in Task 2, used by Users + Services. `generateBlurDataURL` defined Task 1, used by Media. ✅
