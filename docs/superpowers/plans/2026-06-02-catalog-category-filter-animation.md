# Catalog Category Filter with Reorder Animation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage "Katalog" category pills actually filter the service cards, with cards animating into their new grid positions (pol-med `/edukacja` style).

**Architecture:** Add a `category` field + `CATEGORIES` list to the data layer. Extract the filter bar + catalog grid out of the Server Component homepage into a new `"use client"` island that owns the single-select filter state and renders the reorder animation with Framer Motion (`motion`). The page stays a Server Component and passes the enriched `services` array down as a prop.

**Tech Stack:** Next.js 16 (App Router), React, TypeScript, Tailwind, `motion@12.39.0` (`motion/react`).

> **Note on verification:** this project has **no test runner** (package.json scripts are only `dev`, `build`, `start`, `lint`). So the automated gate for each task is `npx tsc --noEmit` (type check) + `npm run lint`, followed by a final manual visual check via `npm run dev`. If the sandbox blocks `npm`/`npx` with `EPERM: uv_cwd`, run these locally instead — the changes are pure, reviewable edits.

---

## File Structure

- **Modify** `src/lib/data.ts` — add `category` to each `SERVICES` item; export `CATEGORIES`.
- **Create** `src/components/service-catalog.tsx` — `"use client"` island: filter bar + animated grid + state.
- **Modify** `src/app/example-9/page.tsx` — remove dead `filters` const, remove inline filter bar + catalog JSX, render `<ServiceCatalog services={services} />`.

---

## Task 1: Data layer — categories

**Files:**
- Modify: `src/lib/data.ts:44-109` (SERVICES array) and add `CATEGORIES` right after it.

- [ ] **Step 1: Add `category` to each service**

In `src/lib/data.ts`, add a `category` field to every object in `SERVICES`. The exact mapping (insert the `category` line next to each, e.g. directly under `slug`):

| slug | category |
|---|---|
| koszenie | `"trawnik"` |
| pielegnacja | `"porzadki"` |
| grabienie | `"porzadki"` |
| sadzenie | `"sadzenie"` |
| ciecie | `"ciecie"` |
| porzadki | `"porzadki"` |
| aranzacja | `"projekt"` |
| rabaty | `"sadzenie"` |

For example, the first item becomes:

```ts
  {
    slug: "koszenie",
    category: "trawnik",
    title: "Koszenie trawników",
    short: "Równe, zdrowe i gęste trawniki.",
    description:
      "Regularne koszenie z dobraną wysokością cięcia, mulczowanie i odbiór skoszonej trawy. Trawnik bez plam i kęp.",
    icon: "scissors",
  },
```

Apply the same pattern (add the matching `category:` line) to all 8 items per the table above.

- [ ] **Step 2: Export the category list**

Immediately after the `SERVICES` array closes (after line `];` at the end of SERVICES), add:

```ts
// Catalog filter categories. `id` is matched against each service's
// `category` field; `all` is the reset pill that shows everything.
export const CATEGORIES = [
  { id: "all", label: "Wszystkie" },
  { id: "trawnik", label: "Trawnik" },
  { id: "ciecie", label: "Cięcie" },
  { id: "sadzenie", label: "Sadzenie" },
  { id: "porzadki", label: "Porządki" },
  { id: "projekt", label: "Projekt" },
] as const;
```

- [ ] **Step 3: Type check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (`SERVICES` now has a `category` field on every item; nothing references it yet, so this is a clean compile.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/data.ts
git commit -m "Add service categories and CATEGORIES list for catalog filter"
```

---

## Task 2: ServiceCatalog client component

**Files:**
- Create: `src/components/service-catalog.tsx`

- [ ] **Step 1: Create the component file**

Create `src/components/service-catalog.tsx` with exactly this content:

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SERVICES, CATEGORIES } from "@/lib/data";
import { HoverCard } from "@/components/motion";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";

type Service = (typeof SERVICES)[number];
export type CatalogItem = Service & {
  img: string;
  from: string;
  duration: string;
};

export function ServiceCatalog({ services }: { services: CatalogItem[] }) {
  const [active, setActive] = useState<string>("all");
  const shown =
    active === "all"
      ? services
      : services.filter((s) => s.category === active);

  return (
    <>
      {/* Filter bar */}
      <div className="border-y border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-3 sm:px-6">
          <span className="shrink-0 text-xs uppercase tracking-widest text-neutral-500">
            Kategoria:
          </span>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
                active === c.id
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
              }`}
            >
              {c.label}
            </button>
          ))}
          <span className="ml-auto hidden shrink-0 text-xs text-neutral-500 md:inline">
            {shown.length} usług dostępnych
          </span>
        </div>
      </div>

      {/* CATALOG */}
      <section
        id="katalog"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12"
      >
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {shown.map((s, i) => {
              // Stable per-service number from the original catalog order,
              // so it doesn't reshuffle when the list is filtered.
              const num = services.findIndex((x) => x.slug === s.slug) + 1;
              return (
                <motion.article
                  key={s.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    layout: { type: "spring", stiffness: 260, damping: 30 },
                    duration: 0.3,
                    delay: i * 0.03,
                  }}
                  className="h-full"
                >
                  {/* HoverCard owns the lift + shadow as a motion gesture
                      (touch-filtered, spring) so it can't stick/flicker on
                      mobile. `group` stays for the child group-hover effects. */}
                  <HoverCard className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                      <WarpedHoverImage
                        src={s.img}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      {s.slug === "pielegnacja" && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-emerald-700 px-3 py-1 text-xs font-medium text-white">
                          Najpopularniejsze
                        </span>
                      )}
                      {s.slug === "aranzacja" && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-amber-400 px-3 py-1 text-xs font-medium text-neutral-900">
                          Projekt + realizacja
                        </span>
                      )}
                      <span className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
                        0{num}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg font-semibold leading-tight tracking-tight">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                        {s.short}
                      </p>
                      <div className="mt-5 flex items-end justify-between border-t border-neutral-100 pt-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-neutral-500">
                            {s.duration}
                          </p>
                          <p className="text-lg font-semibold tracking-tight">
                            {s.from}
                          </p>
                        </div>
                        <a
                          href="#kontakt"
                          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white transition-colors group-hover:bg-emerald-700"
                        >
                          Zamów →
                        </a>
                      </div>
                    </div>
                  </HoverCard>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
```

> Note: `0{num}` produces `01`–`08` for the 8 services (all single-digit). This matches the previous `0{i + 1}` format.

- [ ] **Step 2: Type check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. The component is not yet imported anywhere, so this just verifies it compiles in isolation.

- [ ] **Step 3: Commit**

```bash
git add src/components/service-catalog.tsx
git commit -m "Add ServiceCatalog client island with single-select filter + reorder animation"
```

---

## Task 3: Wire the component into the homepage

**Files:**
- Modify: `src/app/example-9/page.tsx` (import, remove `filters`, remove filter bar block, replace catalog section)

- [ ] **Step 1: Add the import**

In `src/app/example-9/page.tsx`, after the existing import on line 12 (`import { WarpedHoverImage } from "@/components/WarpedHoverImage";`), add:

```ts
import { ServiceCatalog } from "@/components/service-catalog";
```

- [ ] **Step 2: Remove the now-dead `filters` const**

Delete this entire block (lines 51-58):

```ts
const filters = [
  { label: "Wszystkie", active: true },
  { label: "Trawnik" },
  { label: "Cięcie" },
  { label: "Sadzenie" },
  { label: "Porządki" },
  { label: "Projekt" },
];
```

(The category list now lives in `CATEGORIES` in `data.ts`, consumed by `ServiceCatalog`. Leave the `Service` / `Catalog` types and the `services` const in place — `services` is still built here and passed to the component.)

- [ ] **Step 3: Remove the inline filter bar**

Delete this entire block (the `{/* Filter bar */}` div, lines 168-191), which currently sits just before the hero `</section>` closing tag:

```tsx
        {/* Filter bar */}
        <div className="border-y border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-3 sm:px-6">
            <span className="shrink-0 text-xs uppercase tracking-widest text-neutral-500">
              Kategoria:
            </span>
            {filters.map((f) => (
              <button
                key={f.label}
                type="button"
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
                  f.active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="ml-auto hidden shrink-0 text-xs text-neutral-500 md:inline">
              {services.length} usług dostępnych
            </span>
          </div>
        </div>
```

After this deletion, the hero `</section>` should immediately follow the preceding `</div>`.

- [ ] **Step 4: Replace the catalog section with the component**

Replace the entire CATALOG section block (lines 194-251), which starts with `{/* CATALOG */}` and ends with `</section>` (the one containing `StaggerGrid`/`StaggerItem`/`HoverCard` mapping over `services`), with exactly:

```tsx
      {/* CATALOG */}
      <ServiceCatalog services={services} />
```

Leave everything after it (the `{/* DETAIL / PROCESS */}` section onward) unchanged.

- [ ] **Step 5: Type check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors, **no "unused variable" warnings** for `filters` (removed) and no unused-import warnings (`StaggerGrid`, `StaggerItem`, `HoverCard`, `WarpedHoverImage` are all still used by the team/stats/FAQ sections of the page, so they must remain imported).

- [ ] **Step 6: Commit**

```bash
git add src/app/example-9/page.tsx
git commit -m "Wire ServiceCatalog into homepage; remove static filter bar"
```

---

## Task 4: Visual verification

**Files:** none (manual check).

- [ ] **Step 1: Run the dev server**

Run: `npm run dev`
Open `http://localhost:3000` and scroll to the "Katalog" section.

- [ ] **Step 2: Verify behavior**

Confirm all of the following:
- All 6 pills render: Wszystkie, Trawnik, Cięcie, Sadzenie, Porządki, Projekt. "Wszystkie" is active on load and all 8 cards show.
- Clicking **Porządki** shows exactly 3 cards (Pielęgnacja ogrodu, Grabienie liści, Wiosenne i jesienne porządki); the others animate out and the remaining cards spring into their new positions.
- Clicking **Trawnik** shows exactly 1 card (Koszenie trawników).
- Clicking **Sadzenie** shows 2 cards (Sadzenie roślin, Zakładanie rabat).
- The active pill styling (dark fill) follows the clicked category.
- The "Najpopularniejsze" badge stays on **Pielęgnacja ogrodu** and "Projekt + realizacja" on **Aranżacja ogrodu**, regardless of filter. The corner number on each card is stable.
- The "{n} usług dostępnych" counter on the right updates to the filtered count.
- Hover lift on cards still works; layout reflow animation is smooth on desktop and mobile widths.

- [ ] **Step 3: No commit** (verification only). If issues are found, fix in the relevant task's file and re-run Task 3 Step 5.

---

## Self-Review Notes (author check)

- **Spec coverage:** data categories (Task 1) ✓; single-select client island (Task 2) ✓; reorder animation with `layout` + `AnimatePresence popLayout` + spring 260/30 + stagger (Task 2) ✓; slug-bound badges + stable number (Task 2) ✓; page rewiring keeping it a Server Component (Task 3) ✓; visual verification incl. expected counts (Task 4) ✓.
- **Scope:** only `example-9` (live homepage) + shared `data.ts`; variants untouched ✓.
- **Type consistency:** `CatalogItem = Service & {img, from, duration}` (component) is structurally identical to the page's local `Catalog` type, so passing `services: Catalog[]` into the `CatalogItem[]` prop type checks ✓. `category` added in Task 1 is present on `Service`, so `s.category === active` is valid ✓.
- **No placeholders:** all steps contain full code/commands ✓.
