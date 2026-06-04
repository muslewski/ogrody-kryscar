---
type: spec
title: "Customer Lawns (sub-project 3a — My Lawn)"
status: draft
created: 2026-06-04
slice: "3a of customer lawn+booking MVP (3b = Booking & Scheduling, brainstormed separately)"
related: ["[[app-shell]]", "[[auth-portal]]", "[[tenancy-and-roles]]", "[[payload-backend]]", "[[service-catalog]]", "[[pricing-calculator]]"]
---

# Customer Lawns — 3a "My Lawn" design

## Goal

Let an authenticated customer add, view, re-draw, rename and delete their **lawns**:
each lawn is a property they pin on a satellite map, outline by drawing a polygon,
and save with an auto-computed area (m²). `/panel/ogrody` becomes the real "Moje
ogrody" experience (empty state + card grid). This is the **hook** half of the
customer MVP; the booking/scheduling loop is sub-project **3b** and is out of scope
here.

## Scope

**In scope (3a):**
- A `lawns` Payload collection, owner-scoped.
- Guided map screen to add a lawn (search address → draw outline → auto area →
  name → save), the three approved states on one screen.
- `/panel/ogrody` list: empty state + card grid; each card shows a Google Static
  Maps snapshot of the saved outline, name, address, area chip, a primary "Zamów
  usługi" button, and a ⋯ menu (rename / re-draw / delete).
- Re-draw / rename / delete.
- `/panel` dashboard gains a small "X ogrodów" summary line.
- Google Maps integration (Maps JS + Places + Drawing + geometry; Static Maps for
  snapshots), satellite/hybrid imagery, emerald-branded chrome, Cloud Map ID hook.

**Out of scope (deferred to 3b):** booking, availability/scheduling, price
estimates in a request, gardener-side views of lawns. The card's "Zamów usługi"
button routes to a ComingSoon stub in 3a — it is 3b's entry point.

**Explicitly cut (YAGNI for 3a):** manual area entry fallback when maps fail to
load; self-intersection validation of the polygon; a styled non-satellite terrain
toggle; per-lawn photos/notes beyond name+address.

## UX (validated in the visual companion)

**Add-lawn = Option A, map-first, one screen, progressively guided.** The map
always asks for exactly one thing next:

1. **Znajdź adres** — map dimmed; a prominent Google Places autocomplete field.
   Picking an address zooms the satellite map to the property.
2. **Obrysuj trawnik** — draw mode auto-starts. A permanent hint pill ("Klikaj
   rogi trawnika"), a live point counter, and "Cofnij punkt" to undo. Closing the
   shape (≥3 points) computes the area.
3. **Nazwij i zapisz** — a big "≈ N m²" chip appears instantly (payoff). Customer
   can "Rysuj od nowa" or drag corners, must enter a name, then "Zapisz ogród".
   Zapisz is disabled until there is a valid polygon **and** a name.

**`/panel/ogrody` list:**
- **Empty state:** 🌱 prompt explaining the value + a clear "+ Dodaj ogród".
- **Populated:** responsive card grid. Each card = Static Maps snapshot (outline in
  emerald) + name + address + area chip + "Zamów usługi" (→ ComingSoon stub) + a ⋯
  menu (rename / re-draw / delete-with-confirm) + a trailing "Dodaj kolejny ogród"
  tile.

## Data model — `lawns` collection (Payload)

| field    | type                              | notes |
|----------|-----------------------------------|-------|
| owner    | relationship → users (required)   | the ownership key; set server-side from the session, never trusted from client |
| name     | text (required)                   | "Dom", "Działka — Borówno" |
| address  | text (required)                   | formatted address from Places |
| placeId  | text (optional)                   | Google `place_id` |
| location | group `{ lat: number, lng: number }` (required) | map center / pin |
| polygon  | json (required)                   | array of `{ lat, lng }`, ≥3 vertices |
| areaM2   | number (required)                 | **recomputed server-side** from polygon; client value is not trusted |
| tenant   | relationship → tenants (required) | assigned by the shared `assignDefaultTenant` beforeChange hook |
| timestamps | —                               | Payload-managed |

Registered in `payload.config.ts`. Postgres table created by dev-push (no
migration — consistent with the repo's dev-push convention; logged in
`prod-migrations-needed`).

## Ownership boundary — the security seam

Lawns are driven by **Better Auth → Payload Local API**, which runs as admin
(`overrideAccess`), so Payload field-level access does **not** enforce per-user
isolation here. Instead, **`src/lib/lawns.ts` is the single ownership boundary.** It
exposes only owner-scoped operations and filters every query by `owner == userId`:

- `getMyLawns(userId): Promise<Lawn[]>`
- `getLawn(userId, id): Promise<Lawn | null>`  (returns null if not owned)
- `createLawn(userId, data): Promise<Lawn>`    (forces `owner = userId`)
- `updateLawn(userId, id, data): Promise<Lawn>` (owner-checked before write)
- `deleteLawn(userId, id): Promise<void>`       (owner-checked before delete)
- `computePolygonArea(points): number`          (pure spherical-area util, server-side)

Server actions in the panel read `session.user.id` (via `@/lib/auth`
`auth.api.getSession`) and call these functions. They never accept an `owner` from
the client. Gardener/admin read access to lawns is deferred to 3b.

**Invariant:** no component or server action queries the `lawns` collection
directly via the Payload Local API — all access goes through `src/lib/lawns.ts`,
which is the only place that injects the owner filter.

## Google Maps integration

- **Loader:** `@googlemaps/js-api-loader` (+ `@types/google.maps`), libraries
  `places`, `drawing`, `geometry`. Loaded only on the client map screens.
- **Env (you provision; I do not enter keys):**
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — referrer-restricted to the app's domains;
    enable Maps JavaScript API, Places API, Maps Static API. Added to `.env` + Vercel.
  - `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` — a Cloud Map ID so map styling (vector layers,
    labels, terrain) is tunable from the Google Cloud console without a redeploy.
- **Imagery:** satellite/**hybrid** map type (real grass/terrain for tracing; the
  street labels help orientation). `disableDefaultUI: true` + minimal custom emerald
  controls so it reads as our tool, not stock Google Maps.
- **Brand:** emerald polygon stroke/fill + custom corner handles + our hint UI are
  the signature look. Honest constraint: satellite is photographic and **cannot be
  recolored**; only vector layers are styleable (via the Map ID).
- **Area:** computed live client-side via `geometry.spherical.computeArea`, then
  **recomputed server-side** from the stored polygon by `computePolygonArea` so the
  persisted `areaM2` never trusts the client.
- **Card snapshot:** Google **Static Maps** URL with the polygon `path` in emerald,
  `maptype=hybrid`, served via a plain `<img>` (referrer-restricted key; the page
  referrer authorizes it). Durable, zero live-map cost on the list. The URL contains
  the customer's own coordinates and is rendered only in their authenticated panel.

## Components & routes

- `src/collections/Lawns.ts` — the collection (+ register in `payload.config.ts`).
- `src/lib/lawns.ts` — owner-scoped data access, `Lawn` type, `computePolygonArea`.
- `src/lib/maps.ts` — Static Maps URL builder + shared map config (map type, Map ID,
  emerald style constants).
- `src/app/(app)/panel/ogrody/page.tsx` — server component; `getMyLawns` → grid /
  empty state.
- `src/app/(app)/panel/ogrody/nowy/page.tsx` — add screen hosting `LawnDrawer`.
- `src/app/(app)/panel/ogrody/[id]/edytuj/page.tsx` — re-draw/rename; reuses
  `LawnDrawer` prefilled.
- `src/components/lawns/LawnDrawer.tsx` — **client**: guided map (the 3 states),
  Places autocomplete, drawing manager, live area, save via server action.
- `src/components/lawns/LawnCard.tsx` — card with Static Maps snapshot + actions.
- `src/components/lawns/LawnActionsMenu.tsx` — **client**: ⋯ menu (rename / re-draw
  / delete-with-confirm), using existing shadcn primitives.
- Server actions (`"use server"`): `createLawnAction`, `updateLawnAction`,
  `deleteLawnAction` — resolve session, delegate to `src/lib/lawns.ts`.
- `src/app/(app)/panel/page.tsx` — add the "X ogrodów" summary line.

## Error handling & edges

- Maps fails to load (no key / network) → friendly "Mapa niedostępna" + retry. No
  manual-entry fallback (cut).
- Polygon < 3 points → "Zapisz" disabled; self-intersection ignored (area still
  computes).
- Save failure → toast error, drawing preserved.
- Unauthenticated → the existing `panel/layout.tsx` gate redirects to `/sign-in`.
- Delete → confirm dialog; a non-owner id resolves to a no-op/404 (owner filter).

## Testing / verification

`npm run check` (tsc + eslint + payload types + mind) is the gate — the repo has no
unit-test runner. Additionally:
- `computePolygonArea` gets a small runnable sanity check: a known lat/lng polygon →
  expected m² within tolerance.
- Runtime checks: add a lawn locally; confirm it persists owner-scoped and renders on
  a card with a working Static Maps snapshot; re-draw / rename / delete work; a second
  account cannot see or mutate the first account's lawns.

## Dependencies / risks

- **Hard dependency:** a Google Maps API key with billing enabled + a Cloud Map ID,
  provisioned by the user (same flow as the Blob token). Local dev needs the key.
- Static Maps key sits in image URLs (referrer-restricted) — acceptable for MVP; a
  signed/proxied snapshot route is a possible future hardening (note as tech-debt).

## Mind updates (ship with the code)

- New zone `customer-lawns`.
- Decisions: `lawns-ownership-in-data-layer` (why server-side scoping, not Payload
  field access) and `google-maps-integration` (libraries, key + Map ID, area
  recompute, satellite-can't-be-recolored, static snapshot).
- Update `app-shell` (`/panel/ogrody` + `/panel/ogrody/nowy` now real) and
  `prod-migrations-needed` (new `lawns` table).
- Re-stamp touched zones' `verifiedAt`; run `npm run mind`.
