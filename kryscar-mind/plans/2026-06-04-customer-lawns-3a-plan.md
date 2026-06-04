# Customer Lawns 3a — "My Lawn" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an authenticated customer add, view, re-draw, rename and delete their lawns — each pinned on a satellite map, outlined by drawing a polygon, and saved with an auto-computed area — turning `/panel/ogrody` into the real "Moje ogrody" experience.

**Architecture:** A new owner-scoped `lawns` Payload collection, driven through Better Auth → Payload Local API. Because that Local API runs as admin, **`src/lib/lawns.ts` is the single ownership boundary** (every query filtered by `owner == userId`); server actions read `session.user.id` and delegate to it. The UI is a guided, map-first add flow (Google Maps JS: Places + Drawing + geometry) and a card list whose snapshots come from the Google Static Maps API. Polygon area is computed client-side for instant feedback and **recomputed server-side** so the persisted value is never client-trusted.

**Tech Stack:** Next.js 16 (App Router, RSC + server actions), React 19, PayloadCMS 3.85 (Postgres/Neon, dev-push), Better Auth, Tailwind v4, shadcn (new-york), `@googlemaps/js-api-loader` + `@types/google.maps`, Google Static Maps API.

---

## Conventions for every task

- **No unit-test runner exists in this repo.** The verification gate is **`npm run check`** (`tsc --noEmit && eslint && payload generate:types && node scripts/mind/generate.mjs`). Pure logic (`computePolygonArea`, `buildStaticMapUrl`) is verified by a runnable sanity script (`npx tsx scripts/check-lawns.ts`). Everything else is verified by `npm run check` passing **plus** the explicit runtime check named in the task.
- Three pre-existing `<img>` eslint warnings (`example-10/page.tsx`, `CoverageMap.tsx`) are expected — they are NOT failures.
- Payload config import alias is `@payload-config`. Payload-generated types come from `@/payload-types`.
- This repo is a **modified Next.js fork**: `next/image` deprecates `priority` in favour of `preload`. We render Static Maps via a plain `<img>` (external host, fixed URL) — that's intentional; suppress the lint line with `{/* eslint-disable-next-line @next/next/no-img-element */}` exactly as the existing `CoverageMap.tsx` does.
- **Schema management is dev-push, NOT migrations.** Do **not** run `payload migrate:create` or generate files in `src/migrations/`. The new `lawns` table is created by a dev-push (Task 2, Step 5) which is a **shared-infra action requiring the human controller's authorization** — the implementer subagent must STOP and hand that step to the controller.
- File-boundary rule (keep it true): **client components never import `src/lib/lawns.ts`** (it pulls in Payload/server code). Shared types live in `src/lib/lawn-types.ts`; client code imports only that, the client loader, and the server actions.

---

## File Structure

**Create:**
- `src/lib/lawn-types.ts` — pure shared types: `LawnPoint`, `LawnInput`, `LawnView`. Imported by both client and server.
- `src/lib/geo.ts` — `computePolygonArea(points)` pure spherical-area util.
- `src/lib/maps.ts` — `buildStaticMapUrl(polygon, opts?, key?)` Static Maps URL builder + brand style constants.
- `src/lib/google-maps-loader.ts` — client-side singleton `getMapsLoader()` (libraries: places, drawing, geometry).
- `src/lib/lawns.ts` — owner-scoped data access: `getMyLawns`, `getLawn`, `createLawn`, `updateLawn`, `deleteLawn`. The ownership boundary.
- `src/collections/Lawns.ts` — the Payload collection.
- `src/app/(app)/panel/ogrody/actions.ts` — `"use server"` actions: `createLawnAction`, `updateLawnAction`, `deleteLawnAction`.
- `src/components/lawns/LawnDrawer.tsx` — client guided map (search → draw → name → save).
- `src/components/lawns/LawnCard.tsx` — server card with Static Maps snapshot.
- `src/components/lawns/LawnActionsMenu.tsx` — client ⋯ menu (rename / re-draw / delete-with-confirm).
- `src/app/(app)/panel/ogrody/nowy/page.tsx` — add screen.
- `src/app/(app)/panel/ogrody/[id]/edytuj/page.tsx` — re-draw/rename screen.
- `scripts/check-lawns.ts` — runnable sanity checks for `geo` + `maps`.

**Modify:**
- `src/payload.config.ts` — register `Lawns`.
- `src/app/(app)/panel/ogrody/page.tsx` — replace ComingSoon with empty state + card grid.
- `src/app/(app)/panel/page.tsx` — add the "X ogrodów" summary line.
- `src/app/(app)/layout.tsx` — mount the sonner `<Toaster/>`.
- `.env.example` — document the two new Google Maps env vars.

**Mind (Task 13):** new zone `customer-lawns`; decisions `lawns-ownership-in-data-layer`, `google-maps-integration`; update `app-shell`, `prod-migrations-needed`.

---

### Task 1: Pure types + area util + sanity script

**Files:**
- Create: `src/lib/lawn-types.ts`
- Create: `src/lib/geo.ts`
- Create: `scripts/check-lawns.ts`

- [ ] **Step 1: Create the shared types**

`src/lib/lawn-types.ts`:
```ts
/**
 * Pure, dependency-free types shared by client components, server actions and
 * the data-access layer. NO Payload/server imports here — client components
 * import this file, so it must stay free of server-only code.
 */
export interface LawnPoint {
  lat: number;
  lng: number;
}

/** What the client sends to create/update a lawn (area is computed server-side). */
export interface LawnInput {
  name: string;
  address: string;
  placeId?: string | null;
  location: LawnPoint;
  polygon: LawnPoint[];
}

/** The projected, UI-facing shape of a lawn (decoupled from the Payload row). */
export interface LawnView {
  id: string;
  name: string;
  address: string;
  placeId: string | null;
  location: LawnPoint;
  polygon: LawnPoint[];
  areaM2: number;
}
```

- [ ] **Step 2: Write the area util**

`src/lib/geo.ts`:
```ts
import type { LawnPoint } from "./lawn-types";

// WGS84 mean radius in metres — the same constant Google's
// geometry.spherical.computeArea uses, so our server recompute matches the
// number the customer saw in the browser.
const EARTH_RADIUS = 6378137;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Area (m², rounded) of a simple lat/lng polygon, via the spherical-excess
 * formula. Returns 0 for fewer than 3 vertices. The ring is auto-closed
 * (last vertex connects to first). Self-intersection is not validated (MVP).
 */
export function computePolygonArea(points: LawnPoint[]): number {
  if (points.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    total +=
      toRad(p2.lng - p1.lng) *
      (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
  }
  return Math.round(Math.abs((total * EARTH_RADIUS * EARTH_RADIUS) / 2));
}
```

- [ ] **Step 3: Write the sanity script (the "failing test" first)**

`scripts/check-lawns.ts`:
```ts
/**
 * Runnable sanity checks for the pure lawn utils (no unit-test runner in repo).
 * Run: npx tsx scripts/check-lawns.ts
 */
import assert from "node:assert/strict";

import { computePolygonArea } from "../src/lib/geo";

// A ~1 km square at the equator (0.0089832° ≈ 1000 m of both lat and lng there)
// must measure ≈ 1,000,000 m² within 2 %.
const side = 0.0089832;
const square = [
  { lat: 0, lng: 0 },
  { lat: side, lng: 0 },
  { lat: side, lng: side },
  { lat: 0, lng: side },
];
const area = computePolygonArea(square);
assert.ok(
  Math.abs(area - 1_000_000) < 20_000,
  `expected ~1,000,000 m², got ${area}`,
);

// Degenerate polygons are zero.
assert.equal(computePolygonArea([{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }]), 0);

console.log(`geo OK — 1km² square measured ${area} m²`);
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx tsx scripts/check-lawns.ts`
Expected: `geo OK — 1km² square measured <~1000000> m²` and exit 0. If the assert throws, the formula is wrong — fix `geo.ts` before continuing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/lawn-types.ts src/lib/geo.ts scripts/check-lawns.ts
git commit -m "feat(lawns): shared types + spherical area util + sanity script"
```

---

### Task 2: `lawns` Payload collection

**Files:**
- Create: `src/collections/Lawns.ts`
- Modify: `src/payload.config.ts:10-17` (imports) and `:33` (collections array)

- [ ] **Step 1: Create the collection**

`src/collections/Lawns.ts`:
```ts
import type { CollectionConfig } from "payload";

import { assignDefaultTenant } from "./hooks/assign-default-tenant";

/**
 * A customer's lawn/property: a map pin + a drawn polygon + its computed area.
 * Owner-scoped — but access is enforced in src/lib/lawns.ts (the Local API runs
 * as admin via the Better Auth adapter), NOT here. `read`/`create` stay closed
 * (no public API surface); all reads/writes go through the data-access layer.
 * `tenant` is assigned by the shared beforeChange hook ([[tenancy-and-roles]]).
 */
export const Lawns: CollectionConfig = {
  slug: "lawns",
  admin: {
    useAsTitle: "name",
    group: "Klienci",
    defaultColumns: ["name", "address", "areaM2", "owner"],
  },
  access: {
    // Closed by default — the app reaches lawns only via the Local API
    // (src/lib/lawns.ts), which bypasses access control. /admin superadmins
    // still see them (admins collection auth is separate).
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    { name: "name", type: "text", required: true },
    { name: "address", type: "text", required: true },
    { name: "placeId", type: "text" },
    {
      name: "location",
      type: "group",
      fields: [
        { name: "lat", type: "number", required: true },
        { name: "lng", type: "number", required: true },
      ],
    },
    // Array of { lat, lng } vertices (>=3). Stored as JSON.
    { name: "polygon", type: "json", required: true },
    { name: "areaM2", type: "number", required: true },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
    },
  ],
  hooks: {
    beforeChange: [assignDefaultTenant],
  },
  timestamps: true,
};
```

- [ ] **Step 2: Register it in the Payload config**

In `src/payload.config.ts`, add the import after the `Services` import (line ~17):
```ts
import { Lawns } from "./collections/Lawns";
```
And add `Lawns` to the `collections` array (line ~33):
```ts
collections: [Admins, Users, Sessions, Accounts, Verifications, Tenants, Media, Services, Lawns],
```

- [ ] **Step 3: Regenerate Payload types**

Run: `npx payload generate:types`
Expected: `src/payload-types.ts` now contains a `Lawn` interface and `lawns` in the `Config['collections']` map. Exit 0.

- [ ] **Step 4: Type-check**

Run: `npm run check`
Expected: passes (only the 3 known `<img>` warnings). This confirms the collection + config compile.

- [ ] **Step 5: Create the table (dev-push — CONTROLLER ACTION, requires authorization)**

> **STOP — implementer subagent: do not run this.** Creating the `lawns` table is a dev-push against the shared Neon DB. Hand back to the controller with status DONE_WITH_CONCERNS noting "lawns table needs dev-push." The controller obtains the user's authorization, then runs a script that boots Payload so dev-push creates the table:

```bash
npx tsx --env-file=.env scripts/seed.ts
```
Expected: completes with no `relation "lawns" does not exist` error; the `lawns` table now exists. (If `scripts/seed.ts` is unsuitable, any `getPayload({ config })` boot performs the push.)

- [ ] **Step 6: Commit**

```bash
git add src/collections/Lawns.ts src/payload.config.ts src/payload-types.ts
git commit -m "feat(lawns): lawns collection (owner-scoped, closed access) + register"
```

---

### Task 3: Ownership data-access layer

**Files:**
- Create: `src/lib/lawns.ts`

- [ ] **Step 1: Write the data-access module**

`src/lib/lawns.ts`:
```ts
/**
 * The ONLY ownership boundary for lawns. Because the Better Auth → Payload
 * adapter uses the Local API (which bypasses access control), every function
 * here filters by `owner == userId`. Components/actions consume ONLY these
 * accessors — never the `lawns` collection directly. Returns projected
 * `LawnView` objects, decoupled from the raw Payload row.
 */
import { getPayload } from "payload";
import config from "@payload-config";

import type { Lawn } from "@/payload-types";
import type { LawnInput, LawnPoint, LawnView } from "./lawn-types";
import { computePolygonArea } from "./geo";

function project(doc: Lawn): LawnView {
  const loc = (doc.location ?? {}) as { lat?: number; lng?: number };
  return {
    id: String(doc.id),
    name: doc.name,
    address: doc.address,
    placeId: doc.placeId ?? null,
    location: { lat: loc.lat ?? 0, lng: loc.lng ?? 0 },
    polygon: (doc.polygon as LawnPoint[] | null) ?? [],
    areaM2: doc.areaM2,
  };
}

export async function getMyLawns(userId: string): Promise<LawnView[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "lawns",
    where: { owner: { equals: userId } },
    sort: "-createdAt",
    depth: 0,
    limit: 100,
  });
  return docs.map(project);
}

export async function getLawn(
  userId: string,
  id: string,
): Promise<LawnView | null> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "lawns",
    where: { and: [{ id: { equals: id } }, { owner: { equals: userId } }] },
    depth: 0,
    limit: 1,
  });
  return docs[0] ? project(docs[0]) : null;
}

export async function createLawn(
  userId: string,
  input: LawnInput,
): Promise<LawnView> {
  const payload = await getPayload({ config });
  const doc = await payload.create({
    collection: "lawns",
    data: {
      owner: userId,
      name: input.name,
      address: input.address,
      placeId: input.placeId ?? undefined,
      location: input.location,
      polygon: input.polygon,
      areaM2: computePolygonArea(input.polygon),
    },
  });
  return project(doc);
}

export async function updateLawn(
  userId: string,
  id: string,
  input: Partial<LawnInput>,
): Promise<LawnView> {
  // Ownership check first — never trust the id alone.
  const existing = await getLawn(userId, id);
  if (!existing) throw new Error("Lawn not found");

  const payload = await getPayload({ config });
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.address !== undefined) data.address = input.address;
  if (input.placeId !== undefined) data.placeId = input.placeId ?? undefined;
  if (input.location !== undefined) data.location = input.location;
  if (input.polygon !== undefined) {
    data.polygon = input.polygon;
    data.areaM2 = computePolygonArea(input.polygon);
  }
  const doc = await payload.update({ collection: "lawns", id, data });
  return project(doc);
}

export async function deleteLawn(userId: string, id: string): Promise<void> {
  const existing = await getLawn(userId, id);
  if (!existing) return; // no-op for non-owners / missing
  const payload = await getPayload({ config });
  await payload.delete({ collection: "lawns", id });
}
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: passes (3 known warnings). Confirms the accessors compile against the generated `Lawn` type.

- [ ] **Step 3: Commit**

```bash
git add src/lib/lawns.ts
git commit -m "feat(lawns): owner-scoped data-access layer (the ownership boundary)"
```

---

### Task 4: Static Maps URL builder + map config

**Files:**
- Create: `src/lib/maps.ts`
- Modify: `scripts/check-lawns.ts` (append a maps assertion)

- [ ] **Step 1: Write the maps helper**

`src/lib/maps.ts`:
```ts
import type { LawnPoint } from "./lawn-types";

/** Brand colours for map polygons (emerald-500), shared by drawer + snapshot. */
export const LAWN_STROKE = "#10b981";
export const LAWN_FILL = "#10b981";

/** Google Maps map type for the drawer + snapshots — real grass/terrain. */
export const LAWN_MAP_TYPE = "hybrid";

interface StaticMapOpts {
  width?: number;
  height?: number;
}

/**
 * Build a Google Static Maps URL showing the lawn outline (emerald fill) over
 * hybrid satellite imagery. The map auto-fits the path (no center/zoom needed).
 * Returns null when there's no key or fewer than 3 vertices. `key` is injectable
 * for the sanity script; defaults to the public env var.
 */
export function buildStaticMapUrl(
  polygon: LawnPoint[],
  opts: StaticMapOpts = {},
  key: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
): string | null {
  if (!key || polygon.length < 3) return null;
  const { width = 600, height = 260 } = opts;
  const pts = polygon.map((p) => `${p.lat},${p.lng}`).join("|");
  const path = `fillcolor:0x10b98144|color:0x10b981ff|weight:2|${pts}`;
  const params = new URLSearchParams({
    size: `${width}x${height}`,
    scale: "2",
    maptype: LAWN_MAP_TYPE,
    key,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}&path=${encodeURIComponent(path)}`;
}
```

- [ ] **Step 2: Append a maps assertion to the sanity script**

Add to the end of `scripts/check-lawns.ts`:
```ts
import { buildStaticMapUrl } from "../src/lib/maps";

const url = buildStaticMapUrl(square, {}, "FAKE_KEY");
assert.ok(url && url.includes("staticmap"), "expected a static map url");
assert.ok(url!.includes("maptype=hybrid"), "expected hybrid map type");
assert.ok(url!.includes("key=FAKE_KEY"), "expected the key in the url");
assert.equal(buildStaticMapUrl(square, {}, undefined), null, "no key → null");
assert.equal(
  buildStaticMapUrl([{ lat: 0, lng: 0 }], {}, "FAKE_KEY"),
  null,
  "<3 points → null",
);

console.log("maps OK — static url builder");
```
(Move the new `import` to the top of the file with the other imports.)

- [ ] **Step 3: Run the sanity script**

Run: `npx tsx scripts/check-lawns.ts`
Expected: prints both `geo OK …` and `maps OK …`, exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/lib/maps.ts scripts/check-lawns.ts
git commit -m "feat(lawns): static maps url builder + brand map constants"
```

---

### Task 5: Google Maps client loader + dependencies + env docs

**Files:**
- Create: `src/lib/google-maps-loader.ts`
- Modify: `.env.example`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install dependencies**

Run:
```bash
npm install @googlemaps/js-api-loader
npm install -D @types/google.maps
```
Expected: both added to `package.json`; no peer-dep errors that block (warnings OK).

- [ ] **Step 2: Write the loader singleton**

`src/lib/google-maps-loader.ts` (js-api-loader **v2 functional API** — the v1 `Loader` class is deprecated):
```ts
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

/**
 * Google Maps JS loader (js-api-loader v2 functional API): setOptions() once,
 * then importLibrary() per library. Client-only — reads the public key directly
 * (env.ts is server-runtime only). Polish locale. Returns the typed library
 * objects so callers use library classes (maps.Map, drawing.DrawingManager,
 * geometry.spherical, places.Autocomplete) rather than the global namespace.
 */
export interface MapsLibraries {
  maps: google.maps.MapsLibrary;
  drawing: google.maps.DrawingLibrary;
  geometry: google.maps.GeometryLibrary;
  places: google.maps.PlacesLibrary;
}

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  setOptions({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    v: "weekly",
    language: "pl",
    region: "PL",
  });
  configured = true;
}

export function hasMapsKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
}

export async function loadMapsLibraries(): Promise<MapsLibraries> {
  ensureConfigured();
  const [maps, drawing, geometry, places] = await Promise.all([
    importLibrary("maps"),
    importLibrary("drawing"),
    importLibrary("geometry"),
    importLibrary("places"),
  ]);
  return { maps, drawing, geometry, places };
}
```

- [ ] **Step 3: Document env vars**

Append to `.env.example`:
```bash

# Google Maps (sub-project 3a — customer lawns). Provision in Google Cloud:
# enable Maps JavaScript API, Places API, Maps Static API; restrict the key by
# HTTP referrer to your domains. The MAP_ID is a Cloud Map Style id so the
# styleable (vector) layers can be tuned from the console without a redeploy.
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=""
```

> **Controller note:** the user provisions the real key + Map ID and adds them to local `.env` and Vercel (same flow as the Blob token). The map screens degrade gracefully without them (Task 8 handles the missing-key state); the rest of the app builds fine.

- [ ] **Step 4: Type-check**

Run: `npm run check`
Expected: passes (3 known warnings). Confirms the loader + new types resolve.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/google-maps-loader.ts .env.example
git commit -m "feat(lawns): google maps js loader + deps + env docs"
```

---

### Task 6: shadcn primitives (menu, confirm, toast) + Toaster

**Files:**
- Create (via CLI): `src/components/ui/dropdown-menu.tsx`, `src/components/ui/alert-dialog.tsx`, `src/components/ui/sonner.tsx`
- Modify: `src/app/(app)/layout.tsx`

- [ ] **Step 1: Vendor the components**

Run:
```bash
npx shadcn@latest add dropdown-menu alert-dialog sonner -y
```
Expected: three files created under `src/components/ui/`. If `sonner` (the npm package) isn't installed, the CLI installs it; otherwise run `npm install sonner`.

- [ ] **Step 2: Mount the Toaster**

In `src/app/(app)/layout.tsx`, import and render the toaster inside `<body>`:
```tsx
import { Toaster } from "@/components/ui/sonner";
```
Change the body to:
```tsx
      <body className="min-h-full bg-white text-neutral-900 font-[family-name:var(--font-inter)]">
        {children}
        <Toaster position="top-center" richColors />
      </body>
```

- [ ] **Step 3: Verify**

Run: `npm run check`
Expected: passes (3 known warnings; the vendored shadcn files are lint-clean).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/dropdown-menu.tsx src/components/ui/alert-dialog.tsx src/components/ui/sonner.tsx src/app/\(app\)/layout.tsx package.json package-lock.json
git commit -m "feat(ui): dropdown-menu, alert-dialog, sonner toaster for lawns"
```

---

### Task 7: Server actions

**Files:**
- Create: `src/app/(app)/panel/ogrody/actions.ts`

- [ ] **Step 1: Write the actions**

`src/app/(app)/panel/ogrody/actions.ts`:
```ts
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { createLawn, updateLawn, deleteLawn } from "@/lib/lawns";
import type { LawnInput } from "@/lib/lawn-types";

type ActionError = { ok: false; error: string };

async function requireUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

function validate(input: LawnInput): string | null {
  if (!input.name.trim()) return "Podaj nazwę ogrodu.";
  if (!input.address.trim()) return "Brak adresu — wyszukaj lokalizację.";
  if (!Array.isArray(input.polygon) || input.polygon.length < 3)
    return "Obrysuj trawnik (min. 3 punkty).";
  return null;
}

/** On success this redirects to /panel/ogrody (does not return). */
export async function createLawnAction(
  input: LawnInput,
): Promise<ActionError | never> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sesja wygasła. Zaloguj się ponownie." };
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    await createLawn(userId, input);
  } catch {
    return { ok: false, error: "Nie udało się zapisać ogrodu. Spróbuj ponownie." };
  }
  revalidatePath("/panel/ogrody");
  revalidatePath("/panel");
  redirect("/panel/ogrody");
}

/** On success this redirects to /panel/ogrody (does not return). */
export async function updateLawnAction(
  id: string,
  input: LawnInput,
): Promise<ActionError | never> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sesja wygasła. Zaloguj się ponownie." };
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    await updateLawn(userId, id, input);
  } catch {
    return { ok: false, error: "Nie udało się zapisać zmian." };
  }
  revalidatePath("/panel/ogrody");
  revalidatePath("/panel");
  redirect("/panel/ogrody");
}

export async function deleteLawnAction(
  id: string,
): Promise<{ ok: true } | ActionError> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sesja wygasła." };
  try {
    await deleteLawn(userId, id);
  } catch {
    return { ok: false, error: "Nie udało się usunąć ogrodu." };
  }
  revalidatePath("/panel/ogrody");
  revalidatePath("/panel");
  return { ok: true };
}
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: passes (3 known warnings).

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/panel/ogrody/actions.ts
git commit -m "feat(lawns): create/update/delete server actions (session-scoped)"
```

---

### Task 8: LawnDrawer — the guided map client component

**Files:**
- Create: `src/components/lawns/LawnDrawer.tsx`

This is the core UI. It walks through three phases (`search → draw → ready`) on one map. The map type is hybrid; default Google UI is disabled. The polygon is editable after drawing (drag corners), so "mistakes are cheap" via drag + "Rysuj od nowa" (we don't implement per-vertex undo during drawing).

> **v2 loader correction (applied during implementation):** `@googlemaps/js-api-loader@2` deprecated the `Loader` class. This component uses `loadMapsLibraries()` (Task 5, v2 functional API) instead of `getMapsLoader()`, and uses the returned **library objects** — `maps.Map`, `maps.Polygon`, `maps.LatLngBounds`, `drawing.DrawingManager`, `drawing.OverlayType.POLYGON`, `geometry.spherical.computeArea`, `places.Autocomplete` — rather than the global `google.maps.*` constructors. `geometry` and `drawing` are held in refs (`geometryRef`, `drawingLibRef`) so `recomputeArea()`/`startDrawing()` can reach them from event handlers. Global `google.maps.*` is still used for *type annotations only*. The corrected component is the one dispatched to (and committed by) the implementer.

- [ ] **Step 1: Write the component**

`src/components/lawns/LawnDrawer.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getMapsLoader, hasMapsKey } from "@/lib/google-maps-loader";
import { LAWN_FILL, LAWN_STROKE, LAWN_MAP_TYPE } from "@/lib/maps";
import type { LawnInput, LawnPoint, LawnView } from "@/lib/lawn-types";

type Phase = "search" | "draw" | "ready";

interface Props {
  /** Present in edit mode — prefills the map and skips the search phase. */
  initial?: LawnView;
  /** Called with the assembled input. On success it redirects (never resolves
   *  with ok); on failure it returns { ok:false, error }. */
  onSave: (input: LawnInput) => Promise<{ ok: false; error: string } | never>;
  submitLabel: string;
}

const pathToPoints = (poly: google.maps.Polygon): LawnPoint[] =>
  poly
    .getPath()
    .getArray()
    .map((ll) => ({ lat: ll.lat(), lng: ll.lng() }));

export function LawnDrawer({ initial, onSave, submitLabel }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const managerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  const [phase, setPhase] = useState<Phase>(initial ? "ready" : "search");
  const [area, setArea] = useState<number>(initial?.areaM2 ?? 0);
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [address, setAddress] = useState<string>(initial?.address ?? "");
  const [placeId, setPlaceId] = useState<string | null>(initial?.placeId ?? null);
  const [center, setCenter] = useState<LawnPoint>(
    initial?.location ?? { lat: 53.1235, lng: 18.0084 }, // Bydgoszcz fallback
  );
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Recompute area from the live polygon path (drag/edit) using Google geometry.
  function recomputeArea() {
    const poly = polygonRef.current;
    if (!poly) return;
    const m2 = google.maps.geometry.spherical.computeArea(poly.getPath());
    setArea(Math.round(m2));
  }

  function attachPolygon(poly: google.maps.Polygon) {
    polygonRef.current?.setMap(null);
    polygonRef.current = poly;
    poly.setEditable(true);
    poly.setOptions({
      strokeColor: LAWN_STROKE,
      strokeWeight: 3,
      fillColor: LAWN_FILL,
      fillOpacity: 0.3,
    });
    const path = poly.getPath();
    ["set_at", "insert_at", "remove_at"].forEach((ev) =>
      path.addListener(ev, recomputeArea),
    );
    recomputeArea();
  }

  function startDrawing() {
    setPhase("draw");
    managerRef.current?.setDrawingMode(
      google.maps.drawing.OverlayType.POLYGON,
    );
  }

  function redraw() {
    polygonRef.current?.setMap(null);
    polygonRef.current = null;
    setArea(0);
    startDrawing();
  }

  // One-time map init.
  useEffect(() => {
    let cancelled = false;
    if (!hasMapsKey()) {
      setMapsError("Mapa jest chwilowo niedostępna — brak konfiguracji.");
      return;
    }
    const loader = getMapsLoader();
    (async () => {
      try {
        const [{ Map }, drawingLib] = await Promise.all([
          loader.importLibrary("maps"),
          loader.importLibrary("drawing"),
          loader.importLibrary("geometry"),
          loader.importLibrary("places"),
        ]);
        if (cancelled || !mapDivRef.current) return;

        const map = new Map(mapDivRef.current, {
          center,
          zoom: initial ? 20 : 17,
          mapTypeId: LAWN_MAP_TYPE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          tilt: 0,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || undefined,
        });
        mapRef.current = map;

        const manager = new drawingLib.DrawingManager({
          drawingControl: false,
          polygonOptions: {
            strokeColor: LAWN_STROKE,
            strokeWeight: 3,
            fillColor: LAWN_FILL,
            fillOpacity: 0.3,
            editable: true,
          },
        });
        manager.setMap(map);
        managerRef.current = manager;
        manager.addListener(
          "polygoncomplete",
          (poly: google.maps.Polygon) => {
            manager.setDrawingMode(null);
            attachPolygon(poly);
            setPhase("ready");
          },
        );

        // Edit mode: draw the existing polygon up front.
        if (initial && initial.polygon.length >= 3) {
          const poly = new google.maps.Polygon({ paths: initial.polygon });
          poly.setMap(map);
          attachPolygon(poly);
          const bounds = new google.maps.LatLngBounds();
          initial.polygon.forEach((p) => bounds.extend(p));
          map.fitBounds(bounds);
        }

        // Places autocomplete on the search field.
        if (searchInputRef.current) {
          const ac = new google.maps.places.Autocomplete(
            searchInputRef.current,
            { fields: ["geometry", "formatted_address", "place_id"], componentRestrictions: { country: "pl" } },
          );
          ac.addListener("place_changed", () => {
            const place = ac.getPlace();
            const loc = place.geometry?.location;
            if (!loc) return;
            const point = { lat: loc.lat(), lng: loc.lng() };
            setCenter(point);
            setAddress(place.formatted_address ?? "");
            setPlaceId(place.place_id ?? null);
            map.panTo(point);
            map.setZoom(20);
            startDrawing();
          });
        }
      } catch {
        if (!cancelled) setMapsError("Nie udało się załadować mapy.");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSave = name.trim().length > 0 && area > 0 && !!polygonRef.current;

  async function handleSave() {
    if (!polygonRef.current) return;
    setSaving(true);
    const input: LawnInput = {
      name: name.trim(),
      address,
      placeId,
      location: center,
      polygon: pathToPoints(polygonRef.current),
    };
    const res = await onSave(input);
    // Only reached on failure (success redirects server-side).
    if (res && !res.ok) {
      toast.error(res.error);
      setSaving(false);
    }
  }

  if (mapsError) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-center">
        <p className="text-sm text-neutral-600">{mapsError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-white"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-9rem)] min-h-[480px] overflow-hidden rounded-2xl border border-neutral-200">
      <div ref={mapDivRef} className="absolute inset-0 bg-neutral-100" />

      {/* Search (always rendered so Autocomplete can bind; hidden once drawing) */}
      <div
        className={`absolute left-3 right-3 top-3 z-10 transition ${
          phase === "search" ? "" : "pointer-events-none opacity-0"
        }`}
      >
        <input
          ref={searchInputRef}
          type="text"
          placeholder="🔍  Wpisz adres swojego trawnika…"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-lg outline-none focus:border-emerald-500"
        />
      </div>

      {/* Dimmer + prompt during search */}
      {phase === "search" && (
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/40">
          <p className="rounded-full bg-black/60 px-4 py-2 text-sm text-white">
            Zacznij od wpisania adresu
          </p>
        </div>
      )}

      {/* Hint pill while drawing */}
      {phase === "draw" && (
        <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs text-white">
          Klikaj rogi trawnika, aby go obrysować
        </div>
      )}

      {/* Result card */}
      {phase === "ready" && (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl sm:left-auto sm:right-3 sm:w-80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Powierzchnia</span>
            <span className="text-xl font-bold text-emerald-700">
              ≈ {area.toLocaleString("pl-PL")} m²
            </span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nazwa ogrodu, np. „Dom”"
            className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={redraw}
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Rysuj od nowa
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Zapisywanie…" : submitLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: passes (3 known warnings). `@types/google.maps` provides the global `google` namespace. If `importLibrary` return types complain, the implementer narrows with the documented library types — do not use `any`.

- [ ] **Step 3: Commit**

```bash
git add src/components/lawns/LawnDrawer.tsx
git commit -m "feat(lawns): LawnDrawer guided satellite map (search → draw → save)"
```

---

### Task 9: Add-lawn route

**Files:**
- Create: `src/app/(app)/panel/ogrody/nowy/page.tsx`

- [ ] **Step 1: Write the page**

`src/app/(app)/panel/ogrody/nowy/page.tsx`:
```tsx
import Link from "next/link";

import { LawnDrawer } from "@/components/lawns/LawnDrawer";
import { createLawnAction } from "../actions";

export const metadata = { title: "Dodaj ogród" };

export default function NewLawnPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dodaj ogród</h1>
        <Link
          href="/panel/ogrody"
          className="text-sm text-neutral-500 hover:text-emerald-700"
        >
          ← Wróć
        </Link>
      </div>
      <LawnDrawer onSave={createLawnAction} submitLabel="Zapisz ogród" />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: passes (3 known warnings).

- [ ] **Step 3: Runtime check (controller, after the key is set)**

With `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env`, run `npm run dev`, sign in as the demo customer, visit `/panel/ogrody/nowy`: the map loads, address search zooms in, drawing a polygon shows a live area, naming + Zapisz redirects to `/panel/ogrody`. (If the key isn't set yet, confirm the graceful "Mapa niedostępna" state instead.)

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/panel/ogrody/nowy/page.tsx
git commit -m "feat(lawns): add-lawn route /panel/ogrody/nowy"
```

---

### Task 10: Lawn card, actions menu, and the list page

**Files:**
- Create: `src/components/lawns/LawnActionsMenu.tsx`
- Create: `src/components/lawns/LawnCard.tsx`
- Modify: `src/app/(app)/panel/ogrody/page.tsx`

- [ ] **Step 1: Write the actions menu (client)**

`src/components/lawns/LawnActionsMenu.tsx`:
```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteLawnAction } from "@/app/(app)/panel/ogrody/actions";

export function LawnActionsMenu({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    startTransition(async () => {
      const res = await deleteLawnAction(id);
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Ogród usunięty.");
        router.refresh();
      }
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Więcej opcji"
          className="rounded-lg border border-neutral-200 px-2 py-2 text-neutral-500 hover:bg-neutral-50"
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/panel/ogrody/${id}/edytuj`)}
          >
            Zmień nazwę / obrys
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setConfirmOpen(true)}
          >
            Usuń ogród
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunąć „{name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Tej operacji nie można cofnąć. Ogród i jego obrys zostaną trwale
              usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              disabled={pending}
              className="bg-red-600 hover:bg-red-700"
            >
              {pending ? "Usuwanie…" : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 2: Write the card (server)**

`src/components/lawns/LawnCard.tsx`:
```tsx
import Link from "next/link";

import { buildStaticMapUrl } from "@/lib/maps";
import type { LawnView } from "@/lib/lawn-types";
import { LawnActionsMenu } from "./LawnActionsMenu";

export function LawnCard({ lawn }: { lawn: LawnView }) {
  const snapshot = buildStaticMapUrl(lawn.polygon, { width: 480, height: 220 });

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="relative aspect-[16/8] bg-emerald-900/10">
        {snapshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={snapshot}
            alt={`Mapa — ${lawn.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            Podgląd mapy niedostępny
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 shadow">
          {lawn.areaM2.toLocaleString("pl-PL")} m²
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold tracking-tight text-neutral-900">
          {lawn.name}
        </h3>
        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {lawn.address}
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            href="/panel/uslugi"
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Zamów usługi
          </Link>
          <LawnActionsMenu id={lawn.id} name={lawn.name} />
        </div>
      </div>
    </div>
  );
}
```

> Note: "Zamów usługi" links to `/panel/uslugi` (an existing ComingSoon stub) — 3b's booking flow replaces that target.

- [ ] **Step 3: Rewrite the list page (server)**

Replace `src/app/(app)/panel/ogrody/page.tsx` entirely with:
```tsx
import Link from "next/link";
import { headers } from "next/headers";
import { Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { getMyLawns } from "@/lib/lawns";
import { LawnCard } from "@/components/lawns/LawnCard";

export const metadata = { title: "Moje ogrody" };

export default async function OgrodyPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const lawns = session ? await getMyLawns(session.user.id) : [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Moje ogrody</h1>
        {lawns.length > 0 && (
          <Link
            href="/panel/ogrody/nowy"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Dodaj ogród
          </Link>
        )}
      </div>

      {lawns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
          <div className="text-3xl">🌱</div>
          <h2 className="mt-3 font-semibold text-neutral-900">
            Nie masz jeszcze żadnego ogrodu
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Dodaj swój trawnik na mapie — obrysujesz go w kilka sekund, a my
            policzymy powierzchnię i przygotujemy wycenę usług.
          </p>
          <Link
            href="/panel/ogrody/nowy"
            className="mt-5 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Dodaj ogród
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lawns.map((lawn) => (
            <LawnCard key={lawn.id} lawn={lawn} />
          ))}
          <Link
            href="/panel/ogrody/nowy"
            className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            <Plus className="h-7 w-7" />
            <span className="text-sm font-semibold">Dodaj kolejny ogród</span>
          </Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run check`
Expected: passes (3 known `<img>` warnings + now a 4th expected `<img>` warning from `LawnCard.tsx` is suppressed by the inline `eslint-disable-next-line`, so still 3). Confirm no NEW unsuppressed warnings.

- [ ] **Step 5: Commit**

```bash
git add src/components/lawns/LawnActionsMenu.tsx src/components/lawns/LawnCard.tsx src/app/\(app\)/panel/ogrody/page.tsx
git commit -m "feat(lawns): /panel/ogrody list — empty state, cards, ⋯ menu"
```

---

### Task 11: Edit (re-draw / rename) route

**Files:**
- Create: `src/app/(app)/panel/ogrody/[id]/edytuj/page.tsx`

- [ ] **Step 1: Write the edit page**

`src/app/(app)/panel/ogrody/[id]/edytuj/page.tsx`:
```tsx
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getLawn } from "@/lib/lawns";
import { LawnDrawer } from "@/components/lawns/LawnDrawer";
import { updateLawnAction } from "../../actions";
import type { LawnInput } from "@/lib/lawn-types";

export const metadata = { title: "Edytuj ogród" };

export default async function EditLawnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const lawn = await getLawn(session.user.id, id);
  if (!lawn) notFound();

  // Bind the id into the action (a server function) so LawnDrawer's onSave
  // signature stays (input) => ….
  async function onSave(input: LawnInput) {
    "use server";
    return updateLawnAction(id, input);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edytuj ogród</h1>
        <Link
          href="/panel/ogrody"
          className="text-sm text-neutral-500 hover:text-emerald-700"
        >
          ← Wróć
        </Link>
      </div>
      <LawnDrawer initial={lawn} onSave={onSave} submitLabel="Zapisz zmiany" />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: passes (3 known warnings).

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/panel/ogrody/\[id\]/edytuj/page.tsx
git commit -m "feat(lawns): edit route /panel/ogrody/[id]/edytuj (re-draw/rename)"
```

---

### Task 12: Dashboard summary

**Files:**
- Modify: `src/app/(app)/panel/page.tsx`

- [ ] **Step 1: Add the lawns count to the dashboard**

Replace `src/app/(app)/panel/page.tsx` with:
```tsx
import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { getMyLawns } from "@/lib/lawns";

export const metadata = { title: "Pulpit" };

export default async function PanelPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user?.name;
  const lawns = session ? await getMyLawns(session.user.id) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Witaj{name ? `, ${name}` : ""} 👋
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Tu zobaczysz swoje ogrody, najbliższe wizyty i zamówienia.
      </p>

      <Link
        href="/panel/ogrody"
        className="mt-6 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-emerald-300"
      >
        <div>
          <p className="text-sm text-neutral-500">Moje ogrody</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {lawns.length === 0
              ? "Dodaj swój pierwszy ogród"
              : `${lawns.length} ${lawns.length === 1 ? "ogród" : "ogrody"}`}
          </p>
        </div>
        <span aria-hidden className="text-emerald-700">
          →
        </span>
      </Link>
    </div>
  );
}
```

> Polish plural note: this uses a simple "ogród/ogrody" split (1 vs other). It reads naturally for the small counts an MVP customer will have; full plural rules (2–4 "ogrody" vs 5+ "ogrodów") are not worth a library here.

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: passes (3 known warnings).

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/panel/page.tsx
git commit -m "feat(lawns): dashboard 'Moje ogrody' summary card"
```

---

### Task 13: Mind updates

**Files:**
- Create: `kryscar-mind/map/zones/customer-lawns.md`
- Create: `kryscar-mind/map/decisions/lawns-ownership-in-data-layer.md`
- Create: `kryscar-mind/map/decisions/google-maps-integration.md`
- Modify: `kryscar-mind/map/zones/app-shell.md` (ogrody routes now real; re-stamp `verifiedAt`)
- Modify: `kryscar-mind/tech-debt/prod-migrations-needed.md` (new `lawns` table)

- [ ] **Step 1: Write the `customer-lawns` zone**

Create `kryscar-mind/map/zones/customer-lawns.md` following the existing zone format (see `service-pages.md`). Frontmatter must include: `type: zone`, a `summary`, `status: active`, `created`/`updated: 2026-06-04`, `related` (`[[app-shell]]`, `[[auth-portal]]`, `[[tenancy-and-roles]]`, `[[payload-backend]]`), `sources: ["[[2026-06-04-customer-lawns-3a-design]]"]`, `owns.routes` (`/panel/ogrody`, `/panel/ogrody/nowy`, `/panel/ogrody/[id]/edytuj`), `owns.anchors` (`symbol:getMyLawns`, `symbol:createLawn`, `symbol:LawnDrawer`, `symbol:computePolygonArea`, `symbol:buildStaticMapUrl`), `owns.globs` (`src/lib/lawns.ts`, `src/lib/lawn-types.ts`, `src/lib/geo.ts`, `src/lib/maps.ts`, `src/lib/google-maps-loader.ts`, `src/collections/Lawns.ts`, `src/components/lawns/**`, `src/app/(app)/panel/ogrody/**`), `depends` (`[[auth-portal]]`, `[[payload-backend]]`, `[[ui-primitives]]`), and **invariants as `{rule, enforcedBy}` objects** (bare strings break the generator). Required invariants:
```yaml
invariants:
  - rule: "Lawn ownership is enforced in src/lib/lawns.ts (every query filtered by owner == userId) — the Local API runs as admin via the Better Auth adapter, so the Lawns collection access is closed and components/actions never query lawns directly."
    enforcedBy: []
  - rule: "areaM2 is recomputed server-side from the polygon via computePolygonArea on create/update — the client value is never persisted as-is."
    enforcedBy: []
  - rule: "Client components import only src/lib/lawn-types.ts, the google-maps-loader, and the server actions — never src/lib/lawns.ts (which pulls in Payload)."
    enforcedBy: []
```
Body: Purpose, the add-lawn flow (search → draw → area → save), the card list, and a "for browser agents" app-map note for `/panel/ogrody`.

- [ ] **Step 2: Write the two decision records**

`lawns-ownership-in-data-layer.md`: why ownership lives in the data-access layer (BA→Payload Local API bypasses access control) rather than Payload field access; the closed-collection consequence.

`google-maps-integration.md`: libraries (places/drawing/geometry + Static Maps), the two env vars + Cloud Map ID, satellite/hybrid choice, the "satellite is photographic → can't be recolored, brand via polygon + chrome" constraint, and the client-area/server-recompute split. Follow the existing decision-record format (see `kryscar-mind/map/decisions/media-vercel-blob-blur-hook.md`).

- [ ] **Step 3: Update `app-shell` zone + `prod-migrations-needed`**

In `kryscar-mind/map/zones/app-shell.md`: note `/panel/ogrody` (+ `/nowy`, `/[id]/edytuj`) are now real (owned by `customer-lawns`), and re-stamp `verifiedAt` to the current HEAD after the final commit. In `kryscar-mind/tech-debt/prod-migrations-needed.md`: add the new `lawns` table to the list of dev-pushed tables needing a production migration story.

- [ ] **Step 4: Regenerate the Mind and verify no broken anchors**

Run: `npm run check`
Expected: the Mind generator runs clean — **no "invariant … has no enforcedBy" NEW gaps beyond the documented pre-existing ones, and no broken-anchor errors.** If a symbol anchor (e.g. `symbol:LawnDrawer`) is reported missing, fix the anchor name to match the actual exported symbol.

- [ ] **Step 5: Commit**

```bash
git add kryscar-mind/
git commit -m "docs(mind): customer-lawns zone + decisions; app-shell + tech-debt updates"
```

---

## Final verification (after all tasks)

- [ ] `npm run check` passes (only the 3 known `<img>` warnings).
- [ ] `npx tsx scripts/check-lawns.ts` passes (geo + maps).
- [ ] Runtime (controller, with the Google key in `.env`): demo customer can add a lawn (search → draw → area → name → save), it appears as a card with a working Static Maps snapshot, re-draw/rename/delete work, the dashboard shows the count, and a **second** account cannot see or mutate the first account's lawns.
- [ ] Dispatch a final code review over the whole branch, then use **superpowers:finishing-a-development-branch**.

---

## Self-review notes (author)

- **Spec coverage:** collection (T2), ownership boundary (T3), area recompute (T1/T3), Google Maps + libraries + env + Map ID (T5/T8), Static Maps snapshot (T4/T10), guided add flow (T8/T9), list + empty + cards + ⋯ menu (T10), re-draw/rename/delete (T10/T11), dashboard summary (T12), error states (T8: maps-fail + save-fail; T10: confirm), testing via check + sanity script (T1/T4 + final), Mind (T13). All spec sections map to a task.
- **Dev-push** is explicitly flagged as a controller-authorized action (T2.5), matching the constraint that bit sub-project 2.
- **Type consistency:** `LawnPoint`/`LawnInput`/`LawnView` defined once in `lawn-types.ts`; `computePolygonArea(LawnPoint[])`, `buildStaticMapUrl(LawnPoint[], opts?, key?)`, `getMyLawns/getLawn/createLawn/updateLawn/deleteLawn`, and the three actions use those names consistently across tasks.
- **Deviation from the visual mock:** per-vertex "Cofnij punkt" + live point counter during drawing is replaced by an editable polygon (drag corners) + "Rysuj od nowa" — simpler and robust with DrawingManager, same "mistakes are cheap" intent. Called out in T8.
