---
type: zone
summary: "Customer 'My Lawn' (3a): the /panel/ogrody loop where a logged-in customer adds a lawn from satellite imagery (search → draw polygon → live area → save) backed by an owner-scoped Payload lawns collection."
tags: [feature, app, maps, data]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[app-shell]]", "[[auth-portal]]", "[[tenancy-and-roles]]", "[[payload-backend]]"]
sources: ["[[2026-06-04-customer-lawns-3a-design]]"]
owns:
  routes: ["/panel/ogrody", "/panel/ogrody/nowy", "/panel/ogrody/[id]/edytuj"]
  anchors: ["symbol:getMyLawns", "symbol:createLawn", "symbol:computePolygonArea", "symbol:buildStaticMapUrl", "symbol:LawnDrawer"]
  globs: ["src/lib/lawns.ts", "src/lib/lawn-types.ts", "src/lib/geo.ts", "src/lib/maps.ts", "src/lib/google-maps-loader.ts", "src/collections/Lawns.ts", "src/components/lawns/**", "src/app/(app)/panel/ogrody/**"]
depends: ["[[auth-portal]]", "[[payload-backend]]", "[[ui-primitives]]"]
invariants:
  - rule: "Lawn ownership is enforced in src/lib/lawns.ts (every query filtered by owner == userId) — the Local API runs as admin via the Better Auth adapter, so the Lawns collection access is closed and components/actions never query lawns directly."
    enforcedBy: []
  - rule: "areaM2 is recomputed server-side from the polygon via computePolygonArea on create/update — the client value is never persisted as-is."
    enforcedBy: []
  - rule: "Client components import only src/lib/lawn-types.ts, the google-maps-loader, and the server actions — never src/lib/lawns.ts (which pulls in Payload)."
    enforcedBy: []
verifiedAt: "28b334f49df012d0180c4fe6d3ce0e1e87390e06"
---
## Purpose
The customer's first owned object in the app. A logged-in customer maps their lawn
once, and the system holds its location, outline, and area so later flows ("Zamów
usługi") can quote against it. The loop: open `/panel/ogrody` → add a lawn from the
guided satellite map → see it as a card (static-map snapshot + area chip) → rename,
re-draw, or delete. Data lives in a `lawns` Payload collection (owner, name, address,
placeId, location{lat,lng}, polygon json, areaM2, tenant) with closed access; security
lives in the data layer, not Payload field access.
## Add-lawn flow
`LawnDrawer` (client) drives one guided map: **search** an address via Google Places →
recenters the satellite/hybrid map; **draw** the lawn outline via the Drawing library →
a single editable polygon; **area** computed live from geometry as the user draws/edits;
**name** the lawn; **save** through a server action. The map loads via
`@googlemaps/js-api-loader` v2 (functional API: `setOptions` + `importLibrary`) with
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` + `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`. The client-shown
area is convenience only — the server recomputes `areaM2` from the polygon via
`computePolygonArea` on create and update.
## App-map (for browser agents — orient here first)
- `/panel/ogrody` — list: empty state, else a card grid. Each `LawnCard` shows a Google
  **Static Maps** snapshot (`buildStaticMapUrl`), an area chip, a "Zamów usługi" button
  → `/panel/uslugi` (stub), and a ⋯ menu (`LawnActionsMenu`): rename · re-draw · delete.
- `/panel/ogrody/nowy` — add a lawn (`LawnDrawer`, empty initial).
- `/panel/ogrody/[id]/edytuj` — re-draw / rename an existing lawn (`LawnDrawer`, prefilled).
- Server actions (`src/app/(app)/panel/ogrody/actions.ts`) call the owner-scoped
  accessors in `src/lib/lawns.ts`; pages and client components never touch Payload directly.
## Anchors
`getMyLawns`, `createLawn`, `computePolygonArea`, `buildStaticMapUrl`, `LawnDrawer`.
## Lineage
sources → [[2026-06-04-customer-lawns-3a-design]]; ownership rationale →
[[lawns-ownership-in-data-layer]]; maps rationale → [[google-maps-integration]].
