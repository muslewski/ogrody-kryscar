---
type: spec
summary: "Per-service landing pages: /uslugi/[usluga] for all 8 catalog services, a Payload-ready service-page data layer that composes SERVICES + catalog pricing + net-new content, whole-card links from the catalog, and a generalized ServiceJsonLd."
tags: [seo, feature, data]
status: done
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-catalog]]", "[[winter-services]]", "[[city-landing-pages]]", "[[seo]]", "[[homepage-and-variants]]", "[[coverage-map]]", "[[layout-chrome]]"]
sources: ["[[2026-06-02-winter-services-design]]"]
origin: "User: do for each catalog card what we did for zima — each service card should redirect to its own subpage. Decisions: /uslugi/[slug] with no hub; full-depth content authored for all 8; whole card links to the subpage."
---

# Service landing pages — Design

**Date:** 2026-06-03
**Routes:** `/uslugi/[usluga]` (8 pages, one per catalog service, e.g. `kryscar.pl/uslugi/koszenie`). **No hub** — the homepage catalog (`/#katalog`) is the index.
**Scope:** New `/uslugi/[usluga]` route family + a Payload-ready service-page data module + whole-card links from the catalog island + a generalized `ServiceJsonLd` + nav link + sitemap plumbing. The `/example-N` variants and the existing summer catalog data are untouched.

## Goal

Give every core service its own genuinely-useful, statically-rendered landing page targeting high-intent local queries ("koszenie trawników Bydgoszcz", "pielęgnacja ogrodu Bydgoszcz", "cięcie żywopłotów Bydgoszcz", …), exactly as the winter arc did for `/zima/[usluga]`. The eight catalog cards (on the homepage and on every city page) become click-throughs to these pages. Built so a later **PayloadCMS** migration is a swap of one data-access module, not a rewrite — same boundary discipline as the city and winter pages.

The eight services (canonical slugs from `SERVICES` in `src/lib/data.ts`):
`koszenie`, `pielegnacja`, `grabienie`, `sadzenie`, `ciecie`, `porzadki`, `aranzacja`, `rabaty`.

## Approved decisions

- **Route shape:** `/uslugi/[usluga]` (single data-driven template), **no hub page**. The homepage catalog already lists every service, so a `/uslugi` index would duplicate it. The subpage breadcrumb's "Usługi" crumb links back to `/#katalog`. Mirrors `/zima/[usluga]` minus the hub.
- **Data home — Approach A (separate composing module):** a new `src/lib/services.ts` that holds *only the net-new landing-page content* keyed by slug, and **composes** the existing thin `SERVICES` (title/short/icon/category) + the catalog `from`/`duration` price into a single `ServicePage` via async accessors. `SERVICES` and `catalog.ts` are **not** modified.
  - Rejected **B** (one unified rich module replacing `SERVICES` + `catalog.ts`): large blast radius — forces refactoring the client catalog island and risks shipping FAQ/hero copy into the browser bundle.
  - Rejected **C** (fold content into `SERVICES`): the [[winter-data-module]] decision already forbids it, and `data.ts` is imported by the client island, so rich content would bloat the client bundle.
- **Static, not seasonal:** these pages have no `revalidate` (unlike the seasonal `/zima` pages). Content is static; `generateStaticParams` prerenders all eight.
- **Whole-card link:** the entire catalog card becomes the link to `/uslugi/${slug}` (like `WinterServiceCard`); "Zamów →" is demoted to a `<span>` visual cue inside the card link. Applies globally — cards on the city pages link out too (good internal linking).
- **`ServiceJsonLd` generalized:** the existing component is already 90% generic; widen it to accept `{ name, description, url, breadcrumbs }` rather than hardcoding the `/zima/` URL and "Zima" crumb, and update the one winter call site. The service pages reuse it.
- **Content depth:** full landing-page depth for all eight, authored in the established Polish brand voice (2 intro paragraphs, ~5 "Co obejmuje" bullets, a pricing note, ~3 FAQs, SEO meta). Same anti-thin-content bar as the city/winter pages. User reviews afterward.

## Architecture

### Unit 1 — Service-page data layer (`src/lib/services.ts`, new)

The ONLY module that knows the service-landing-page content source. Composes the canonical list + presentation price + net-new content.

```ts
// src/lib/services.ts
import { SERVICES } from "@/lib/data";
import { getCatalogServices } from "@/lib/catalog"; // for from/duration price

export interface ServiceFaq { q: string; a: string; }

/** Net-new landing-page content, keyed by the same slug as SERVICES. */
interface ServicePageContent {
  slug: string;          // must match a SERVICES slug
  hero: string[];        // intro paragraphs (landing-page depth)
  includes: string[];    // "Co obejmuje" bullets
  pricingNote: string;   // prose: how pricing works
  faq: ServiceFaq[];
  metaTitle: string;
  metaDescription: string;
}

/** The composed view a page consumes: thin SERVICES fields + price + content. */
export interface ServicePage {
  slug: string;
  category: string;
  title: string;
  short: string;
  icon: string;
  img: string;           // from catalog projection
  from: string;          // display price, from catalog
  duration: string;      // from catalog
  hero: string[];
  includes: string[];
  pricingNote: string;
  faq: ServiceFaq[];
  metaTitle: string;
  metaDescription: string;
}

const SERVICE_CONTENT: ServicePageContent[] = [ /* 8 entries, by slug */ ];

export async function getServiceSlugs(): Promise<string[]> { /* SERVICES.map(s => s.slug) */ }
export async function getAllServices(): Promise<ServicePage[]> { /* composed, in SERVICES order */ }
export async function getServiceBySlug(slug: string): Promise<ServicePage | null> { /* merge or null */ }
```

- Composition: `getServiceBySlug` finds the `SERVICES` entry + the matching `SERVICE_CONTENT` entry + the catalog item (for `img`/`from`/`duration`), and merges. If either the `SERVICES` entry or the content entry is missing, return `null` (so a slug without authored content 404s rather than half-rendering).
- A `// MIGRATION (PayloadCMS)` header block (same style as `winter.ts`/`locations.ts`) documents the future `services` collection / SEO field-group so the swap touches only this file.
- **Invariant:** components consume service pages only via the async accessors — no component imports `SERVICE_CONTENT` directly (Payload-migration boundary). Mirrors the city/winter invariant.
- **Note on price reuse:** `PRICES` is currently private to `catalog.ts`. `services.ts` reuses it by calling `getCatalogServices()` and looking up by slug — no second price source. (No change to `catalog.ts`'s public surface required.)

### Unit 2 — `/uslugi/[usluga]` page (`src/app/uslugi/[usluga]/page.tsx`, new)

Data-driven template, structurally a clone of `src/app/zima/[usluga]/page.tsx`, but **static** (no `export const revalidate`).

- `generateStaticParams()` → from `getServiceSlugs()` (prerender all eight).
- `generateMetadata()` → `metaTitle`/`metaDescription` + canonical `/uslugi/${slug}` + OpenGraph.
- Body, in order:
  - `<ServiceJsonLd>` (generalized — see Unit 3) with breadcrumbs Strona główna › Usługi › {title}.
  - `<SiteHeader>`.
  - Breadcrumb nav: Strona główna (`/`) › Usługi (`/#katalog`) › {title}.
  - **Hero:** eyebrow = the service's **category label** (resolve `category` → `CATEGORIES` label), `<h1>` = `title`, `short` as lead, then `hero[]` paragraphs, a price chip (`duration` + `from` from the catalog), phone + "Bezpłatna wycena" CTAs. Reuse the service's catalog **image** as the hero visual (we have real images per service, unlike winter v1); gradient/neutral fallback if absent.
  - **"Co obejmuje":** `includes[]` bullets (same card-grid styling as the winter page) + `pricingNote` as the italic note.
  - **"Jak to działa":** reuse `PROCESS` (identical to winter/city pages).
  - **Coverage:** `CoverageMap` (`variant="streets"`) + nearest-city cross-links (reuse the `getAllLocations().sort(km).slice(0,8)` pattern from the winter page) linking to `/ogrodnik/[miasto]`.
  - **FAQ:** `faq[]` in the shared `<details>` accordion.
  - **"Zobacz też":** the other services as pills linking to `/uslugi/${slug}`.
  - **CTA** (`id="kontakt"`) + `<SiteFooter>`.
- `notFound()` for unknown slugs / null accessor result.

### Unit 3 — Generalize `ServiceJsonLd` (`src/components/ServiceJsonLd.tsx`, edit)

Currently hardcodes the `/zima/${slug}` URL and a "Zima" breadcrumb, and types its prop as `WinterService`. Widen to a generic emitter:

```ts
export function ServiceJsonLd({
  name,
  description,
  url,                                  // absolute (SITE_URL + path)
  breadcrumbs,                          // [{ name, item }] for the BreadcrumbList
}: {
  name: string;
  description: string;
  url: string;
  breadcrumbs: { name: string; item: string }[];
}) { /* Service + BreadcrumbList, provider = LocalBusiness Ogrody Kryscar */ }
```

Update the one existing winter call site (`src/app/zima/[usluga]/page.tsx`) to pass the explicit props. Both `/uslugi` and `/zima` pages then share it. (This is the only edit to the winter zone's code.)

### Unit 4 — Catalog card → subpage (`src/components/service-catalog.tsx`, edit)

- Wrap the card body in `<Link href={`/uslugi/${s.slug}`}>` as the single child of the existing `HoverCard` (which renders a plain `<div>` shell, so no nested-anchor problem). The Link is `flex h-full flex-col`; the `group` class stays on the `HoverCard` shell so group-hover image/CTA effects keep working.
- Demote the "Zamów →" `<a href="#kontakt">` to a `<span>` styled identically (the whole card is now the click target; the contact/quote CTA lives on the service page).
- No prop changes; `getCatalogServices()` already provides `slug`. Change is global — the same component renders on `/` (example-9) and `/ogrodnik/[miasto]`, so both now link out to `/uslugi/[slug]`.

### Unit 5 — Sitemap (`src/app/sitemap.ts`, edit)

Add `/uslugi/${slug}` for all eight via `getServiceSlugs()` (same async pattern as the winter/location slugs), `changeFrequency: "monthly"`, `priority: 0.8`.

### Unit 6 — Header nav link (`src/components/SiteHeader.tsx`, edit)

Add an "Usługi" nav link → `/#katalog`, beside the existing "Zima" link, for parity. (The inline homepage header in `example-9` already exposes the catalog directly, so no homepage edit is required for nav.)

## Data flow

`services.ts` (accessors) → server component (`/uslugi/[usluga]`) awaits accessors → passes a plain `ServicePage` to presentational JSX. `services.ts` internally composes `SERVICES` (data.ts) + `getCatalogServices()` (catalog.ts) + `SERVICE_CONTENT`. No component imports `SERVICE_CONTENT`; the client catalog island is unchanged and still imports only the thin `SERVICES`/`CATEGORIES`/`SERVICE_BADGES`. Same boundary discipline as the city/winter pages.

## Error handling

- Unknown `/uslugi/[slug]` → `notFound()`.
- `getServiceBySlug` returns `null` (never throws) when the slug has no `SERVICES` entry or no authored content — page guards on null.
- Missing `img` → gradient/neutral fallback (no broken `<img>`).
- No seasonal state, no runtime date — pages are fully static.

## Testing / verification

No test runner in this repo. Verification gate = `npm run check` (tsc strict + eslint flat + mind generator). Plan tasks verify via:
- `npx tsc --noEmit` after each unit.
- `npx next build` / route smoke: all 8 `/uslugi/*` pages prerender; sitemap contains them; the eight catalog cards link to `/uslugi/[slug]` (and still render on `/` and `/ogrodnik/[miasto]`).
- Confirm the client catalog bundle did not grow (no rich content leaked into the island import graph).

## SEO / content notes

- Thin-content avoidance: each subpage carries real depth (hero paragraphs, includes, pricing note, FAQ, coverage) — same bar as the city/winter pages.
- Keyword targets: "koszenie trawników Bydgoszcz", "pielęgnacja ogrodu Bydgoszcz", "grabienie liści Bydgoszcz", "sadzenie roślin / drzew Bydgoszcz", "cięcie i formowanie żywopłotów Bydgoszcz", "wiosenne i jesienne porządki w ogrodzie Bydgoszcz", "aranżacja ogrodu / projekt ogrodu Bydgoszcz", "zakładanie rabat Bydgoszcz".
- Internal linking: catalog cards (homepage + every city page) link down into `/uslugi/[slug]`; each service page cross-links to other services and to nearest city pages; the breadcrumb links back to `/#katalog`.

## Mind maintenance (per DEV RULE — same change as the code)

- New zone card `kryscar-mind/map/zones/service-pages.md` (owns: `src/app/uslugi/**`, `src/lib/services.ts`; anchors: `symbol:getServiceBySlug`, `symbol:getServiceSlugs`, `symbol:getAllServices`, `symbol:ServicePage`, `route:/uslugi/[usluga]`; routes: `/uslugi/[usluga]`; invariant: accessor-only boundary; depends: `service-catalog`, `coverage-map`, `layout-chrome`, `city-landing-pages`, `winter-services` for the shared `ServiceJsonLd`).
- Touch + re-stamp `verifiedAt` to HEAD on: `service-catalog` (cards now link to `/uslugi/[slug]`), `seo` (new sitemap entries), `winter-services` (`ServiceJsonLd` generalized + call site updated), `layout-chrome` (new nav link).
- Decision record: `service-page-data-module.md` — separate composing `services.ts` (Approach A) vs. unifying or folding into `SERVICES` (B/C); reference [[winter-data-module]] as the precedent.
- Decision record (optional / can fold into the above): generalizing `ServiceJsonLd` from winter-specific to a shared `{name,description,url,breadcrumbs}` emitter.
- Tech-debt: the accessor-only boundary for `SERVICE_CONTENT` has no `enforcedBy` (same gap as locations/winter — see [[enforce-locations-import-boundary]]); note it rather than build lint now.
- Run `npm run mind` (or `/map-sync`); commit the regenerated `map/index.md`.

## Out of scope (YAGNI for v1)

- A `/uslugi` hub / index page (homepage catalog is the index).
- Service × city matrix pages (`/uslugi/[usluga]/[miasto]`).
- Online booking / scheduling / cart.
- New per-service photography (reuse the existing catalog images; sourcing better hero shots can be a later tech-debt item, mirroring [[source-winter-imagery]]).
- Reworking the catalog island to receive `CATEGORIES`/badges as props (only needed if we later choose Approach B).
