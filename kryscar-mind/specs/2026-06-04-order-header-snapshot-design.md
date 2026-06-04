---
type: spec
title: "Order-page header garden preview"
status: draft
created: 2026-06-04
related: ["[[customer-lawns]]", "[[service-requests]]"]
---

# Order-page header garden preview — design

## Goal

Show the lawn's Static-Maps snapshot (the same image used on the `/panel/ogrody`
lawn cards) as a **full-width banner in the header** of the order-creation page
`/panel/ogrody/[id]/zamow`, so the customer sees "this is the garden I'm ordering
services for."

## Scope

Pure presentational. No data, schema, collection, API, or pricing change — the order
page already loads the full `lawn` (`polygon`, `buildings`, `name`, `areaM2`).

## Design

**New shared component `src/components/lawns/LawnSnapshot.tsx` (server).** The single
source for the Static-Maps lawn image, so the card and the header never drift (DRY).
- Props: `polygon: LawnPoint[]`, `buildings: LawnPoint[][]`, `alt: string`,
  `width?: number` (default 480), `height?: number` (default 220), `className?: string`.
- Builds the URL via `buildStaticMapUrl(polygon, { width, height, buildings })`.
- Renders an `<img src={url} alt={alt} className={className}>` with the existing
  `{/* eslint-disable-next-line @next/next/no-img-element */}` (external image), OR a
  neutral "Podgląd mapy niedostępny" fallback `<div>` when the URL is null (no key /
  fewer than 3 vertices).

**`src/components/lawns/LawnCard.tsx`** — replace its inline `<img>`/fallback block
with `<LawnSnapshot polygon={lawn.polygon} buildings={lawn.buildings} alt={...}
width={480} height={220} className="h-full w-full object-cover" />`. The area-chip
overlay and the `aspect-[16/8]` wrapper stay unchanged. No visual change to the card.

**`src/app/(app)/panel/ogrody/[id]/zamow/page.tsx`** — add a full-width banner ABOVE
the existing title row: a rounded `overflow-hidden aspect-[16/6]` container holding
`<LawnSnapshot polygon={lawn.polygon} buildings={lawn.buildings} alt={\`Mapa — ${lawn.name}\`}
width={960} height={360} className="h-full w-full object-cover" />` plus the `{areaM2} m²`
chip overlaid top-right. The "Zamów usługi / {name} · {area} m²" heading + "← Wróć"
link remain, sitting below the banner.

## Error handling

If a lawn has no snapshot URL (missing key / degenerate polygon), `LawnSnapshot`
shows the fallback `<div>` in both places — never a broken image.

## Testing

`npm run check`: the suppressed `<img>` in `LawnSnapshot` must NOT add a 4th eslint
warning (the card's existing suppressed `<img>` is removed in the same change, so the
count stays at the 3 known pre-existing ones). Visual: the order header banner shows
the saved outline + buildings; the card looks identical to before.

## Mind

Light touch: note `LawnSnapshot` as a shared anchor on the `customer-lawns` zone (the
card snapshot + order header both render it); re-stamp `verifiedAt`. No new zone.
