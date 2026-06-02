# Local SEO city landing pages — Design

**Date:** 2026-06-02
**Route:** `/ogrodnik/[miasto]` (e.g. `kryscar.pl/ogrodnik/niemcz`)
**Scope:** New dynamic route + per-city content + homepage map promotion + SEO plumbing. The `/example-N` variants are untouched.

## Goal

Add ~11 statically-rendered, genuinely-unique local landing pages targeting the high-intent query "ogrodnik {miasto}", and promote them from the homepage map section. Boost local organic search for Ogrody Kryscar's nearby service ring around Bydgoszcz. Built so a later migration to **PayloadCMS** is a swap of one data-access module, not a rewrite.

## Approved decisions

- **URL:** `/ogrodnik/[miasto]` — keyword-led, targets "ogrodnik {city}".
- **Scope:** nearby low-competition ring (≤ ~30 km), not the far towns.
- **Content:** distinct per-city copy generated during implementation; user verifies local facts.
- **Opted in:** extract a shared `<SiteFooter>`, add JSON-LD structured data, add a slim header to city pages.
- **Rendering:** single dynamic route with `generateStaticParams` (prerender all) + `generateMetadata` (per-city SEO).

## Location list (nearby ring — ASCII slugs)

| slug | name | gmina | powiat | ~km from base |
|---|---|---|---|---|
| bydgoszcz | Bydgoszcz | — | — | 0 (baza) |
| solec-kujawski | Solec Kujawski | Solec Kujawski | bydgoski | 18 |
| osielsko | Osielsko | Osielsko | bydgoski | 9 |
| niemcz | Niemcz | Osielsko | bydgoski | 8 |
| biale-blota | Białe Błota | Białe Błota | bydgoski | 12 |
| koronowo | Koronowo | Koronowo | bydgoski | 27 |
| naklo-nad-notecia | Nakło nad Notecią | Nakło nad Notecią | nakielski | 30 |
| sicienko | Sicienko | Sicienko | bydgoski | 16 |
| dobrcz | Dobrcz | Dobrcz | bydgoski | 18 |
| zoledowo | Żołędowo | Osielsko | bydgoski | 10 |
| maksymilianowo | Maksymilianowo | Osielsko | bydgoski | 14 |

(Exact km / coordinates / zip filled with real approximations during implementation; user verifies. List editable.)

## PayloadCMS migration readiness (core architectural constraint)

The whole feature is built against an interface + access layer that mirror a future Payload collection. Migration to Payload = reimplement two functions; pages and components stay untouched.

### 1. `Location` interface mirrors a future Payload `locations` collection

Defined in `src/lib/locations.ts`. Flat, **serializable**, **no JSX/functions**. Field names chosen to map 1:1 to Payload fields:

```ts
export interface LocationFaq {
  q: string;
  a: string;
}

export interface Location {
  slug: string;            // Payload: text, unique, indexed — the routing key
  name: string;            // Payload: text
  gmina: string;           // Payload: text
  powiat: string;          // Payload: text
  km: number;              // Payload: number (road distance from base)
  travel: string;          // Payload: text (e.g. "ok. 15 min od bazy")
  lat: number;             // Payload: number
  lng: number;             // Payload: number
  zip: string;             // Payload: text
  nearbyAreas: string[];   // Payload: array of { value: text } (real neighbours)
  intro: string[];         // Payload: array of { paragraph: textarea } OR richText later
  localNote: string;       // Payload: textarea
  faq: LocationFaq[];      // Payload: array of { q: text, a: textarea }
  metaTitle: string;       // Payload: text (SEO group)
  metaDescription: string; // Payload: textarea (SEO group)
}
```

Notes for the future Payload schema (documented in the file as a comment):
- `slug` is the stable identifier — Payload doc keyed by slug works identically for routing.
- `intro` is an array of plain paragraphs now; can become a Payload `richText` (Lexical) field later — call sites render an array of paragraphs, so the swap is contained.
- `nearbyAreas`/`faq` are structured arrays → Payload array fields.
- SEO fields grouped logically → a Payload `seo` group/tab.

### 2. Async data-access layer (the only thing that changes at migration)

Same file exports a static `LOCATIONS: Location[]` plus **async** accessors. They are async **today** (even though they read memory) so call sites already `await` — Payload's `find`/`findByID` are async.

```ts
export async function getAllLocations(): Promise<Location[]> {
  return LOCATIONS;
}

export async function getLocationSlugs(): Promise<string[]> {
  return LOCATIONS.map((l) => l.slug);
}

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  return LOCATIONS.find((l) => l.slug === slug) ?? null;
}
```

At Payload migration: reimplement these three to call `payload.find({ collection: 'locations' })` etc. **Nothing else in the app changes.** The page, components, sitemap, and metadata all consume only these functions.

### 3. Consumption rule

- The dynamic page, `generateStaticParams`, `generateMetadata`, and `sitemap.ts` all call the accessors (`await`), never the `LOCATIONS` array directly.
- Components receive a `Location` (or its fields) as **props** — they never import the data module. This keeps them CMS-source-agnostic.

### 4. Relationship to the existing `coverage.ts`

`coverage.ts` stays as-is and keeps powering the **map image** (`CoverageMap` plots `COVERAGE_CITIES`, the broad service area). The new `locations.ts` is a **separate concern**: the SEO landing-page content for the nearby ring. They overlap on a few names (Bydgoszcz, Solec Kujawski, Nakło) but are not merged — `coverage.ts` = "where pins show on the static map", `locations.ts` = "which places have a page + their content". The homepage map *list* switches from `COVERAGE_CITIES.slice(...)` to the `locations.ts`-driven linked `ScrollArea`. We do **not** need to add every ring village as a map pin; centering the city-page map via the new `center` prop is sufficient.

## Routing & rendering — `src/app/ogrodnik/[miasto]/page.tsx`

- `export async function generateStaticParams()` → `(await getLocationSlugs()).map((miasto) => ({ miasto }))`.
- `export async function generateMetadata({ params })` → look up by slug; return `{ title, description, alternates: { canonical: '/ogrodnik/{slug}' }, openGraph }`. If not found → return minimal metadata.
- Default export `async function` → `await getLocationBySlug(miasto)`; if null → `notFound()`. Otherwise render the page anatomy below.
- Note: in this Next version, dynamic `params` is async — read the local docs (`node_modules/next/dist/docs`) for the exact `params` typing/await convention before coding.

## Page anatomy (reuses existing components; new bits are presentational)

1. **`<SiteHeader>`** (new, slim) — logo → `/`, phone CTA. Breadcrumb `Strona główna › Ogrodnik › {Miasto}`.
2. **Localized hero** (new presentational, in the page or a `LocationHero` component) — H1 `Ogrodnik {Miasto} — usługi ogrodnicze`, the city `intro`, primary CTA (`tel:` + `#kontakt`).
3. **Services** — reuse `ServiceCatalog` with the enriched `services` (built from `SERVICES` as on the homepage; extract that builder so both pages share it).
4. **"Obszar obsługi"** (new presentational) — `nearbyAreas` chips + `travel` note + `km`. Cross-links 3–4 neighbouring location pages ("Obsługujemy też…").
5. **Process** — reuse `PROCESS` data (same markup pattern as homepage).
6. **Map** — reuse `CoverageMap`, centered on the city. First read `CoverageMap.tsx`'s current props/API, then add **optional** `center?: { lat: number; lng: number }` and `zoom?: number` props that default to the existing `MAP_CENTER`/`MAP_ZOOM` behavior (so the homepage is unchanged). The city page passes the location's `lat`/`lng`. A focused marker is nice-to-have, not required.
7. **FAQ** — the city's `faq` entries + 1–2 shared `FAQ` items.
8. **CTA** + **`<SiteFooter>`** (extracted, reused).

## Homepage map promotion (`#mapa` in `example-9/page.tsx`)

- Replace the static `<ul>` (currently `COVERAGE_CITIES.slice(0, 9)`) with a shadcn **`ScrollArea`** listing **all** ring locations from `getAllLocations()`, each row a **`<Link href={/ogrodnik/${slug}}>`** showing name + km + "→".
- `example-9/page.tsx` is a Server Component, so it can `await getAllLocations()` directly.
- Create `src/components/ui/scroll-area.tsx` by hand from the official shadcn **new-york** source (deps present: `radix-ui`, `cn`). Do not rely on the shadcn CLI (sandbox `npm` is blocked).

## SEO plumbing

- **`layout.tsx`**: add `metadataBase: new URL("https://kryscar.pl")` (enables canonical + absolute OG URLs).
- **Per-city `generateMetadata`** as above.
- **`sitemap.ts`**: emit `${BASE_URL}/ogrodnik/${slug}` for every location (await `getLocationSlugs()`), alongside the homepage. Keep `robots.ts` allowing `/ogrodnik/`.
- **JSON-LD** per city page: a `<script type="application/ld+json">` with `LocalBusiness` (name, telephone, areaServed = city, geo) + `BreadcrumbList`. Small `LocationJsonLd` component returning a script tag (server component, no client JS).
- **Internal links**: homepage map list → city pages; each city page → 3–4 neighbours.

## Shared component extraction

- Extract the inline footer from `example-9/page.tsx` (~lines 560–645) into `src/components/SiteFooter.tsx`; render it on both the homepage and city pages. Homepage must look identical after extraction (verify by diffing the rendered markup mentally / visually).
- Extract the homepage `services` enrichment (the `SERVICE_IMAGES`/`PRICES` map + `SERVICES.map(...)`) into a shared helper (e.g. `getCatalogServices()` in `src/lib/catalog.ts`) so both the homepage and city pages build the same `CatalogItem[]`. (This is presentation data, not CMS content — stays static.)

## Content uniqueness rules (anti-thin-content)

Each location's generated copy MUST differ meaningfully, not just by name token:
- Unique `intro` paragraphs referencing gmina/powiat, distance/`travel`, and real surrounding villages.
- A city-specific `faq` entry (e.g. "Czy dojeżdżacie do {Miasto}?") with a distinct answer.
- `localNote` describing plausible local context (property types, typical garden work) — kept truthful/general, not fabricated specifics.
- `metaTitle`/`metaDescription` unique per city.
- Rotated service emphasis in the hero copy where natural.
- No invented statistics, awards, or addresses.

## Out of scope

- No CMS now (migration-ready only). No per-city pricing. No blog. No changes to `/example-N`. No new map tiles provider.

## Verification

- `npx tsc --noEmit` + `npm run lint` (no test runner in this project).
- Manual: `npm run dev`, visit several `/ogrodnik/{slug}` pages (incl. an invalid slug → 404), confirm unique content, working map, breadcrumb, JSON-LD present (view source), homepage map list links through and scrolls. (User runs locally — sandbox can't start the dev server.)
- `npm run build` should statically generate all `/ogrodnik/*` pages (user runs locally).
