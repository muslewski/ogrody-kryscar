---
type: spec
summary: "Winter-services arc: /zima/[usluga] landing pages, a Payload-ready winter data layer, and a seasonal auto/override switch that escalates the homepage in winter."
tags: [seo, feature, data, seasonal]
status: planned
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]", "[[service-catalog]]", "[[seo]]", "[[homepage-and-variants]]", "[[coverage-map]]"]
sources: []
origin: "User: add a winter arc — odśnieżanie, świąteczne oświetlenie ogrodów, zimowe zabezpieczanie roślin. Each gets its own subpage; a homepage section mentions all three year-round; highlight it more once winter comes."
---

# Winter services arc — Design

**Date:** 2026-06-02
**Routes:** `/zima` (hub) + `/zima/[usluga]` (e.g. `kryscar.pl/zima/odsniezanie`)
**Scope:** New `/zima` route family + a Payload-ready winter data module + a pure seasonal engine + homepage integration (new "Usługi zimowe" section, seasonal escalation, nav link) + SEO plumbing. The `/example-N` variants and the summer catalog are untouched.

## Goal

Give Ogrody Kryscar a **winter revenue arc** that fills the Nov–Mar gap, where every core service (koszenie, grabienie, sadzenie) is dormant. Three winter offers each get a genuinely-useful, statically-rendered landing page targeting high-intent local queries ("odśnieżanie Bydgoszcz", "oświetlenie świąteczne ogrodu", "zabezpieczanie roślin na zimę"). The homepage mentions winter year-round and **escalates** (ribbon + promotion) when the season hits. Built so a later **PayloadCMS** migration is a swap of one data-access module, not a rewrite — exactly like the city pages.

## Approved decisions

- **Route shape:** `/zima/[usluga]` (single data-driven template) + a `/zima` hub page. Mirrors `/ogrodnik/[miasto]`; scales if more winter services are added; the hub is the landing target for the nav link and the seasonal banner.
- **Seasonal control:** auto-by-month **with manual override** — `WINTER.mode = "auto" | "on" | "off"`. `auto` escalates during the winter window; `on`/`off` force it (early cold snap, promo, or suppress).
- **Winter window:** **Listopad–marzec** (months 11, 12, 1, 2, 3). Captures the November świąteczne-oświetlenie run-up and late-March snow.
- **Data home:** a **separate** `src/lib/winter.ts` module — NOT folded into `SERVICES`. `SERVICES` is thin and drives the summer catalog filter; winter services need landing-page depth and must not pollute that catalog.
- **Freshness:** seasonal-state pages use daily ISR (`revalidate = 86400`) so the toggle flips within a day with no redeploy and no build-time-frozen `new Date()`.
- **Images:** v1 ships a gradient + icon treatment (no stock-photo dependency); image slots are pre-wired for later self-hosted winter photos.

## The three winter services

| slug | name | icon | what it is |
|---|---|---|---|
| `odsniezanie` | Odśnieżanie | `snowflake` | Snow & ice clearing — driveways, paths, entrances; same crew/clients/streets as mowing. |
| `swiateczne-oswietlenie` | Świąteczne oświetlenie ogrodów | `sparkles` | Install + removal of Christmas garden/façade lighting. Premium, Nov–Dec. |
| `zimowe-zabezpieczanie-roslin` | Zimowe zabezpieczanie roślin | `shield` | Wrapping, mulching, frost protection, structure/branch support. Paid winter product, not a freebie. |

`order` field controls display order (odśnieżanie → oświetlenie → zabezpieczanie).

## Architecture

### Unit 1 — Winter data layer (`src/lib/winter.ts`, new)

The ONLY module that knows the winter-services data source. Mirrors `locations.ts`.

```ts
export interface WinterServiceFaq { q: string; a: string; }

export interface WinterService {
  slug: string;          // ASCII, URL segment
  name: string;          // "Odśnieżanie"
  navLabel: string;      // short card/nav label
  icon: string;          // lucide-style key: snowflake | sparkles | shield
  tagline: string;       // one-line hook for the card
  hero: string[];        // intro paragraphs (landing-page depth)
  includes: string[];    // "Co obejmuje" bullets
  pricingNote: string;   // how pricing works (free quote, per m²/visit, etc.)
  faq: WinterServiceFaq[];
  metaTitle: string;
  metaDescription: string;
  image?: string;        // IMG key or path; optional in v1 (gradient fallback)
  order: number;
}

const WINTER_SERVICES: WinterService[] = [ /* 3 entries */ ];

export async function getWinterServices(): Promise<WinterService[]> { /* sorted by order */ }
export async function getWinterServiceSlugs(): Promise<string[]> { /* */ }
export async function getWinterServiceBySlug(slug: string): Promise<WinterService | null> { /* */ }
```

A `// MIGRATION (PayloadCMS)` header block (same style as `locations.ts`) documents the future `winterServices` collection so the swap touches only this file.

**Invariant:** components consume winter services only via the async accessors — no component imports `WINTER_SERVICES` directly (Payload-migration boundary). Mirrors the city-pages invariant.

### Unit 2 — Seasonal engine (`src/lib/season.ts`, new, pure)

```ts
export const WINTER_MONTHS = [11, 12, 1, 2, 3] as const; // Nov–Mar (1-based)

export type WinterMode = "auto" | "on" | "off";
export const WINTER: { mode: WinterMode } = { mode: "auto" };

/** Pure: month is 1-based (1=Jan). Override wins; auto falls back to month window. */
export function isWinterActive(month: number, mode: WinterMode = WINTER.mode): boolean {
  if (mode === "on") return true;
  if (mode === "off") return false;
  return (WINTER_MONTHS as readonly number[]).includes(month);
}

/** Convenience for server components: reads the current month. */
export function isWinterNow(now: Date = new Date()): boolean {
  return isWinterActive(now.getMonth() + 1);
}
```

Pure `isWinterActive(month, mode)` is the testable core (month injected). `isWinterNow()` is the server-component convenience. No test runner exists in this repo (`npm run check` = tsc + eslint + mind generator), so correctness is enforced by types + the function's purity, not a unit test.

### Unit 3 — `/zima/[usluga]` page (`src/app/zima/[usluga]/page.tsx`, new)

Data-driven template, structured like `ogrodnik/[miasto]/page.tsx`:

- `generateStaticParams()` → from `getWinterServiceSlugs()` (prerender all three).
- `generateMetadata()` → `metaTitle`/`metaDescription` + canonical `/zima/${slug}` + OpenGraph.
- Body: `<ServiceJsonLd>` → `<SiteHeader>` → breadcrumb (Strona główna › Zima › {name}) → hero (name + tagline + `hero[]` paragraphs + phone/wycena CTAs) → "Co obejmuje" (`includes[]`) → "Jak to działa" (reuse `PROCESS`) → coverage (`CoverageMap` + neighbour-city cross-links reused from city pages) → FAQ (`faq[]`) → CTA → `<SiteFooter>`.
- `notFound()` for unknown slugs.

### Unit 4 — `/zima` hub (`src/app/zima/page.tsx`, new)

Static page: hero ("Usługi zimowe — działamy cały rok"), three cards (one per winter service → subpage), brief why-winter copy, coverage map + CTA. Uses `SiteHeader`/`SiteFooter`. Static metadata. This is the landing target for the homepage "Zima" nav link and the winter banner.

### Unit 5 — `ServiceJsonLd` (`src/components/ServiceJsonLd.tsx`, new)

Emits JSON-LD `Service` (with `provider` = LocalBusiness Ogrody Kryscar, `areaServed`, `name`, `description`) for a winter service page. Parallels `LocationJsonLd`. The `/zima` hub may emit an `OfferCatalog`/`ItemList` of the three.

### Unit 6 — Homepage integration (`src/app/example-9/page.tsx`, edit)

- Compute `const winter = isWinterNow();` in the server component; set `export const revalidate = 86400;`.
- New **"Usługi zimowe"** section (3 cards → `/zima/[usluga]`), always present:
  - **Off-season:** calm placement (after the coverage map), muted heading: "Działamy też zimą — odśnieżanie, świąteczne oświetlenie, zabezpieczanie roślin."
  - **Winter mode (`winter === true`):** a top **ribbon** ("Sezon zimowy — odśnieżanie i zabezpieczanie ogrodu →" linking `/zima`), promoted treatment on the section, and the hero badge text swaps to a winter message. (Section stays in one DOM position; only prominence/ribbon/copy change — no DOM reordering, to keep layout safe.)
- Add a **"Zima"** nav link in the inline homepage header.

### Unit 7 — Shared header (`src/components/SiteHeader.tsx`, edit)

Add a "Zima" nav link so the winter pages (and city pages) expose it too.

### Unit 8 — SEO plumbing (`src/app/sitemap.ts`, edit)

Add `/zima` + each `/zima/${slug}` to the sitemap via `getWinterServiceSlugs()` (same async pattern already used for locations).

## Data flow

`winter.ts` (accessors) → server components (`/zima`, `/zima/[usluga]`, homepage) await accessors → pass plain `WinterService` props to presentational JSX. `season.ts` (`isWinterNow`) → homepage + `/zima` read seasonal state for escalation. No component imports `WINTER_SERVICES` or hardcodes the season — same boundary discipline as the city pages.

## Error handling

- Unknown `/zima/[slug]` → `notFound()`.
- `getWinterServiceBySlug` returns `null` (never throws) — page guards on null.
- Missing `image` → gradient + icon fallback (no broken `<img>`).
- Seasonal toggle is a pure boolean; `mode` is a closed union — no runtime parse.

## Testing / verification

No test runner in this repo. Verification gate = `npm run check` (tsc strict + eslint flat + mind generator). Plan tasks verify via:
- `npx tsc --noEmit` after each unit.
- `npx next build` / route smoke (prerender of `/zima` + 3 subpages, sitemap contains them).
- Manual seasonal check: temporarily set `WINTER.mode = "on"`/`"off"` to confirm escalation flips; revert to `"auto"`.

## SEO / content notes

- Thin-content avoidance: each subpage carries real depth (hero paragraphs, includes, FAQ, coverage) — same bar as the city pages.
- Keyword targets: "odśnieżanie Bydgoszcz", "oświetlenie świąteczne ogrodu Bydgoszcz", "zabezpieczanie roślin na zimę".
- Internal linking: subpages cross-link to nearby city pages (reuse the neighbour logic); homepage + `/zima` hub link down into subpages.

## Mind maintenance (per DEV RULE — same change as the code)

- New zone card `kryscar-mind/map/zones/winter-services.md` (owns: `src/app/zima/**`, `src/lib/winter.ts`, `src/lib/season.ts`, `src/components/ServiceJsonLd.tsx`; anchors: `symbol:getWinterServices`, `symbol:getWinterServiceBySlug`, `symbol:WinterService`, `symbol:isWinterActive`, `symbol:ServiceJsonLd`; routes: `/zima`, `/zima/[usluga]`; invariant: accessor-only boundary).
- Touch `seo`, `homepage-and-variants`, `layout-chrome` zone cards (new route in sitemap, homepage section, header link) and re-stamp their `verifiedAt` to HEAD.
- Decision records: (a) separate winter data module vs. folding into `SERVICES`; (b) seasonal escalation via pure engine + daily ISR + manual override.
- Tech-debt note: source self-hosted winter imagery (snow-cleared drive, garden lights, wrapped plants) via `fetch-stock.sh`; wire into `IMG`.
- Run `npm run mind` (or `/map-sync`); commit the regenerated `map/index.md`.

## Out of scope (YAGNI for v1)

- Winter × city matrix pages (`/zima/[usluga]/[miasto]`).
- Online booking / scheduling.
- Choinki sales / gift vouchers as products.
- Actual winter stock photography (slots wired; sourcing deferred to tech-debt).
