---
type: spec
summary: "Realizacje — a before/after project gallery for the high-ticket aranżacja/rabaty work. /realizacje index + /realizacje/[slug] detail pages, a Payload-ready projects data layer, a hand-rolled drag before/after slider (client island), homepage teaser + nav + footer surfacing. Placeholder before/after pairs fetched from Pixabay stock."
tags: [feature, ui, seo, data, gallery]
status: draft
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-pages]]", "[[service-catalog]]", "[[layout-chrome]]", "[[homepage-and-variants]]", "[[seo]]", "[[image-loading]]", "[[ogrodowe-abc]]", "[[city-landing-pages]]"]
sources: []
origin: "User: add a before/after gallery subpage for the high-ticket aranżacja/rabaty work — visual proof that closes premium jobs; as a homepage section, a nav item, and a footer item; use stock as placeholders for now. Decisions: name 'Realizacje' (route /realizacje); drag before/after slider (interactive); fetch dedicated before/after stock placeholders (user supplies real photos later); gallery index + per-project detail pages; homepage teaser placed right after the service catalog; add 'Realizacje' as the 7th header nav link."
---

# Realizacje (before/after gallery) — Design

**Date:** 2026-06-03
**Scope:** A project gallery proving the high-ticket **aranżacja** and **rabaty** work via interactive **before/after** comparisons. `/realizacje` (gallery index) + `/realizacje/[slug]` (per-project detail), a Payload-ready `projects.ts` data layer, a hand-rolled drag **before/after slider** client island, and surfacing via a homepage teaser (after the service catalog) + a header nav link + a footer link. Six seed projects with **stock placeholder** before/after pairs fetched from Pixabay (the user will swap in real photos later). `/ogrodnik`, the other `/example-N` variants, and the pricing calculator are untouched.

## Problem / goal

The catalog and service pages describe the premium work, but high-ticket aranżacja/rabaty jobs are closed by **visual proof** — seeing a tired plot become a designed garden. The site has no such proof surface. We want a gallery that:

1. shows believable **before → after transformations** with an engaging interaction,
2. links each transformation to the relevant offer (`/uslugi/aranzacja`, `/uslugi/rabaty`) to convert, and
3. is **consistent with the repo's existing patterns** (TS data layer + accessors, static pages, shared chrome, blur-up imagery) so it ships fast and stays CMS-ready.

## Approved decisions

- **Name / route:** "Realizacje", route `/realizacje`. Nav label + footer label: "Realizacje".
- **Interaction:** an interactive **drag before/after slider** (PRZED/PO), hand-rolled as a small `"use client"` island — no comparison-slider dependency.
- **Structure:** gallery **index** `/realizacje` + **per-project detail** `/realizacje/[slug]` (write-up, scope, slider, related offer, JSON-LD).
- **Images:** **fetch dedicated stock placeholders** — extend `fetch-stock.sh` with "before" (overgrown/neglected garden) + "after" (manicured/landscaped garden) queries; run it (PIXABAY_KEY is in `.env.local`); regenerate the blur map. The user supplies real photos later.
- **Surfacing:** homepage teaser (3 projects) **right after the service catalog** on `example-9`; **header nav** link (7th item, after "Katalog"); **footer** link (in the "Firma" column).
- **Architecture: Approach A** — `src/lib/projects.ts` const array + async accessors, mirroring `services.ts`/`guides.ts`. Fully static + daily ISR, Payload-migration-ready.

## Architecture

Routing, chrome, and SEO mirror `/ogrodowe-abc` and `/uslugi`. Net-new: the data layer, the slider island, a project card, a JSON-LD component, and two pages.

### Unit 1 — `src/lib/projects.ts` (data layer, new)

The **only** place that knows the project content source. `Project` mirrors a future Payload `projects`/`realizacje` collection (slug:text-unique, title/excerpt:text, category:select→a SERVICES slug, location:text, year:text, scope:array<{item}>, pairs:array<{before:upload, after:upload, caption?}>, body:array<{paragraph}> or richText, relatedService:relationship→services, metaTitle/metaDescription in an `seo` group). Migrate by reimplementing the accessors.

```ts
export interface BeforeAfter {
  before: string; // public path, must be in BLUR_DATA
  after: string;  // public path, must be in BLUR_DATA
  caption?: string;
}

export interface Project {
  slug: string;
  title: string;
  category: string;       // a SERVICES slug: "aranzacja" | "rabaty"
  excerpt: string;        // gallery card + meta fallback
  location: string;       // e.g. "Osielsko" (aligns with city pages where possible)
  year: string;           // e.g. "2025"
  scope: string[];        // "Zakres prac" bullets
  pairs: BeforeAfter[];   // ≥1 before/after comparison; pairs[0].after is the card cover
  body: string[];         // description paragraphs
  relatedService: string; // SERVICES slug → /uslugi/[slug] funnel
  metaTitle: string;
  metaDescription: string;
}

// Accessors (the public interface):
export async function getAllProjects(): Promise<Project[]>;           // newest-first (by year desc, then array order)
export async function getProjectSlugs(): Promise<string[]>;
export async function getProjectBySlug(slug: string): Promise<Project | null>;
export async function getProjectsForService(serviceSlug: string): Promise<Project[]>; // reverse lookup for /uslugi pages (future)
```

**Image paths are stored directly on the `Project`** (e.g. `/img/projects/ogrod-osielsko-after.jpg`) rather than via `IMG` keys — these are project-specific, not shared brand imagery, so 1:1 inline paths are clearer than a dozen `IMG` entries. Every path MUST be present in `BLUR_DATA` (guaranteed after the fetch + `npm run blur`).

**Invariant:** components/pages consume projects only via the async accessors — no component imports the `PROJECTS` array (Payload-migration boundary).
**Invariant:** every `before`/`after` path is present in `BLUR_DATA` so the slider always blurs up.

### Unit 2 — `src/components/BeforeAfterSlider.tsx` (client island, new)

`"use client"`. A fixed-aspect (`4/3`) comparison: the **after** image fills the box; the **before** image is layered on top, clipped to a width set by a handle position (0–100%). A vertical handle is draggable via mouse + touch (pointer events) and adjustable via keyboard (←/→, `role="slider"`, `aria-valuenow`, `aria-label="Porównanie przed i po"`). Corner labels **PRZED** / **PO**. Both images use `next/image` (`fill`, `object-cover`, `placeholder="blur"`); blur strings are passed in as props (the server page looks them up in `BLUR_DATA`) so the client bundle doesn't import the whole blur map.

Props: `{ beforeSrc, beforeBlur, afterSrc, afterBlur, beforeAlt, afterAlt }`. Pure presentational/interactive — no data-layer import. Initial handle at 50%.

### Unit 3 — `src/components/ProjectCard.tsx` (new)

Presentational gallery/teaser card: cover photo (`pairs[0].after` via `BlurImage`, aspect `4/3`) + a short category badge (a small local label map: `aranzacja`→"Aranżacja", `rabaty`→"Rabaty" — NOT the service-category `CATEGORIES` map, which keys different ids) + title + location · year. A small "PRZED / PO" pill hints it's a transformation. Wrapped in a `Link` to `/realizacje/[slug]`. Used by the index, the detail "inne realizacje", and the homepage teaser. The label map lives in `projects.ts` (e.g. exported `CATEGORY_LABELS`) so the card and detail page share one source.

### Unit 4 — `src/components/ProjectJsonLd.tsx` (new)

Modeled on `ArticleJsonLd`. Emits a `@graph`: `BreadcrumbList` (Strona główna › Realizacje › {title}) + an `ImageObject` for `pairs[0].after` (absolute URL, with `contentUrl` + `caption`/`name` from the title). Props: `{ title, url, image, breadcrumbs }`.

### Unit 5 — `src/app/realizacje/page.tsx` (gallery index, new)

`SiteHeader` → breadcrumb (Strona główna › Realizacje) → intro hero (what this is: "metamorfozy ogrodów, które zaprojektowaliśmy i wykonaliśmy") → a grid of `ProjectCard`s (all projects, newest-first) → CTA → `SiteFooter`. `metadata` (title/description/canonical `/realizacje`). Inline `BreadcrumbList` JSON-LD. `export const revalidate = 86400`.

### Unit 6 — `src/app/realizacje/[slug]/page.tsx` (detail, new)

`generateStaticParams` from `getProjectSlugs`. `generateMetadata` from the project's `metaTitle`/`metaDescription` + canonical `/realizacje/[slug]` + OpenGraph (`type: "article"`, the after image). Body:

1. `ProjectJsonLd`
2. `SiteHeader`
3. breadcrumb: Strona główna › Realizacje › {title}
4. header: category badge · location · year → `<h1>` {title} → intro/excerpt
5. **`BeforeAfterSlider`** for each entry in `pairs` (blur strings looked up from `BLUR_DATA` in the page and passed as props); caption under each
6. **"Zakres prac"** — `scope[]` checklist (reuse the `✓` list style from `/uslugi`)
7. body paragraphs
8. **related offer** — a card linking to `/uslugi/${relatedService}` (the conversion funnel), plus a `tel:` CTA
9. **"Inne realizacje"** — `ProjectCard`s for other projects (sliced)
10. `SiteFooter`

`getProjectBySlug` → `notFound()` on miss. `export const revalidate = 86400`.

## The 6 seed projects (placeholder content)

Real, publish-ready Polish write-ups (authored at implementation), Bydgoszcz-area, each tied to aranżacja or rabaty. Locations reuse city-page names where natural.

| # | slug | Tytuł | category | location | year |
|---|---|---|---|---|---|
| 1 | `metamorfoza-ogrodu-osielsko` | Metamorfoza ogrodu przydomowego w Osielsku | `aranzacja` | Osielsko | 2025 |
| 2 | `rabata-bylinowa-niemcz` | Rabata bylinowa zamiast trawnika — Niemcz | `rabaty` | Niemcz | 2025 |
| 3 | `front-domu-fordon` | Front domu: od betonu do zieleni — Bydgoszcz-Fordon | `aranzacja` | Bydgoszcz | 2024 |
| 4 | `uporzadkowany-ogrod-zoledowo` | Zaniedbany ogród → uporządkowana przestrzeń — Żołędowo | `aranzacja` | Żołędowo | 2025 |
| 5 | `rabata-przy-tarasie-osielsko` | Rabata ozdobna przy tarasie — Osielsko | `rabaty` | Osielsko | 2024 |
| 6 | `aranzacja-z-trawnikiem-biale-blota` | Aranżacja ogrodu z nowym trawnikiem — Białe Błota | `aranzacja` | Białe Błota | 2025 |

Each seed gets **one** before/after pair (`pairs` is an array, so real projects can add more), 4–5 `scope` bullets, 2 `body` paragraphs, and `metaTitle`/`metaDescription`. `relatedService` = the `category`.

## Images — fetched stock placeholders

Extend `scripts/fetch-stock.sh` with an `OUT_PROJECTS="$ROOT/public/img/projects"` section: for each project slug, fetch a **before** (queries like "overgrown garden weeds", "neglected backyard garden", "untidy garden lawn") and an **after** ("manicured garden landscaped", "designed flower garden", "backyard landscaping"), saving `…/<slug>-before.jpg` and `…/<slug>-after.jpg`. Then `npm run blur` regenerates `src/lib/blur-data.ts` with the 12 new entries. The fetch is run during implementation (key in `.env.local`).

Caveat (logged, not hidden): stock "before"/"after" are different plots, not the same garden — they convey the transformation idea for layout/feel, to be replaced by real paired photos. The slider locks both images to one aspect (`4/3`, `object-cover`) so mismatched source ratios still align.

## Surfacing

- **Nav** (`SiteHeader.tsx`): add a "Realizacje" `Link` (`/realizacje`) — 7th item, placed after "Katalog". Same `md:flex` styling; mobile already hides nav links behind the CTA, so no mobile crowding.
- **Footer** (`SiteFooter.tsx`): add a "Realizacje" link to the **"Firma"** column (with Zespół / Jak to działa / Opinie / FAQ).
- **Homepage** (`example-9`): a "Realizacje" teaser section (heading + "Zobacz wszystkie →" → `/realizacje` + 3 `ProjectCard`s) inserted **right after `<ServiceCatalog>`** and before the "Jak to działa" (`#proces`) section. Uses `Reveal`/`StaggerGrid` to match the page's motion idiom.
- **Sitemap** (`sitemap.ts`): add `/realizacje` (priority 0.7) + each `/realizacje/[slug]` (priority 0.7).

## Data flow

```
projects.ts (PROJECTS const) ─ async accessors ─┬─ /realizacje            → getAllProjects() → ProjectCard grid
                                                ├─ /realizacje/[slug]     → getProjectBySlug() → BeforeAfterSlider (×pairs) + ProjectJsonLd + related offer
                                                ├─ homepage (example-9)   → getAllProjects().slice(0,3) → teaser
                                                └─ sitemap.ts             → getAllProjects() → index + per-slug entries
```
Build-time static; both routes use daily ISR (revalidate=86400) so the site-wide winter banner in `SiteHeader` stays correct (per [[nav-unification]]).

## Error handling & edge cases

- **Unknown slug:** `getProjectBySlug` → `null` → `notFound()` (404), same as the other arcs.
- **Slider with one image / equal sizes:** handle defaults to 50%; clamps 0–100%; keyboard + pointer both clamp. If a `before`/`after` path is somehow missing from `BLUR_DATA`, the blur prop is `undefined` and `next/image` simply renders without a blur placeholder (no crash) — but the invariant + the fetch make this not happen.
- **Category integrity:** `category`/`relatedService` ∈ {aranzacja, rabaty} (both real SERVICES slugs); a bad slug would drop the related-offer card — caught in review.
- **No JS (slider):** the after image (full) is the base layer, so with JS disabled the user still sees the finished result; the before layer + handle are the progressive enhancement.

## Testing / verification

No test runner. Gate = **`npm run check`** (`tsc --noEmit` + `eslint` + Mind generator). Manual:
1. `npm run build` — `/realizacje` + 6 `/realizacje/[slug]` generate statically with `Revalidate 1d`.
2. Slider: drag with mouse + touch reveals before/after; keyboard arrows move the handle; labels show; images blur up and stay aligned.
3. Detail page: header, slider(s), Zakres prac, body, related-offer link resolves to `/uslugi/aranzacja|rabaty`, "inne realizacje" links resolve.
4. JSON-LD validates (BreadcrumbList + ImageObject).
5. `/sitemap.xml` includes `/realizacje` + all 6 detail URLs.
6. Nav "Realizacje" works; footer link works; homepage teaser shows 3 projects after the catalog and links through.
7. `npm run check` green (only the 3 pre-existing `<img>` warnings).

## Mind upkeep (on finish)

- **New zone** `kryscar-mind/map/zones/realizacje.md` — owns `/realizacje`, `/realizacje/[slug]`; anchors `getAllProjects`/`getProjectBySlug`/`getProjectSlugs`/`getProjectsForService`/`Project`/`BeforeAfterSlider`/`ProjectJsonLd`; globs `src/app/realizacje/**`, `src/lib/projects.ts`, `src/components/BeforeAfterSlider.tsx`, `src/components/ProjectCard.tsx`, `src/components/ProjectJsonLd.tsx`. Invariants: accessor-only boundary; before/after paths in BLUR_DATA; pages set revalidate=86400.
- **Re-stamp** `layout-chrome` (nav + footer link), `homepage-and-variants` (teaser), `seo` (sitemap), `image-loading` (new blur entries).
- **Decision record** `kryscar-mind/map/decisions/realizacje-gallery.md` — naming (Realizacje), drag-slider as a hand-rolled client island (no dep), fetched stock placeholders, image paths inline on Project (not IMG keys), per-project pages.
- Run `npm run mind`; commit `index.md`. Spec → `kryscar-mind/specs/`; plan → `kryscar-mind/plans/2026-06-03-realizacje-gallery-plan.md`.

## Out of scope (YAGNI)

- A lightbox/carousel of many photos per project (one before/after pair per seed; `pairs` array leaves the door open).
- Filtering/sorting the gallery by category (only 6 projects; revisit when there are many).
- A comparison-slider npm dependency (hand-rolled).
- `IMG`-key indirection for project images (paths inline on `Project`).
- Real photography, multi-pair projects, client testimonials per project (the user supplies real content later).
- Touching `/ogrodnik`, other `/example-N` variants, or the calculator.
