---
type: decision
summary: "Lawn auto-fill ('Smart Map') derives a net lawn area from the cadastral parcel minus its buildings: ULDK/GUGiK supplies the parcel boundary, OpenStreetMap Overpass supplies building footprints, polygon-clipping clips building ∩ parcel, and computePolygonArea subtracts — areaM2 = parcel − buildings ('Option B': outline + overlay, not a hole-punched polygon). All fetch + clipping runs server-side in src/lib/boundary/* behind failover provider chains (per-provider timeout, manual floor, append-to-extend). ULDK/OSM are free and Poland-focused; outside PL the flow degrades to manual drawing."
tags: [maps, lawns, app, geo, boundary, env]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[customer-lawns]]"]
sources: ["[[2026-06-04-lawns-smart-map-design]]"]
decided: 2026-06-04
supersededBy: ""
---
## Context
Manually tracing a lawn outline is tedious and imprecise, and the traced area includes
the house — so the number doesn't match the real mowable lawn. Poland publishes the
cadastral parcel boundary for free (ULDK/GUGiK), and OpenStreetMap carries building
footprints. We wanted a one-tap **Auto wypełnij** that produces a *net* lawn area
(parcel minus the building on it) without the customer drawing anything.

## Decision
Auto-fill derives the lawn from two free, Poland-focused sources and subtracts:
- **Parcel boundary** comes from **ULDK/GUGiK** (the Polish cadastral service).
- **Building footprints** come from **OpenStreetMap** via the **Overpass** API.
- **Area subtraction ("Option B")** — each building is clipped to the parcel
  (`polygon-clipping`: building ∩ parcel) and its area is subtracted from the parcel's
  via the existing spherical `computePolygonArea`, giving `areaM2 = działka − dom`. We do
  **not** punch holes into the polygon; the saved geometry stays a simple parcel outline
  plus a separate list of clipped building rings, rendered as red overlays. Net area is a
  number, not a multi-ring polygon — simpler to draw, edit, and reason about.

Two new `lawns` fields back this: `buildings` (the clipped building rings) and `source`
(`manual` | `auto`).

### Failover provider chains
All providers sit behind ordered chains evaluated by `runChain`
(`src/lib/boundary/chain.ts`): each provider call is wrapped in a **per-provider timeout**
and the chain **falls through** on error/timeout/empty to the next provider. Today
`parcelChain = [uldk]` and `buildingChain = [osm]` (`src/lib/boundary/index.ts`). Extending
the system is **appending to an array** — e.g. GUGiK EGiB, Google Building Outlines, an
Overpass mirror, or an AI provider — with no call-site changes. When a chain yields nothing,
the flow degrades to a **manual floor**: the customer simply draws the lawn by hand.

### Server-only
The fetch + clipping live entirely in `src/lib/boundary/*` and run server-side via
`autoFillLawn` (exposed to the client as `autoFillLawnAction`). The client (`LawnDrawer`)
only renders the returned parcel/buildings and computes a *display* area through Google's
geometry library; the trusted `areaM2` is recomputed server-side, consistent with the
manual path (see [[customer-lawns]] / [[lawns-ownership-in-data-layer]]).

## Consequences
- **`areaM2` is net.** For auto-filled lawns `areaM2 = parcel − clipped buildings`, so the
  stored area already excludes the house footprint. Manual lawns keep their traced area.
- **Poland-only by design.** ULDK and OSM building coverage are strongest in Poland; outside
  PL the chains return nothing and the UI degrades to manual drawing — no hard failure.
- **`polygon-clipping` interop quirk.** `polygon-clipping@0.15` ships a CJS build whose
  `.d.ts` declares **named** exports, so it's imported as a **namespace**
  (`import * as polygonClippingNS from "polygon-clipping"`). Under ESM↔CJS interop the real
  functions land on `.default` at runtime, so `src/lib/boundary/geo-clip.ts` picks the impl
  object with a `.default ?? namespace` fallback rather than calling the named export
  directly. This is a deliberate runtime-vs-types workaround; don't "simplify" it to a plain
  named import.
- **Free but third-party.** No new paid key is required, but auto-fill depends on the ULDK
  and Overpass endpoints being reachable; the per-provider timeout + manual floor keep a slow
  or down upstream from blocking the add-flow.

## Runtime gotchas (found during verification)
- **Overpass needs a `User-Agent`.** `overpass-api.de` returns HTTP **406** to requests
  with no UA header (Node `fetch` sends none) — silently fails the building chain, so the
  house never got subtracted. `osm-buildings.ts` sets `User-Agent: ogrody-kryscar/1.0`.
- **ULDK ignores `srid=4326` for some powiats.** It returns native **EPSG:2180**
  (`SRID=2180;POLYGON(...)`) for certain counties despite the requested output SRID. Those
  easting/northing coords parsed as garbage lat/lng. `uldk.ts` now reads the EWKT `SRID=N;`
  prefix and reprojects 2180 → WGS84 via **proj4** (`src/lib/boundary/crs.ts`); an unknown
  CRS returns null → manual-draw floor. New dep: `proj4` (+ `@types/proj4`).
