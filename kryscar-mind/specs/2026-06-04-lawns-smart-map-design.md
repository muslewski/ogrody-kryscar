---
type: spec
title: "Lawns Smart Map — Auto-fill (ULDK + OSM) + fill animation"
status: draft
created: 2026-06-04
builds-on: ["[[2026-06-04-customer-lawns-3a-design]]"]
related: ["[[customer-lawns]]", "[[payload-backend]]", "[[auth-portal]]"]
---

# Lawns Smart Map — design

## Goal

Two enhancements to the lawn-drawing map step (built on the live 3a "My Lawn"):

1. **Auto wypełnij** — one tap fetches the customer's **parcel boundary** (ULDK /
   GUGiK) and the **building footprints on it** (OpenStreetMap), draws the parcel
   as an editable outline with the house(s) shown as "not counted" overlays, and
   sets the area to **parcel − buildings** so the customer is never charged for the
   house.
2. **Fill animation** — a fade + one-shot stroke "snap pulse" plays the moment a
   polygon closes (manual draw) or an auto-filled parcel lands.

Booking/scheduling remains out of scope (sub-project 3b).

## Scope

**In scope:**
- `src/lib/boundary/` provider module: ULDK parcel provider, OSM building provider,
  clip+net-area, and a failover orchestrator.
- A session-gated server action `autoFillLawnAction(lat, lng)`.
- `LawnDrawer`: an "✨ Auto wypełnij" button + spinner/states, rendering the parcel
  outline (editable) + red building overlays, net-area chip, and the fill animation
  (also on manual `polygoncomplete`).
- `lawns` collection: optional `buildings` (clipped building rings) + `source`
  fields; `areaM2` becomes net lawn area.
- Card + Static Maps snapshot render the building overlays; area chip shows net.
- `polygon-clipping` dependency for boolean ops.

**Out of scope / YAGNI:** a *second* parcel or building provider (the failover
chain is built and wired with one provider each; adding a second is config-only);
true polygon-with-holes geometry (we use parcel outline + overlay + area subtraction
— "Option B"); AI segmentation (a future fallback link only); booking.

## UX

**Manual draw:** unchanged, except the **fade + snap-pulse** animation now plays
when the polygon closes.

**Auto-fill:**
- The "✨ Auto wypełnij" button is available once the map is centred on a property
  (after an address search, or after the user pans). It queries the **map centre**
  at click time (so the user can nudge to fine-tune).
- Tap → button → "Szukam działki…" spinner → server returns parcel + clipped
  buildings + net area → the parcel outline + red building overlays draw, the
  snap-pulse plays, phase → `ready`. Area chip: **"≈ 520 m² · działka 640 − dom 120"**.
- The parcel outline is **editable** (drag corners). Building overlays are
  informational (not editable). Editing the outline re-clips buildings to the edited
  ring and recomputes the net area.
- **"Rysuj od nowa"** still drops to manual drawing — auto-fill is a shortcut, never
  a cage.

## Geometry decision — "Option B" (outline + overlay + area subtraction)

The saved shape is the **parcel outline as a simple editable ring** (not a polygon
with a hole). The house is shown as a red overlay and **subtracted from the area**,
not punched out of the geometry. Same fair number ("działka − dom"), simple editing,
and the customer *sees* the house excluded (anti-"scam"). True hole geometry was
rejected as needless complexity (it would ripple through the data model, area math,
the card snapshot, and editing).

## Data sources & provider chain (separation of concerns + failover)

`src/lib/boundary/`:
- `types.ts` — `LawnRing = LawnPoint[]`; `ParcelProvider { name; fetchParcel(point): Promise<LawnRing | null> }`; `BuildingProvider { name; fetchBuildings(bbox): Promise<LawnRing[]> }`; `AutoFillResult { parcel: LawnRing; buildings: LawnRing[]; areaM2: number; parcelAreaM2: number; buildingAreaM2: number; sources: { parcel: string; buildings: string | null } }`.
- `uldk.ts` — `uldkParcelProvider`: calls ULDK `GetParcelByXY` (point passed as
  WGS84; request WKT geometry in WGS84), parses the WKT polygon → `LawnRing`.
- `osm-buildings.ts` — `osmBuildingProvider`: Overpass `building=*` query within the
  parcel bbox → building rings.
- `clip.ts` — intersect each building with the parcel (only on-lot area counts) via
  `polygon-clipping`; `netArea(parcel, clippedBuildings)` = spherical area(parcel) −
  Σ spherical area(building ∩ parcel) using the existing `computePolygonArea`.
- `chain.ts` — `runChain(providers, fn, timeoutMs)`: tries providers **in order**,
  each wrapped in a timeout (~4s); returns the first usable non-empty result; skips
  any that throw/time out; records which provider answered.
- `index.ts` — `autoFillLawn(point): Promise<AutoFillResult | { error: 'no-parcel' | 'failed' }>`:
  runs `parcelChain` then `buildingChain` (clipped), computes net area.

**Chains (MVP):** `parcelChain = [uldkParcelProvider]`,
`buildingChain = [osmBuildingProvider]`. The failover machinery, per-provider
timeouts, and the manual floor are all in place; adding GUGiK EGiB buildings, Google
Building Outlines, or an AI segmenter later is a registration in the chain array, not
a change to the orchestrator or UI.

**Graceful floor:** whole parcel chain fails → `no-parcel` → manual draw. Building
chain fails/empty → lawn = full parcel (note "nie wykryto budynku"). A dead API
degrades, never breaks the page. ULDK/OSM are Poland-focused; outside PL → `no-parcel`
and manual still works.

All network + parsing happens **server-side** (no CORS, no keys in the browser).
Both APIs are free; calls happen only on button click.

## Data model — `lawns` collection additions

| field     | type                          | notes |
|-----------|-------------------------------|-------|
| buildings | json (optional)               | clipped building rings `LawnPoint[][]`; empty/absent for manual lawns |
| source    | select `manual` \| `auto` (default `manual`) | provenance |

`areaM2` semantics become **net lawn area**: manual = ring area (unchanged); auto =
ring − (buildings ∩ ring), recomputed server-side on create/update. `LawnInput` gains
optional `buildings?: LawnPoint[][]` and `source?`. `LawnView` gains `buildings:
LawnPoint[][]`.

## Server entry point

`autoFillLawnAction(lat, lng)` (`"use server"`, session-gated like the existing lawn
actions) → `autoFillLawn(point)` → returns `AutoFillResult` or a typed error
(`no-parcel` / `failed`). The client "Auto wypełnij" button calls it; it never
mutates — persistence still goes through the existing `createLawnAction` /
`updateLawnAction`, which now also accept and store `buildings` + `source`.

## Animation

`playFillPulse(polygon, maps)` (client, rAF-based, no deps): animates the polygon
`fillOpacity 0 → 0.3` over ~400ms ease-out and flashes a one-shot expanding stroke
overlay (a temporary `Polygon` whose strokeOpacity fades while it scales out via a
brief bounds expansion, then is removed). Called from `polygoncomplete` (manual) and
the auto-fill success handler.

## Card + snapshot

`buildStaticMapUrl` gains an optional `buildings` arg → adds red `path` overlays for
each building ring (the parcel stays emerald). `LawnCard` passes `lawn.buildings`.
The net `areaM2` chip is unchanged (already stored net).

## Error handling

- `no-parcel` → toast "Nie znaleźliśmy granic działki tutaj — narysuj ręcznie", stay
  in draw mode.
- building chain empty → full parcel + "Nie wykryto budynku".
- `failed` (all chains errored) → generic toast, manual drawing intact.
- Per-provider timeout (~4s) prevents a hung API from blocking the button.

## Testing / verification

`npm run check` gate. Extend `scripts/check-lawns.ts` (or a new sanity script):
- `clip.ts` net area: a known parcel ring + a known interior building → expected net
  area within tolerance; building partly outside parcel → only the inside portion
  subtracted.
- `uldk.ts` WKT parse: a sample `POLYGON((...))` WKT → expected ring.
- `chain.ts`: a chain `[throwingProvider, goodProvider]` → returns the good result;
  `[emptyProvider, goodProvider]` → skips empty; all-fail → null.
Runtime (non-UI, controller): a script calling `autoFillLawn` for a real Bydgoszcz
point → a plausible parcel ring + a net area smaller than the parcel area.

## Mind updates (ship with the code)

- Update the `customer-lawns` zone: auto-fill flow, `buildings`/`source` fields, the
  `boundary` provider module + chain anchors; re-stamp `verifiedAt`.
- New decision `auto-fill-parcel-uldk-osm`: why ULDK (parcel) + OSM (buildings) +
  area subtraction (Option B), the failover chain, net-area semantics, and the
  Poland-only degradation.
- Note the new external dependencies (ULDK, Overpass) in tech-debt if a resilience
  concern warrants it (e.g. third-party uptime).
