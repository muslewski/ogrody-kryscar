---
type: decision
summary: "The lawn add-flow uses Google Maps JS (places + drawing + geometry) on a satellite/hybrid map plus Static Maps for card snapshots, loaded via @googlemaps/js-api-loader v2 (functional setOptions + importLibrary), keyed by NEXT_PUBLIC_GOOGLE_MAPS_API_KEY + a Cloud Map ID. Satellite imagery is photographic and can't be recolored, so brand lives in the emerald polygon + chrome; client area is convenience-only and the server recomputes areaM2."
tags: [maps, google, app, lawns, env]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[customer-lawns]]", "[[app-shell]]"]
sources: ["[[2026-06-04-customer-lawns-3a-design]]"]
decided: 2026-06-04
supersededBy: ""
---
## Context
The "My Lawn" add-flow needs address search, a satellite view to trace a lawn outline,
live area as the user draws, and a lightweight per-card preview on the list — without
shipping a heavy interactive map into every card.
## Decision
Use Google Maps. Three JS libraries: **places** (address autocomplete + recenter),
**drawing** (a single editable lawn polygon), **geometry** (live area from the polygon).
Card snapshots use the **Static Maps** API via `buildStaticMapUrl` (`src/lib/maps.ts`) —
an `<img>`, not an interactive map. The interactive map is **satellite/hybrid**
(`LAWN_MAP_TYPE = "hybrid"`) so the user traces real imagery. The map loads via
`@googlemaps/js-api-loader` **v2** functional API (`setOptions({ apiKey, ... })` +
`await importLibrary("maps"|"places"|"drawing"|"geometry")`), wrapped in
`src/lib/google-maps-loader.ts`. Two env vars: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and
`NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` (a Cloud Map ID). The lawn polygon is drawn in brand
emerald (`LAWN_STROKE`/`LAWN_FILL = "#10b981"`).
## Why
One vendor covers search, drawing, geometry, and static snapshots; the js-api-loader v2
functional API is the loader Google's current docs prescribe; a Cloud Map ID is required
for vector maps and lets styling be tuned without a redeploy.
## Consequences
- **Satellite imagery is photographic — it can't be recolored.** Brand expression lives
  in the emerald polygon + the surrounding chrome, not in the map tiles. The Cloud Map ID
  tunes only vector layers (labels/roads), so on satellite/hybrid its visual effect is
  limited; it is still required to instantiate a vector map.
- **Client area is convenience-only.** The live geometry area shown while drawing is not
  trusted; the server recomputes `areaM2` from the saved polygon via `computePolygonArea`
  (see [[lawns-ownership-in-data-layer]] / [[customer-lawns]]).
- Both `NEXT_PUBLIC_*` env vars are required (and public, exposed to the browser); missing
  them breaks the add-flow and the card snapshots.
