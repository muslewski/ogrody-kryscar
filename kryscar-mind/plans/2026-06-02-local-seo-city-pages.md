---
type: plan
summary: "Task-by-task plan for the /ogrodnik/[miasto] city pages and migration-ready location layer."
tags: [seo, feature, data]
status: done
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]", "[[seo]]"]
sources: ["[[2026-06-02-local-seo-city-pages-design]]"]
implements: "[[2026-06-02-local-seo-city-pages-design]]"
produced: ["[[city-landing-pages]]", "[[seo]]", "[[payload-ready-location-layer]]", "[[single-source-site-url]]", "[[city-pages-avoid-thin-content]]"]
---
# Local SEO City Landing Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship ~11 statically-rendered, genuinely-unique `/ogrodnik/[miasto]` local landing pages and promote them from the homepage map, built so a future PayloadCMS migration is a swap of one data module.

**Architecture:** All location content flows through an **async data-access layer** (`getAllLocations`, `getLocationBySlug`, `getLocationSlugs`) over a typed `Location` interface that mirrors a future Payload `locations` collection. A single dynamic route prerenders every page via `generateStaticParams` and sets per-city SEO via `generateMetadata`. Pages/components consume only the accessors (await) or props — never the raw array.

**Tech Stack:** Next.js 16 App Router (async `params`), React Server Components, TypeScript, Tailwind v4, `radix-ui` (shadcn new-york), `motion`.

> **Verification:** no test runner exists (scripts: dev/build/start/lint). Per-task gate = `npx tsc --noEmit` + `npm run lint` (touched files add no new errors; the repo has PRE-EXISTING lint errors in unrelated files — ignore those). Final visual + `npm run build` is run locally by the user (sandbox blocks `npm` with `EPERM: uv_cwd`; if so, note it and rely on careful review).

> **Migration rule (every task):** components receive `Location` data as **props**; only the route page, `generateStaticParams`, `generateMetadata`, and `sitemap.ts` import the accessors. Never import the `LOCATIONS` array outside `src/lib/locations.ts`.

---

## File Structure

- **Create** `src/lib/locations.ts` — `Location` interface + `LOCATIONS` array + async accessors. (Task 1)
- **Create** `src/lib/catalog.ts` — shared `getCatalogServices()` builder. (Task 2)
- **Modify** `src/app/example-9/page.tsx` — use `getCatalogServices()`; use `<SiteFooter>`; promote map list. (Tasks 2, 4, 11)
- **Create** `src/components/ui/scroll-area.tsx` — shadcn new-york ScrollArea. (Task 3)
- **Create** `src/components/SiteFooter.tsx` — extracted footer. (Task 4)
- **Create** `src/components/SiteHeader.tsx` — slim header for city pages. (Task 5)
- **Create** `src/components/LocationJsonLd.tsx` — JSON-LD structured data. (Task 6)
- **Modify** `src/components/CoverageMap.tsx` — optional `center`/`zoom`. (Task 7)
- **Create** `src/app/ogrodnik/[miasto]/page.tsx` — the dynamic route. (Task 8)
- **Modify** `src/app/layout.tsx` — add `metadataBase`. (Task 9)
- **Modify** `src/app/sitemap.ts` — emit city URLs. (Task 10)

---

## Task 1: Location data + async access layer

**Files:**
- Create: `src/lib/locations.ts`

- [ ] **Step 1: Create the interface, data, and accessors**

Create `src/lib/locations.ts`. Start with this exact scaffold (interface + accessors + TWO complete example records). The accessors and interface must be copied verbatim; the two example records are the template for the rest.

```ts
/**
 * Location content for the per-city SEO landing pages (/ogrodnik/[slug]).
 *
 * MIGRATION (PayloadCMS): this module is the ONLY place that knows the data
 * source. The `Location` interface mirrors a future Payload `locations`
 * collection (slug:text-unique, name/gmina/powiat:text, km/lat/lng:number,
 * zip/travel:text, nearbyAreas:array<{value:text}>, intro:array<{paragraph}>
 * or richText, localNote:textarea, faq:array<{q:text,a:textarea}>,
 * metaTitle:text + metaDescription:textarea in an `seo` group).
 * To migrate: reimplement the three async accessors below to call
 * `payload.find(...)` / lookup by slug. NOTHING ELSE in the app changes —
 * pages/components consume only these accessors (await) or receive props.
 */

export interface LocationFaq {
  q: string;
  a: string;
}

export interface Location {
  slug: string;
  name: string;
  gmina: string;
  powiat: string;
  km: number;
  travel: string;
  lat: number;
  lng: number;
  zip: string;
  nearbyAreas: string[];
  intro: string[];
  localNote: string;
  faq: LocationFaq[];
  metaTitle: string;
  metaDescription: string;
}

const LOCATIONS: Location[] = [
  {
    slug: "bydgoszcz",
    name: "Bydgoszcz",
    gmina: "Bydgoszcz",
    powiat: "Bydgoszcz (miasto na prawach powiatu)",
    km: 0,
    travel: "nasza baza — dojeżdżamy tego samego dnia",
    lat: 53.1235,
    lng: 18.0084,
    zip: "85-001",
    nearbyAreas: ["Fordon", "Osowa Góra", "Szwederowo", "Bartodzieje", "Miedzyń"],
    intro: [
      "Ogrody Kryscar to ekipa ogrodnicza z bazą w Bydgoszczy. Koszenie trawników, pielęgnację zieleni i zakładanie ogrodów realizujemy w całym mieście — od Fordonu po Osową Górę.",
      "Działamy tu od 2014 roku, więc znamy lokalne warunki: gleby, nasłonecznienie osiedli domów jednorodzinnych i tempo, w jakim trawniki rosną w bydgoskim sezonie.",
    ],
    localNote:
      "W Bydgoszczy obsługujemy zarówno ogrody przydomowe, jak i tereny wspólnot oraz obiektów komercyjnych. Stała opieka sezonowa dostępna z gwarantowanym terminem w grafiku.",
    faq: [
      {
        q: "Jak szybko przyjedziecie na koszenie w Bydgoszczy?",
        a: "W granicach miasta zwykle tego samego lub następnego dnia roboczego — Bydgoszcz to nasza baza, więc nie doliczamy kosztów dojazdu.",
      },
    ],
    metaTitle: "Ogrodnik Bydgoszcz — koszenie, pielęgnacja, zakładanie ogrodów | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w Bydgoszczy: koszenie trawników, pielęgnacja ogrodu, cięcie krzewów, sadzenie i porządki. Bezpłatna wycena. Zadzwoń: +48 668 994 483.",
  },
  {
    slug: "niemcz",
    name: "Niemcz",
    gmina: "Osielsko",
    powiat: "bydgoski",
    km: 8,
    travel: "ok. 15 minut od naszej bazy w Bydgoszczy",
    lat: 53.1736,
    lng: 18.0950,
    zip: "86-032",
    nearbyAreas: ["Osielsko", "Żołędowo", "Maksymilianowo", "Jarużyn", "Myślęcinek"],
    intro: [
      "Niemcz w gminie Osielsko to jedna z miejscowości, do których dojeżdżamy najczęściej — dzieli nas od niej zaledwie kilkanaście minut drogi z Bydgoszczy.",
      "To okolica zadbanych ogrodów przydomowych, gdzie regularne koszenie i pielęgnacja żywopłotów ma realne znaczenie dla wyglądu całej posesji.",
    ],
    localNote:
      "W Niemczu i okolicy obsługujemy głównie domy jednorodzinne — od jednorazowego koszenia po stałą opiekę nad ogrodem przez cały sezon.",
    faq: [
      {
        q: "Czy dojeżdżacie do Niemcza?",
        a: "Tak, regularnie. Niemcz leży ok. 8 km od naszej bazy w Bydgoszczy — dojeżdżamy w około 15 minut, także do sąsiednich Osielska i Żołędowa.",
      },
    ],
    metaTitle: "Ogrodnik Niemcz (gm. Osielsko) — usługi ogrodnicze | Ogrody Kryscar",
    metaDescription:
      "Usługi ogrodnicze w Niemczu i gminie Osielsko: koszenie trawników, pielęgnacja, cięcie żywopłotów, sadzenie. Dojazd ok. 15 min. Zadzwoń: +48 668 994 483.",
  },
  // ... remaining 9 locations added in Step 2 (same shape, unique copy) ...
];

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

- [ ] **Step 2: Add the remaining 9 locations**

Append 9 more records to the `LOCATIONS` array (before the closing `]`), one per row below, each following the exact shape of the two examples. Write UNIQUE Polish copy for every text field — do NOT just swap the name. Use these verified-approximate geo values (the user will sanity-check):

| slug | name | gmina | powiat | km | lat | lng | zip |
|---|---|---|---|---|---|---|---|
| solec-kujawski | Solec Kujawski | Solec Kujawski | bydgoski | 18 | 53.0857 | 18.2336 | 86-050 |
| osielsko | Osielsko | Osielsko | bydgoski | 9 | 53.1869 | 18.0686 | 86-031 |
| biale-blota | Białe Błota | Białe Błota | bydgoski | 12 | 53.0936 | 17.9290 | 86-005 |
| koronowo | Koronowo | Koronowo | bydgoski | 27 | 53.3128 | 17.9381 | 86-010 |
| naklo-nad-notecia | Nakło nad Notecią | Nakło nad Notecią | nakielski | 30 | 53.1416 | 17.5961 | 89-100 |
| sicienko | Sicienko | Sicienko | bydgoski | 16 | 53.1714 | 17.8636 | 86-014 |
| dobrcz | Dobrcz | Dobrcz | bydgoski | 18 | 53.2386 | 18.1928 | 86-022 |
| zoledowo | Żołędowo | Osielsko | bydgoski | 10 | 53.1772 | 18.0858 | 86-031 |
| maksymilianowo | Maksymilianowo | Osielsko | bydgoski | 14 | 53.2025 | 18.1772 | 86-022 |

Uniqueness rules for each record:
- `travel`: phrase the distance/time differently per city.
- `nearbyAreas`: 4–5 REAL neighbouring villages/areas of that locality (not invented).
- `intro`: 2 paragraphs referencing gmina/powiat + a locally-plausible detail; distinct wording per city.
- `localNote`: 1–2 sentences, varied.
- `faq`: 1 city-specific Q&A (e.g. "Czy dojeżdżacie do {Miasto}?").
- `metaTitle` (≤ ~60 chars before the brand) and `metaDescription` (≤ ~155 chars) unique, each containing the city name + a service keyword.
- No invented stats, awards, addresses, or false claims.

- [ ] **Step 3: Type check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (If `npm` is blocked by sandbox EPERM, say so and instead re-read the file: confirm all 11 records have every field, all slugs are unique and ASCII, and the accessors are unchanged.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/locations.ts
git commit -m "Add location content + async data-access layer (Payload-migration-ready)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Shared catalog-services helper

**Files:**
- Create: `src/lib/catalog.ts`
- Modify: `src/app/example-9/page.tsx` (lines ~19-49)

- [ ] **Step 1: Create the helper**

Create `src/lib/catalog.ts` with the enrichment currently inline in `example-9/page.tsx`:

```ts
import { SERVICES, PRICES_FALLBACK_NOTE } from "@/lib/data"; // see note below
import { IMG } from "@/lib/data";
import type { CatalogItem } from "@/components/service-catalog";

const SERVICE_IMAGES: Record<string, string> = {
  koszenie: IMG.lawnTexture,
  pielegnacja: IMG.gardenerYard,
  grabienie: IMG.autumn1,
  sadzenie: IMG.sprout,
  ciecie: IMG.hedgeShears,
  porzadki: IMG.autumn3,
  aranzacja: IMG.daffodils,
  rabaty: IMG.echinacea,
};

const PRICES: Record<string, { from: string; duration: string }> = {
  koszenie: { from: "od 199 zł", duration: "~ 1 wizyta" },
  pielegnacja: { from: "od 349 zł", duration: "pakiet sezonowy" },
  grabienie: { from: "od 249 zł", duration: "~ 1 wizyta" },
  sadzenie: { from: "od 399 zł", duration: "wycena indywidualna" },
  ciecie: { from: "od 299 zł", duration: "~ 1 wizyta" },
  porzadki: { from: "od 449 zł", duration: "pakiet 2 wizyty" },
  aranzacja: { from: "wycena", duration: "projekt + realizacja" },
  rabaty: { from: "od 599 zł", duration: "projekt + sadzenie" },
};

/** Build the enriched catalog items used by <ServiceCatalog>. Presentation
 *  data (images + display pricing) — intentionally static, not CMS content. */
export function getCatalogServices(): CatalogItem[] {
  return SERVICES.map((s) => ({
    ...s,
    img: SERVICE_IMAGES[s.slug] ?? IMG.parkGarden,
    from: PRICES[s.slug]?.from ?? "wycena",
    duration: PRICES[s.slug]?.duration ?? "indywidualnie",
  }));
}
```

> NOTE: remove the bogus `PRICES_FALLBACK_NOTE` import — that line is a placeholder mistake; the only imports needed are `SERVICES` and `IMG` from `@/lib/data`. Correct the import to: `import { SERVICES, IMG } from "@/lib/data";`

- [ ] **Step 2: Use the helper in the homepage**

In `src/app/example-9/page.tsx`:
- Delete the local `SERVICE_IMAGES` const, the local `PRICES` const, and the `const services: CatalogItem[] = SERVICES.map(...)` block (lines ~22-49). Also delete the now-unused `type Service`/`Catalog`/`CatalogItem` local definitions IF present (Task from prior feature already imports `type CatalogItem`).
- Add import: `import { getCatalogServices } from "@/lib/catalog";`
- Where `services` was used (`<ServiceCatalog services={services} />`), define near the top of the component body: `const services = getCatalogServices();`
- Keep the `import { ServiceCatalog, type CatalogItem } from "@/components/service-catalog";` line (the `type CatalogItem` may now be unused in the page — if lint flags it, drop just the `type CatalogItem` part, keeping `ServiceCatalog`).
- Ensure `SERVICES`/`IMG` imports in the page are dropped only if no longer used elsewhere in the page (the footer uses `SERVICES`, and other sections use `IMG` — VERIFY with a search before removing; most likely both must stay).

- [ ] **Step 3: Type check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors; homepage still builds `services` via the helper.

- [ ] **Step 4: Commit**

```bash
git add src/lib/catalog.ts src/app/example-9/page.tsx
git commit -m "Extract shared getCatalogServices() helper

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: ScrollArea UI component

**Files:**
- Create: `src/components/ui/scroll-area.tsx`

- [ ] **Step 1: Create the component (shadcn new-york, using the unified `radix-ui` package)**

The project uses `import { X as XPrimitive } from "radix-ui"` (see `separator.tsx`) and `data-slot` attributes. Create `src/components/ui/scroll-area.tsx`:

```tsx
"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
```

- [ ] **Step 2: Type check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. If `ScrollAreaPrimitive.ScrollAreaScrollbar`/`ScrollAreaThumb`/`Corner` don't resolve under this `radix-ui` version, check the package's exported members and adjust the member names (they may be `Scrollbar`/`Thumb`); report as DONE_WITH_CONCERNS if you must change them.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/scroll-area.tsx
git commit -m "Add shadcn ScrollArea UI component

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Extract SiteFooter

**Files:**
- Create: `src/components/SiteFooter.tsx`
- Modify: `src/app/example-9/page.tsx` (footer block lines ~559-645)

- [ ] **Step 1: Create the component**

Create `src/components/SiteFooter.tsx` as a Server Component. Move the ENTIRE footer element from `example-9/page.tsx` (the `{/* FOOTER — catalog */}` comment + `<footer ...>` through its closing `</footer>` at line ~645) into this file, wrapped in a function. It needs these imports (it uses `COMPANY`, `SERVICES`, `ADDRESS`, `LEGAL_LINKS`, `Image`, `Socials` — verify the exact set against the moved JSX):

```tsx
import Image from "next/image";
import { COMPANY, SERVICES, ADDRESS, LEGAL_LINKS } from "@/lib/data";
import { Socials } from "@/components/Socials";

export function SiteFooter() {
  return (
    // ...the moved <footer>...</footer> JSX...
  );
}
```

CRITICAL — fix the in-footer anchors so they work from ANY page (city pages have no `#zespol` section):
- `href="#"` on the logo → `href="/"`
- every `href="#xxx"` (e.g. `#zespol`, `#proces`, `#opinie`, `#faq`, and the `href={` + "#" + `${s.slug}}` catalog links) → prefix with `/`: `href="/#zespol"`, `href={`/#${s.slug}`}`, etc. (Root-relative so they jump to the homepage section. The homepage itself still works with `/#...`.)

- [ ] **Step 2: Use it in the homepage**

In `src/app/example-9/page.tsx`:
- Replace the entire moved footer block with: `<SiteFooter />`
- Add import: `import { SiteFooter } from "@/components/SiteFooter";`
- Remove now-unused imports from the page IF nothing else uses them (verify: `Socials`, `LEGAL_LINKS`, `ADDRESS` may now be footer-only → remove from page; `Image`, `COMPANY`, `SERVICES` are likely used elsewhere → keep). Use a search to confirm before removing each.

- [ ] **Step 3: Type check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors, no unused-import warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/SiteFooter.tsx src/app/example-9/page.tsx
git commit -m "Extract SiteFooter into a reusable component; root-relative anchors

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: SiteHeader (slim header for city pages)

**Files:**
- Create: `src/components/SiteHeader.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/SiteHeader.tsx` (Server Component). A slim sticky top bar: logo → `/`, and a phone CTA. Match the site's neutral/emerald palette and `max-w-7xl` container.

```tsx
import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt={`${COMPANY.name} logo`}
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg"
          />
          <span className="text-base font-semibold tracking-tight">
            {COMPANY.name}
          </span>
        </Link>
        <a
          href={`tel:${COMPANY.phoneRaw}`}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          {COMPANY.phone}
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Type check + lint** → `npx tsc --noEmit && npm run lint` (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/SiteHeader.tsx
git commit -m "Add slim SiteHeader for landing pages

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: LocationJsonLd (structured data)

**Files:**
- Create: `src/components/LocationJsonLd.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/LocationJsonLd.tsx` (Server Component, no client JS) that renders `LocalBusiness` + `BreadcrumbList` JSON-LD for a location. It takes a `Location` as a prop (migration rule: data via props).

```tsx
import { COMPANY } from "@/lib/data";
import type { Location } from "@/lib/locations";

const BASE_URL = "https://kryscar.pl";

export function LocationJsonLd({ location }: { location: Location }) {
  const url = `${BASE_URL}/ogrodnik/${location.slug}`;
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        name: `${COMPANY.name} — ogrodnik ${location.name}`,
        url,
        telephone: COMPANY.phone,
        email: COMPANY.email,
        areaServed: {
          "@type": "City",
          name: location.name,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: location.lat,
          longitude: location.lng,
        },
        description: location.metaDescription,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Strona główna", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Ogrodnik", item: `${BASE_URL}/ogrodnik` },
          { "@type": "ListItem", position: 3, name: location.name, item: url },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
```

- [ ] **Step 2: Type check + lint** → `npx tsc --noEmit && npm run lint` (no errors; keep the eslint-disable only if lint flags `no-danger`).

- [ ] **Step 3: Commit**

```bash
git add src/components/LocationJsonLd.tsx
git commit -m "Add LocationJsonLd structured-data component

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: CoverageMap optional center/zoom

**Files:**
- Modify: `src/components/CoverageMap.tsx`

- [ ] **Step 1: Add optional props, defaulting to current behavior**

In `src/components/CoverageMap.tsx`:
- Add to `CoverageMapProps`:
```ts
  /** Override map center (defaults to MAP_CENTER from coverage.ts). */
  center?: { lat: number; lng: number };
  /** Override zoom (defaults to MAP_ZOOM). */
  zoom?: number;
```
- Thread them through. In `buildMapboxUrl` and `buildOsmUrl`, replace the hardcoded `MAP_CENTER`/`MAP_ZOOM` usages with parameters. Add `center` and `zoom` params to both builder signatures and the call sites. Concretely:
  - `buildMapboxUrl`: add `center: { lat: number; lng: number }` and `zoom: number` params; change the `center` line to `const center = \`${center.lat},... \`` — careful: rename to avoid shadowing; use the param. Final: `` const c = `${centerArg.lng},${centerArg.lat},${zoom},0`; `` and use `c` in the URL.
  - `buildOsmUrl`: add the same params; use `center.lat`/`center.lng` and `zoom` in the query string instead of `MAP_CENTER`/`MAP_ZOOM`.
- In the `CoverageMap` function signature add `center = MAP_CENTER, zoom = MAP_ZOOM` defaults, and pass them into both builders.
- Keep `MAP_CENTER`/`MAP_ZOOM` imported (now used as defaults).

- [ ] **Step 2: Type check + lint** → `npx tsc --noEmit && npm run lint`. Expected: no errors; the homepage `<CoverageMap ... />` (no center/zoom) renders exactly as before.

- [ ] **Step 3: Commit**

```bash
git add src/components/CoverageMap.tsx
git commit -m "CoverageMap: optional center/zoom props (default unchanged)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: The dynamic route page

**Files:**
- Create: `src/app/ogrodnik/[miasto]/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/ogrodnik/[miasto]/page.tsx`. Server Component. Uses async `params` (confirmed via node_modules docs: `params: Promise<{ miasto: string }>`, `await params`). Reuses `SiteHeader`, `ServiceCatalog`, `getCatalogServices`, `CoverageMap`, `SiteFooter`, `LocationJsonLd`, `PROCESS`, `COMPANY`.

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY, PROCESS } from "@/lib/data";
import {
  getAllLocations,
  getLocationBySlug,
  getLocationSlugs,
} from "@/lib/locations";
import { getCatalogServices } from "@/lib/catalog";
import { ServiceCatalog } from "@/components/service-catalog";
import { CoverageMap } from "@/components/CoverageMap";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocationJsonLd } from "@/components/LocationJsonLd";
import { Reveal } from "@/components/motion";

export async function generateStaticParams() {
  const slugs = await getLocationSlugs();
  return slugs.map((miasto) => ({ miasto }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ miasto: string }>;
}): Promise<Metadata> {
  const { miasto } = await params;
  const loc = await getLocationBySlug(miasto);
  if (!loc) return { title: "Nie znaleziono" };
  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    alternates: { canonical: `/ogrodnik/${loc.slug}` },
    openGraph: {
      title: loc.metaTitle,
      description: loc.metaDescription,
      url: `/ogrodnik/${loc.slug}`,
      type: "website",
    },
  };
}

export default async function OgrodnikMiastoPage({
  params,
}: {
  params: Promise<{ miasto: string }>;
}) {
  const { miasto } = await params;
  const loc = await getLocationBySlug(miasto);
  if (!loc) notFound();

  const services = getCatalogServices();
  const neighbours = (await getAllLocations())
    .filter((l) => l.slug !== loc.slug)
    .slice(0, 6);

  return (
    <main className="bg-white text-neutral-900">
      <LocationJsonLd location={loc} />
      <SiteHeader />

      {/* Breadcrumb */}
      <nav
        aria-label="Okruszki"
        className="mx-auto max-w-7xl px-4 pt-6 text-xs text-neutral-500 sm:px-6"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-emerald-700">Strona główna</Link></li>
          <li aria-hidden>›</li>
          <li>Ogrodnik</li>
          <li aria-hidden>›</li>
          <li className="text-neutral-900">{loc.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
            {loc.gmina !== loc.name ? `gm. ${loc.gmina} · ` : ""}pow. {loc.powiat}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Ogrodnik {loc.name} — usługi ogrodnicze
          </h1>
          {loc.intro.map((p, i) => (
            <p key={i} className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
              {p}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Zadzwoń: {COMPANY.phone}
            </a>
            <a
              href="#kontakt"
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium transition-colors hover:border-emerald-700 hover:text-emerald-700"
            >
              Bezpłatna wycena
            </a>
          </div>
        </Reveal>
      </section>

      {/* Services (reused) */}
      <ServiceCatalog services={services} />

      {/* Obszar obsługi */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Obszar obsługi — {loc.name} i okolice
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            {loc.localNote} Dojazd: {loc.travel}
            {loc.km > 0 ? ` (ok. ${loc.km} km od bazy w Bydgoszczy).` : "."}
          </p>
          {loc.nearbyAreas.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {loc.nearbyAreas.map((a) => (
                <li key={a} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm text-neutral-700">
                  {a}
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </section>

      {/* Process (reused data) */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Jak to działa</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {PROCESS.map((p) => (
              <li key={p.no} className="rounded-3xl border border-neutral-200 bg-white p-6">
                <p className="text-xs font-semibold text-emerald-700">{p.no}</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{p.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Map centered on the city */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white p-2">
          <CoverageMap
            variant="streets"
            aspect="16/9"
            center={{ lat: loc.lat, lng: loc.lng }}
            zoom={11}
            rounded="rounded-[20px]"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Najczęstsze pytania</h2>
        <div className="mt-8 divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          {loc.faq.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer items-start gap-4 px-6 py-5 transition hover:bg-neutral-50">
                <span className="flex-1 text-base font-semibold tracking-tight">{f.q}</span>
                <span aria-hidden className="text-neutral-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-prose px-6 pb-5 text-sm leading-relaxed text-neutral-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cross-links to neighbouring city pages (internal-link SEO) */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Obsługujemy też</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {neighbours.map((n) => (
            <li key={n.slug}>
              <Link
                href={`/ogrodnik/${n.slug}`}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 transition-colors hover:border-emerald-700 hover:text-emerald-700"
              >
                Ogrodnik {n.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section id="kontakt" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-12">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Zacznijmy <span className="text-emerald-700">od rozmowy.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">
            Zostaw kontakt lub zadzwoń — w ciągu jednego dnia roboczego potwierdzimy termin oględzin w {loc.name}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`tel:${COMPANY.phoneRaw}`} className="rounded-2xl bg-neutral-900 px-6 py-4 text-white transition hover:bg-emerald-700">
              {COMPANY.phone}
            </a>
            <a href={`mailto:${COMPANY.email}`} className="rounded-2xl border border-neutral-200 px-6 py-4 transition hover:border-emerald-700">
              {COMPANY.email}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
```

- [ ] **Step 2: Type check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. Verify `Reveal` is exported from `@/components/motion` (it is, per the homepage import). If `PROCESS` items use a different field than `no`/`title`/`desc`, adjust to the real fields (they are `no`, `title`, `desc` per data.ts).

- [ ] **Step 3: Commit**

```bash
git add src/app/ogrodnik/[miasto]/page.tsx
git commit -m "Add /ogrodnik/[miasto] dynamic local landing page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: metadataBase

**Files:**
- Modify: `src/app/layout.tsx` (lines 133-140)

- [ ] **Step 1: Add metadataBase**

Change the metadata export to add `metadataBase` (enables canonical + absolute OG URLs from the city pages):

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://kryscar.pl"),
  title: "Ogrody Kryscar — Profesjonalne usługi ogrodnicze",
  description:
    "Koszenie trawników, pielęgnacja ogrodu, grabienie liści, sadzenie roślin i przycinanie krzewów. Zadbamy o Twój ogród.",
  // Emits <meta name="apple-mobile-web-app-title" content="Kryscar" />
  // (per realfavicongenerator instructions, the App Router way).
  appleWebApp: { title: "Kryscar" },
};
```

- [ ] **Step 2: Type check + lint** → `npx tsc --noEmit && npm run lint` (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "Add metadataBase for canonical + OG URLs

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Sitemap includes city pages

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Emit a URL per location**

Replace `src/app/sitemap.ts` with:

```ts
import type { MetadataRoute } from "next";
import { getLocationSlugs } from "@/lib/locations";

const BASE_URL = "https://kryscar.pl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getLocationSlugs();
  const now = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...slugs.map((slug) => ({
      url: `${BASE_URL}/ogrodnik/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
```

(The sitemap function is now `async` because it awaits the accessor — this is the Payload-ready shape.)

- [ ] **Step 2: Type check + lint** → `npx tsc --noEmit && npm run lint` (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "Sitemap: include /ogrodnik city pages

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Promote the homepage map list into linked, scrollable cities

**Files:**
- Modify: `src/app/example-9/page.tsx` (map section, the `<ul>` at lines ~395-405 inside `#mapa`)

- [ ] **Step 1: Make the page able to read locations**

`example-9/page.tsx`'s default export is a Server Component. Make it `async` if not already, and near the top of the component body add:
```ts
const locations = await getAllLocations();
```
Add imports:
```ts
import Link from "next/link";
import { getAllLocations } from "@/lib/locations";
import { ScrollArea } from "@/components/ui/scroll-area";
```
(If `Link` is already imported, don't duplicate.)

- [ ] **Step 2: Replace the static city `<ul>` with a scrollable list of links**

In the `#mapa` section, replace the existing `<ul>` block (currently mapping `COVERAGE_CITIES.slice(0, 9)`) with:

```tsx
              <ScrollArea className="mt-6 h-72 border-t border-neutral-200 pt-3">
                <ul className="flex flex-col gap-1 pr-3">
                  {locations.map((l) => (
                    <li key={l.slug}>
                      <Link
                        href={`/ogrodnik/${l.slug}`}
                        className="group flex items-center justify-between rounded-xl px-2 py-2 text-sm transition-colors hover:bg-neutral-50"
                      >
                        <span className="font-medium text-neutral-900 group-hover:text-emerald-700">
                          Ogrodnik {l.name}
                        </span>
                        <span className="flex items-center gap-3 text-xs text-neutral-500">
                          <span className="tabular-nums">{l.km === 0 ? "baza" : `${l.km} km`}</span>
                          <span aria-hidden className="text-emerald-700">→</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
```

Leave the surrounding card (the zip-lookup input, label, `COVERAGE_NOTE`) intact. If `COVERAGE_CITIES` is now unused in the page, remove it from the coverage import (verify first).

- [ ] **Step 3: Type check + lint** → `npx tsc --noEmit && npm run lint` (no errors).

- [ ] **Step 4: Commit**

```bash
git add src/app/example-9/page.tsx
git commit -m "Homepage map: scrollable list linking to /ogrodnik city pages

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Verification (local — user runs)

**Files:** none.

- [ ] **Step 1: Build (static generation check)**

Run: `npm run build`
Expected: build succeeds and the output lists all `/ogrodnik/[miasto]` routes as prerendered (●/SSG) — one per location.

- [ ] **Step 2: Dev visual check**

Run: `npm run dev`, then verify:
- `/ogrodnik/bydgoszcz`, `/ogrodnik/niemcz`, `/ogrodnik/osielsko` each load with UNIQUE hero copy, intro, FAQ, and a map centered on that city.
- An invalid slug (e.g. `/ogrodnik/xyz`) returns 404.
- Breadcrumb, header phone CTA, services filter, and footer all work; footer links go to `/#...` on the homepage.
- View source: each page has one `<script type="application/ld+json">` with LocalBusiness + BreadcrumbList; `<title>`/`<meta name="description">`/canonical differ per city.
- Homepage `#mapa`: the city list is scrollable (ScrollArea) and every row links to its `/ogrodnik/{slug}` page.
- `/sitemap.xml` lists the homepage + all `/ogrodnik/*` URLs.

- [ ] **Step 3: No commit** (verification only). Fix issues in the relevant task file and re-run its lint/typecheck step.

---

## Self-Review Notes (author check)

- **Spec coverage:** data-access layer + `Location` mirror (T1) ✓; async accessors (T1) ✓; shared catalog helper (T2) ✓; ScrollArea (T3) ✓; SiteFooter extraction w/ root-relative anchors (T4) ✓; slim header (T5) ✓; JSON-LD LocalBusiness+breadcrumb (T6) ✓; CoverageMap center/zoom (T7) ✓; dynamic route w/ generateStaticParams + generateMetadata + page anatomy + cross-links (T8) ✓; metadataBase (T9) ✓; sitemap city URLs (T10) ✓; homepage map promotion w/ ScrollArea links (T11) ✓; build/visual verification (T12) ✓.
- **Migration rule honored:** only T1 defines data; T8/T10 consume accessors via `await`; T6 + all UI take props. No component imports `LOCATIONS`.
- **Async correctness:** `params` awaited (per node_modules docs); `getAllLocations()` awaited in the page and sitemap; `example-9` page made `async` to await locations.
- **Type consistency:** `CatalogItem` from `service-catalog.tsx` reused by `catalog.ts` and the page; `Location`/`LocationFaq` from `locations.ts` used by `LocationJsonLd` and the page.
- **Known risks flagged inline:** radix ScrollArea member names (T3 Step 2), unused-import cleanup requiring search-before-remove (T2/T4/T11), bogus import to delete (T2 Step 1 note).
