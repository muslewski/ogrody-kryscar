---
type: spec
summary: "Ogrodowe ABC — a seasonal gardening-guide content section (/ogrodowe-abc + /ogrodowe-abc/[slug]) targeting long-tail how-to/when-to queries. 6 cornerstone articles, a Payload-ready guides data layer mirroring services.ts/locations.ts, Article+FAQPage+Breadcrumb JSON-LD, sitemap + nav + two-way internal links to /uslugi and /zima offers, and a homepage teaser. Reuses existing imagery (no new fetch)."
tags: [feature, content, seo, data]
status: draft
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-pages]]", "[[winter-services]]", "[[city-landing-pages]]", "[[seo]]", "[[image-loading]]", "[[layout-chrome]]", "[[homepage-and-variants]]", "[[brand-data]]"]
sources: []
origin: "User: add a blog-like section under a better name; seasonal long-tail gardening content good for readers + SEO that drives organic traffic in the dead months and feeds the winter offers. Decisions: name = 'Ogrodowe ABC' (route /ogrodowe-abc); focused launch of ~6 cornerstone articles with real publish-ready Polish content; Approach A (TS data layer behind async accessors, mirroring services.ts/locations.ts); surface via header nav + reverse links on /uslugi & /zima pages + a homepage teaser (3 latest); reuse already-committed imagery, no Pixabay fetch."
---

# Ogrodowe ABC — Design

**Date:** 2026-06-03
**Scope:** A new editorial/SEO content section, **"Ogrodowe ABC"**, at `/ogrodowe-abc` (index) + `/ogrodowe-abc/[slug]` (article). Launch with **6 cornerstone, publish-ready Polish articles** spread across the seasons, each funneling to a real service or winter offer. Backed by a Payload-migration-ready `guides.ts` data layer that mirrors `services.ts` / `locations.ts`. Surfaced via header nav, two-way internal links with `/uslugi` & `/zima`, and a homepage teaser. `/ogrodnik`, the `/example-N` variants (except the chosen homepage, example-9), and the pricing calculator are untouched.

## Problem / goal

The site ranks for service and city queries but has no content targeting **informational long-tail** searches ("kiedy kosić trawnik", "jak przygotować ogród na zimę"). Those queries:

1. bring **organic traffic in the dead months** when nobody is buying, and
2. **feed the winter offers** — a reader who lands on "jak przygotować ogród na zimę" is one internal click from the `zabezpieczanie roślin` / `świąteczne oświetlenie` offers.

We want a content section that is genuinely useful to readers (real how-to guidance, not filler), strong for SEO (clean information architecture, `Article` + `FAQPage` structured data, two-way internal linking), and **consistent with the repo's existing patterns** so it ships fast and stays CMS-ready.

## Approved decisions

- **Name / route:** "Ogrodowe ABC", route `/ogrodowe-abc`. Friendly, beginner-oriented "krok po kroku" tone. (Nav label: "Ogrodowe ABC".)
- **Scope:** focused launch — the engine + **6 cornerstone articles** with real, publish-ready Polish content (no placeholders), authored in this work like the services/cities content.
- **Architecture: Approach A** — a single `src/lib/guides.ts` (typed const array + async accessors), mirroring `services.ts` / `locations.ts`. No MDX, no Payload-now. Fully static, `npm run check`-green, migration-ready.
- **Seasonal organization:** each article carries a `season` tag; the index groups/sorts by season. The *name* and the seasonal structure are independent (ABC name + seasonal content underneath).
- **Surfacing (all three):** (a) header nav link; (b) reverse "Warto wiedzieć / Poradnik" blocks on `/uslugi/[usluga]` and `/zima/[usluga]`; (c) a "z naszego poradnika" teaser (3 latest) on the homepage (example-9).
- **Imagery:** **reuse already-committed images** that are in `BLUR_DATA` — no Pixabay fetch needed for launch. Blur-up is guaranteed.

## The 6 cornerstone articles

Spread across the calendar; each funnels to a real offer. Slugs are SEO-clean Polish.

| # | slug | Tytuł (H1) | season | Long-tail target | relatedServices | relatedWinter |
|---|---|---|---|---|---|---|
| 1 | `kiedy-kosic-trawnik` | Kiedy i jak często kosić trawnik | `lato` (wiosna–lato) | „kiedy kosić trawnik", „jak często kosić trawnik" | `koszenie` | — |
| 2 | `wiosenne-porzadki-w-ogrodzie` | Wiosenne porządki w ogrodzie — od czego zacząć | `wiosna` | „wiosenne porządki w ogrodzie", „ogród po zimie" | `porzadki`, `pielegnacja` | — |
| 3 | `co-i-kiedy-sadzic` | Co i kiedy sadzić w ogrodzie — kalendarz nasadzeń | `wiosna` (wiosna/jesień) | „co kiedy sadzić", „kalendarz nasadzeń" | `sadzenie`, `rabaty` | — |
| 4 | `kiedy-ciac-zywoplot` | Kiedy ciąć żywopłot i krzewy ozdobne | `lato` | „kiedy ciąć żywopłot", „kiedy przycinać krzewy" | `ciecie` | — |
| 5 | `jak-przygotowac-ogrod-na-zime` | Jak przygotować ogród na zimę | `jesien` | „jak przygotować ogród na zimę", „zabezpieczanie roślin na zimę" | `porzadki`, `grabienie` | `zimowe-zabezpieczanie-roslin` |
| 6 | `swiateczne-oswietlenie-ogrodu` | Świąteczne oświetlenie ogrodu — jak zaplanować | `zima` | „oświetlenie świąteczne ogrodu", „lampki na ogród" | — | `swiateczne-oswietlenie` |

Seasonal coverage: wiosna ×2, lato ×2, jesień ×1, zima ×1 (article #3 reads as a wiosna/jesień evergreen). Articles **#5 and #6** are the dead-month / winter-offer feeders. Every active service family is represented except `aranzacja` (bespoke, low informational search volume — intentionally omitted for v1).

**Hero images (all already in `BLUR_DATA` — reuse, no fetch):**

| # | image (IMG key) | path |
|---|---|---|
| 1 | `IMG.manMowing` | `/img/garden/manMowing.jpg` |
| 2 | `IMG.gardenerYard` | `/img/garden/gardenerYard.jpg` |
| 3 | `IMG.sprout` | `/img/garden/sprout.jpg` |
| 4 | `IMG.hedgeShears` | `/img/garden/hedgeShears.jpg` |
| 5 | `IMG.wrappedPlants` | `/img/winter/wrappedPlants.jpg` |
| 6 | `IMG.gardenLights` | `/img/winter/gardenLights.jpg` |

(Dedicated photos can be fetched later via `fetch-stock.sh`; not required for launch.)

## Architecture

The routing, page chrome, and SEO mirror `/uslugi/[usluga]` and `/ogrodnik/[miasto]`; the only net-new pieces are the data layer, two pages, one JSON-LD component, and one card component.

### Unit 1 — `src/lib/guides.ts` (data layer, new)

The **only** place that knows the guide content source. `Guide` mirrors a future Payload `guides`/`posts` collection (slug:text-unique, title/excerpt:text, season:select, readMinutes:number, image:upload, publishedAt/updatedAt:date, relatedServices/relatedWinter:relationship, intro:array<{paragraph}> or richText, sections:array<{heading,paragraphs}> or richText/blocks, faq:array<{q,a}>, metaTitle:text + metaDescription:textarea in an `seo` group). To migrate: reimplement the accessors to read Payload. Nothing else changes.

```ts
export type Season = "wiosna" | "lato" | "jesien" | "zima" | "caloroczne";

export interface GuideSection { heading: string; paragraphs: string[]; }
export interface GuideFaq { q: string; a: string; }

export interface Guide {
  slug: string;
  title: string;            // H1
  excerpt: string;          // listing + meta fallback
  season: Season;
  readMinutes: number;
  img: string;              // hero, must be in BLUR_DATA
  publishedAt: string;      // ISO date (YYYY-MM-DD) — Article schema + sitemap lastmod
  updatedAt: string;        // ISO date
  relatedServices: string[];// SERVICES slugs → cards + funnel CTA
  relatedWinter?: string[]; // winter slugs (optional)
  intro: string[];          // lead paragraphs under H1
  sections: GuideSection[]; // h2 + paragraphs
  faq: GuideFaq[];
  metaTitle: string;
  metaDescription: string;
}

const GUIDES: Guide[] = [ /* the 6 articles, real authored content */ ];

// Accessors (the public interface — pages/components use only these):
export async function getAllGuides(): Promise<Guide[]>;        // sorted: SEASON_ORDER then publishedAt desc
export async function getGuideSlugs(): Promise<string[]>;
export async function getGuideBySlug(slug: string): Promise<Guide | null>;
export async function getGuidesForService(serviceSlug: string): Promise<Guide[]>; // reverse lookup for /uslugi pages
export async function getGuidesForWinter(winterSlug: string): Promise<Guide[]>;   // reverse lookup for /zima pages
```

`SEASON_ORDER = { wiosna, lato, jesien, zima, caloroczne }` gives a stable, season-first ordering for the index and the "latest" teaser. `getGuideBySlug` → `null` when not found.

**Invariant:** components/pages consume guides only via these async accessors — no component imports the `GUIDES` array (the Payload-migration boundary, same rule as services/locations/winter).

### Unit 2 — `src/app/ogrodowe-abc/page.tsx` (index, new)

`SiteHeader` → breadcrumb (Strona główna › Ogrodowe ABC) → intro hero (what the section is, who it's for) → a grid of `GuideCard`s **grouped by season** (wiosna / lato / jesień / zima headings) → CTA → `SiteFooter`. `generateMetadata` sets title/description + canonical `/ogrodowe-abc`. Optional `CollectionPage`/`BreadcrumbList` JSON-LD (low cost; include `BreadcrumbList` at minimum). Static.

### Unit 3 — `src/app/ogrodowe-abc/[slug]/page.tsx` (article, new)

`generateStaticParams` from `getGuideSlugs`. `generateMetadata` from the guide's `metaTitle`/`metaDescription` + canonical `/ogrodowe-abc/[slug]` + OpenGraph (type `"article"`). Page body:

1. `ArticleJsonLd` (Unit 4)
2. `SiteHeader`
3. breadcrumb: Strona główna › Ogrodowe ABC › {title}
4. header block: season badge · `publishedAt` (formatted) · `readMinutes` min czytania → H1 → intro paragraphs
5. hero `BlurImage` (`fill`, `preload`, `object-cover`, gated by `hasBlurImage(guide.img)` — always true here since we reuse committed images)
6. `sections.map` → `<h2>` + paragraphs (prose, `max-w-prose`)
7. FAQ — reuse the `<details>`/`<summary>` pattern from the service page
8. **Related offers**: cards linking to each `relatedServices` → `/uslugi/[slug]` and each `relatedWinter` → `/zima/[slug]` (the conversion funnel). Reuse the catalog projection (`getCatalogServices()`) for the service title/img.
9. **Zobacz też**: chips/cards linking to the other guides
10. CTA section (`tel:` + `mailto:`), same as the service page
11. `SiteFooter`

`getGuideBySlug` → `notFound()` on miss. Static.

### Unit 4 — `src/components/ArticleJsonLd.tsx` (new)

Modeled on `ServiceJsonLd`. Emits a `@graph` with:
- `Article` — `headline` (title), `description` (excerpt/metaDescription), `image` (absolute hero URL), `datePublished` (publishedAt), `dateModified` (updatedAt), `author` + `publisher` = the Ogrody Kryscar `Organization`/`LocalBusiness` (from `COMPANY`/`ADDRESS`), `mainEntityOfPage` = the article URL.
- `FAQPage` — built from the guide's `faq` (only when `faq.length > 0`).
- `BreadcrumbList` — Strona główna › Ogrodowe ABC › {title}.

Props: `{ title, description, url, image, datePublished, dateModified, faq, breadcrumbs }`.

### Unit 5 — `src/components/GuideCard.tsx` (new)

Small reusable card: hero `BlurImage` (aspect-[16/9] or [4/3]) + season badge + title + excerpt + `readMinutes`. Wrapped in a `Link` to `/ogrodowe-abc/[slug]`. Used by the index (Unit 2), the "zobacz też" list, the reverse blocks (Units 7–8), and the homepage teaser (Unit 9). Light, presentational, takes a `Guide` (or the subset it needs) as props.

### Unit 6 — `src/app/sitemap.ts` (edit)

Add, alongside the existing `getServiceSlugs`/`getWinterServiceSlugs`/`getLocationSlugs` block:
- `/ogrodowe-abc` (priority `0.7`, `changeFrequency: "monthly"`).
- one entry per guide: `/ogrodowe-abc/[slug]`, `priority 0.7`, `lastModified` from the guide's `updatedAt`. (Fetch `getAllGuides()` for the dates rather than just slugs.)

### Unit 7 — `src/components/SiteHeader.tsx` (edit)

Add an "Ogrodowe ABC" link in the nav cluster next to "Usługi" / "Zima" (same `hidden sm:block` styling), pointing to `/ogrodowe-abc`.

### Unit 8 — reverse links on offer pages (edit)

- `src/app/uslugi/[usluga]/page.tsx`: after the FAQ (or near "Zobacz też"), render a **"Warto wiedzieć"** block from `await getGuidesForService(svc.slug)` (skip if empty) — `GuideCard`s linking into Ogrodowe ABC.
- `src/app/zima/[usluga]/page.tsx`: same, from `getGuidesForWinter(svc.slug)`.

This is the two-way link that makes guides discoverable and **feeds the offers both directions**. Both pages already `await` data layers, so adding one more await is consistent.

### Unit 9 — homepage teaser (edit `src/app/example-9/page.tsx`)

Add a compact **"Z naszego poradnika"** section (3 latest guides via `getAllGuides()` sliced to 3) with `GuideCard`s + a "Zobacz wszystkie →" link to `/ogrodowe-abc`. The homepage is already `async` with `revalidate = 86400` (re-exported by `src/app/page.tsx`); guide data is static so this adds no new dynamic behavior. Placement: a new section in the existing page flow (e.g. before the final CTA/contact). This is the only edit that touches the `/example-N` tree — example-9 is the live homepage.

## Data flow

```
guides.ts (GUIDES const)
  └─ getAllGuides / getGuideSlugs / getGuideBySlug / getGuidesForService / getGuidesForWinter   (async accessors)
       ├─ /ogrodowe-abc            → getAllGuides() → grouped GuideCards
       ├─ /ogrodowe-abc/[slug]     → getGuideBySlug() → article + ArticleJsonLd + related offers (getCatalogServices, getWinterServices)
       ├─ /uslugi/[usluga]         → getGuidesForService(slug) → reverse "Warto wiedzieć" block
       ├─ /zima/[usluga]           → getGuidesForWinter(slug) → reverse block
       ├─ homepage (example-9)     → getAllGuides().slice(0,3) → teaser
       └─ sitemap.ts               → getAllGuides() → /ogrodowe-abc + per-slug entries (lastmod = updatedAt)
```

Everything is build-time static (no runtime data source); the homepage keeps its daily ISR purely for the existing seasonal toggle.

## Error handling & edge cases

- **Unknown slug:** `getGuideBySlug` → `null` → `notFound()` (404), same as `/uslugi`, `/zima`, `/ogrodnik`.
- **Empty reverse lists:** if a service/winter offer has no related guides, the "Warto wiedzieć" block is omitted entirely (no empty heading).
- **Image safety:** all hero images are reused committed files already in `BLUR_DATA`, so `hasBlurImage` is always true and `next/image` only receives existing paths. The gate is kept anyway for resilience.
- **Related-offer integrity:** `relatedServices`/`relatedWinter` slugs must match real `SERVICES`/`WINTER_SERVICES` slugs. Mismatches would silently drop a card — caught in review against the known slug sets (services: koszenie/pielegnacja/grabienie/sadzenie/ciecie/porzadki/aranzacja/rabaty; winter: odsniezanie/swiateczne-oswietlenie/zimowe-zabezpieczanie-roslin).

## Testing / verification

No test runner in this repo. Gate = **`npm run check`** (`tsc --noEmit` + `eslint` + the Mind generator). Manual verification:

1. `npm run build` succeeds; `/ogrodowe-abc` and all 6 `/ogrodowe-abc/[slug]` pages render statically.
2. Each article: H1, season/date/read-time meta, hero photo blurs up, sections + FAQ render, related-offer cards link to real `/uslugi`/`/zima` pages, "zobacz też" links resolve.
3. JSON-LD validates (Article + FAQPage + BreadcrumbList) — paste into Google's Rich Results test.
4. `/sitemap.xml` includes `/ogrodowe-abc` + all 6 article URLs with `lastmod`.
5. Header "Ogrodowe ABC" link works; reverse "Warto wiedzieć" blocks appear on the relevant `/uslugi` & `/zima` pages; homepage teaser shows 3 guides and links through.
6. `npm run check` is green (only the 3 pre-existing benign `<img>` warnings remain).

## Mind upkeep (on finish — same change as the code)

- **New zone:** `kryscar-mind/map/zones/ogrodowe-abc.md` — owns routes `/ogrodowe-abc`, `/ogrodowe-abc/[slug]`; anchors `getAllGuides`/`getGuideBySlug`/`getGuideSlugs`/`getGuidesForService`/`Guide`/`ArticleJsonLd`; globs `src/app/ogrodowe-abc/**`, `src/lib/guides.ts`, `src/components/ArticleJsonLd.tsx`, `src/components/GuideCard.tsx`. Invariant: components consume guides only via async accessors (Payload boundary). `verifiedAt` = merge HEAD.
- **Re-stamp touched zones:** `seo` (sitemap), `layout-chrome` (header nav), `service-pages` (reverse block), `winter-services` (reverse block), `homepage-and-variants` (teaser).
- **Decision record(s):** `kryscar-mind/map/decisions/` — the "Ogrodowe ABC" naming + the reuse-existing-imagery (no fetch) choice; note Approach A (TS data layer, not MDX/Payload-now) for consistency.
- Run `npm run mind` (or `/map-sync`); commit the regenerated `index.md`.
- Pipeline: this spec → `kryscar-mind/specs/`; the plan → `kryscar-mind/plans/2026-06-03-ogrodowe-abc-plan.md`.

## Out of scope (YAGNI)

- MDX/Markdown authoring, a Payload CMS collection (deferred — the data layer is migration-ready).
- Categories/tags beyond `season`, pagination, search, author bios, comments, RSS.
- An `aranzacja` guide (low informational search volume).
- Dedicated stock photography (reuse committed imagery; fetch later if desired).
- Touching `/ogrodnik`, the other `/example-N` variants, or the pricing calculator.
