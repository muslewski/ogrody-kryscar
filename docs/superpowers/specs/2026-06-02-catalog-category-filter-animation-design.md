# Catalog category filter with reorder animation — Design

**Date:** 2026-06-02
**Scope:** Live homepage only — `src/app/example-9/page.tsx` (served at `/`). The `/example-N` design variants are untouched.

## Goal

Make the existing (currently decorative) category pills on the homepage "Katalog" section actually filter the service cards, and animate the cards reflowing into their new positions — replicating the reorder animation used on pol-med's `/edukacja` "Katalog stanowisk".

## Background

- The homepage catalog already renders a filter bar (pills: *Wszystkie, Trawnik, Cięcie, Sadzenie, Porządki, Projekt*) and a grid of 8 service cards.
- The pills are static: no click handlers, no state, no filtering.
- Services have no `category` field.
- `src/app/example-9/page.tsx` is a Server Component (exports `metadata`) and must stay one.
- `motion@12.39.0` is already installed.
- Reference implementation (pol-med-v4 `features/education/sections/StationGrid.tsx`): `<AnimatePresence mode="popLayout">` wrapping cards that each have the `layout` prop, a spring layout transition (`stiffness: 260, damping: 30`), and a small per-card stagger.

## Decisions

- **Filter mode:** single-select tabs. Exactly one category active at a time; "Wszystkie" shows all. Each service belongs to exactly one category.
- **Architecture:** extract the catalog (filter bar + grid) into a new Client Component so the page can stay a Server Component.
- **Badges/number:** bind to service slug (stable), not array index.

## Category taxonomy & mapping

```ts
export const CATEGORIES = [
  { id: "all",      label: "Wszystkie" },
  { id: "trawnik",  label: "Trawnik" },
  { id: "ciecie",   label: "Cięcie" },
  { id: "sadzenie", label: "Sadzenie" },
  { id: "porzadki", label: "Porządki" },
  { id: "projekt",  label: "Projekt" },
] as const;
```

| Service (slug) | Title | Category id |
|---|---|---|
| koszenie | Koszenie trawników | trawnik |
| pielegnacja | Pielęgnacja ogrodu | porzadki |
| grabienie | Grabienie liści | porzadki |
| sadzenie | Sadzenie roślin | sadzenie |
| ciecie | Cięcie i formowanie | ciecie |
| porzadki | Porządki / sprzątanie | porzadki |
| aranzacja | Aranżacja zieleni | projekt |
| rabaty | Rabaty kwiatowe | sadzenie |

(Note: "trawnik" has 1 service, "porzadki" has 3 — accepted as honest to the offering.)

## Implementation outline

### 1. `src/lib/data.ts`
- Add `category` (one of the non-`all` ids) to each item in `SERVICES`.
- Export `CATEGORIES` as above.
- The existing `Catalog` enrichment (`img`, `from`, `duration`) carries `category` through automatically via spread.

### 2. `src/components/service-catalog.tsx` (new, `"use client"`)
- Props: `services: Catalog[]` (the enriched array) and the category list.
- State: `const [active, setActive] = useState<string>("all")`.
- Derived: `shown = active === "all" ? services : services.filter(s => s.category === active)`.
- Renders the filter bar — pills are real `<button>`s with `onClick={() => setActive(cat.id)}`; active styling (`border-neutral-900 bg-neutral-900 text-white`) driven by `active === cat.id`.
- Renders the grid with the animation below.
- Card markup (HoverCard + WarpedHoverImage + content + Tailwind classes) is preserved verbatim from the current page, moved inside the animated wrapper.

### 3. Reorder animation
```tsx
<div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
  <AnimatePresence mode="popLayout">
    {shown.map((s) => (
      <motion.article
        key={s.slug}
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ layout: { type: "spring", stiffness: 260, damping: 30 }, duration: 0.3 }}
        className="h-full"
      >
        {/* existing HoverCard + WarpedHoverImage + content */}
      </motion.article>
    ))}
  </AnimatePresence>
</div>
```
This replaces the `StaggerGrid`/`StaggerItem` wrappers for the catalog only.

### 4. `src/app/example-9/page.tsx`
- Remove the inline filter bar + grid JSX.
- Keep building the enriched `services` array in the server page exactly as it does now (it uses `SERVICE_IMAGES`/`PRICES` from data.ts).
- Pass it down: render `<ServiceCatalog services={services} />` in that spot. The server component computes the data; the client island only handles state + animation.

## Edge cases

- **Badges:** "Najpopularniejsze" and "Projekt + realizacja" bind to specific slugs (e.g. `pielegnacja` and `aranzacja`) instead of `i === 1` / `i === 6`.
- **Corner number `0{n}`:** use a stable per-service number derived from original catalog order, so it doesn't reshuffle on filter.
- **Empty state:** not reachable with single-select (every category has ≥1 service); no empty message added.
- **Reduced motion:** keep the spring subtle; rely on motion's defaults.

## Verification

- Dev server cannot run in the current sandbox (`npm` / `uv_cwd` EPERM). Verify via TypeScript correctness and review; final visual confirmation via `npm run dev` locally by the user.

## Out of scope

- Multi-select filtering, URL/query-param sync, search, sorting.
- Touching the `/example-N` variant pages.
