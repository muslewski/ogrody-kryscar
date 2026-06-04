# Lawns Smart Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-tap "Auto wypełnij" to the lawn map — fetch the parcel (ULDK) minus the buildings on it (OSM) so the area excludes the house — plus a fade+snap-pulse animation when any polygon lands.

**Architecture:** A self-contained `src/lib/boundary/` module: provider interfaces, a ULDK parcel provider, an OSM (Overpass) building provider, a polygon-clipping-based clip/net-area helper, and a failover orchestrator (`autoFillLawn`) that walks ordered provider chains with per-provider timeouts and degrades to manual drawing. A session-gated server action exposes it. `LawnDrawer` gains the button, building overlays, the animation, and net-area display. The `lawns` collection stores the clipped building rings + a `source`, and `areaM2` becomes net (parcel − buildings).

**Tech Stack:** Next.js 16 (RSC + server actions), React 19, PayloadCMS 3.85 (dev-push), Google Maps JS v2, ULDK/GUGiK + OpenStreetMap Overpass (free, no keys), `polygon-clipping`.

---

## Conventions for every task

- **Verification gate = `npm run check`** (`tsc --noEmit && eslint && payload generate:types && node scripts/mind/generate.mjs`). Pure logic is also checked by `npx tsx scripts/check-lawns.ts`. The repo has **no unit-test runner**.
- Three pre-existing `<img>` eslint warnings (`example-10/page.tsx` ×2, `CoverageMap.tsx`) are expected — NOT failures.
- Payload config alias `@payload-config`; generated types `@/payload-types`. ESM, TS strict.
- **Schema = dev-push, NOT migrations.** The new `buildings`/`source` columns on `lawns` are created by a dev-push (Task 6) — a **shared-infra action requiring the human controller's authorization**; the implementer subagent must STOP and hand it back.
- **Client/server boundary:** client components import only `@/lib/lawn-types`, the google-maps-loader, the server actions, and `@/lib/maps` (pure). They must NEVER import `@/lib/lawns.ts` or `@/lib/boundary/*` (these run on the server: Payload / `fetch` to external APIs / `polygon-clipping`). The browser computes its *display* area with Google `geometry.spherical`; the server is authoritative.
- This builds on the merged 3a feature. Work proceeds on the current branch.

---

## File Structure

**Create:**
- `src/lib/boundary/types.ts` — `Ring`, `BBox`, `ParcelProvider`, `BuildingProvider`, `AutoFillResult`, `AutoFillError`.
- `src/lib/boundary/wkt.ts` — `parseWktPolygon(wkt)` (ULDK geometry → ring).
- `src/lib/boundary/geo-clip.ts` — `clipBuildingsToParcel`, `netArea`, `bboxOf` (polygon-clipping + spherical area).
- `src/lib/boundary/chain.ts` — `withTimeout`, `runChain` (failover).
- `src/lib/boundary/uldk.ts` — `buildUldkUrl`, `parseUldkResponse`, `uldkParcelProvider`.
- `src/lib/boundary/osm-buildings.ts` — `buildOverpassQuery`, `parseOverpassJson`, `osmBuildingProvider`.
- `src/lib/boundary/index.ts` — `parcelChain`, `buildingChain`, `autoFillLawn`.
- `src/components/lawns/play-fill-pulse.ts` — the landing animation.

**Modify:**
- `src/lib/lawn-types.ts` — add `buildings?`/`source?` to `LawnInput`, `buildings`/`source` to `LawnView`.
- `src/collections/Lawns.ts` — add `buildings` (json) + `source` (select).
- `src/lib/lawns.ts` — project `buildings`/`source`; `areaM2` via `netArea`.
- `src/lib/maps.ts` — `buildStaticMapUrl` draws building overlays (signature → options-only).
- `src/components/lawns/LawnCard.tsx` — pass `lawn.buildings`.
- `src/app/(app)/panel/ogrody/actions.ts` — add `autoFillLawnAction`.
- `src/components/lawns/LawnDrawer.tsx` — auto-fill button, overlays, animation, net area, save buildings/source.
- `scripts/check-lawns.ts` — extend with the new pure-logic assertions.

**Mind (Task 11):** update `customer-lawns` zone; add decision `auto-fill-parcel-uldk-osm`.

---

### Task 1: Boundary types + WKT parser + clip/net-area + dep

**Files:**
- Create: `src/lib/boundary/types.ts`, `src/lib/boundary/wkt.ts`, `src/lib/boundary/geo-clip.ts`
- Modify: `scripts/check-lawns.ts`, `package.json` (dep, controller-installed)

- [ ] **Step 1 (CONTROLLER): install the dep**

> Implementer subagent: assume `polygon-clipping` is already installed by the controller. Do NOT run npm install. (Controller runs: `npm install polygon-clipping`.) The package ships its own TS types. If `npm run check` reports it has no types, add `src/types/polygon-clipping.d.ts` with `declare module "polygon-clipping";` and report it.

- [ ] **Step 2: Create `src/lib/boundary/types.ts`**

```ts
import type { LawnPoint } from "../lawn-types";

export type Ring = LawnPoint[];

export interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface ParcelProvider {
  name: string;
  fetchParcel(point: LawnPoint): Promise<Ring | null>;
}

export interface BuildingProvider {
  name: string;
  fetchBuildings(bbox: BBox): Promise<Ring[]>;
}

export interface AutoFillResult {
  parcel: Ring;
  buildings: Ring[]; // clipped to the parcel
  areaM2: number; // net = parcel − buildings
  parcelAreaM2: number;
  buildingAreaM2: number;
  sources: { parcel: string; buildings: string | null };
}

export type AutoFillError = { error: "no-parcel" | "failed" };
```

- [ ] **Step 3: Create `src/lib/boundary/wkt.ts`**

```ts
import type { LawnPoint } from "../lawn-types";

/**
 * Parse the outer ring of a WKT POLYGON / MULTIPOLYGON (ULDK geom_wkt, EPSG:4326).
 * Coordinates are "x y" pairs. We detect lon/lat vs lat/lon order by magnitude
 * (Polish lat 49–55, lon 14–25) so an axis-order surprise can't silently flip the
 * shape. Returns null if no valid ring (>=3 points) is found.
 */
export function parseWktPolygon(wkt: string): LawnPoint[] | null {
  if (!wkt) return null;
  // First "(( ... )" group = the outer ring of the first polygon (holes ignored).
  const m = wkt.match(/\(\(\s*([^()]+?)\s*\)/);
  if (!m) return null;
  const ring: LawnPoint[] = [];
  for (const pair of m[1].split(",")) {
    const nums = pair.trim().split(/\s+/).map(Number);
    if (nums.length < 2 || nums.some((n) => Number.isNaN(n))) continue;
    const [a, b] = nums;
    const latFirst = a >= 49 && a <= 55 && b >= 14 && b <= 25;
    ring.push(latFirst ? { lat: a, lng: b } : { lat: b, lng: a });
  }
  return ring.length >= 3 ? ring : null;
}
```

- [ ] **Step 4: Create `src/lib/boundary/geo-clip.ts`**

```ts
// polygon-clipping@0.15 declares NAMED exports only (no default). A namespace
// import satisfies both the .d.ts and the CJS runtime (esModuleInterop).
import * as polygonClipping from "polygon-clipping";

import type { LawnPoint } from "../lawn-types";
import { computePolygonArea } from "../geo";
import type { BBox, Ring } from "./types";

// polygon-clipping uses [x,y] = [lng,lat]; a Polygon is [ring, ...holes].
function ringToXY(ring: Ring): [number, number][] {
  return ring.map((p) => [p.lng, p.lat]);
}
function xyToRing(coords: [number, number][]): Ring {
  return coords.map(([x, y]) => ({ lat: y, lng: x }));
}

/**
 * Clip each building to the parcel — keep only the on-lot portion. Returns the
 * outer rings of the intersections (holes dropped: buildings rarely have them and
 * the area impact is negligible here).
 */
export function clipBuildingsToParcel(parcel: Ring, buildings: Ring[]): Ring[] {
  if (parcel.length < 3 || !buildings.length) return [];
  const parcelGeom: [number, number][][] = [ringToXY(parcel)];
  const out: Ring[] = [];
  for (const b of buildings) {
    if (b.length < 3) continue;
    const inter = polygonClipping.intersection([ringToXY(b)], parcelGeom);
    for (const poly of inter) {
      const outer = poly[0];
      if (outer && outer.length >= 4) out.push(xyToRing(outer as [number, number][]));
    }
  }
  return out;
}

/**
 * Net lawn area (m², rounded) = parcel − Σ(building ∩ parcel). Buildings are
 * clipped to the parcel first. With no buildings this is just the parcel area
 * (the manual-draw case).
 */
export function netArea(parcel: Ring, buildings: Ring[]): number {
  const parcelArea = computePolygonArea(parcel);
  if (!buildings.length) return parcelArea;
  const clipped = clipBuildingsToParcel(parcel, buildings);
  const buildingArea = clipped.reduce((s, r) => s + computePolygonArea(r), 0);
  return Math.max(0, Math.round(parcelArea - buildingArea));
}

/** Bounding box of a ring (for the Overpass query). */
export function bboxOf(ring: Ring): BBox {
  const lats = ring.map((p) => p.lat);
  const lngs = ring.map((p) => p.lng);
  return {
    south: Math.min(...lats),
    west: Math.min(...lngs),
    north: Math.max(...lats),
    east: Math.max(...lngs),
  };
}
```

- [ ] **Step 5: Append assertions to `scripts/check-lawns.ts`**

Add these imports at the top (with the existing ones):
```ts
import { parseWktPolygon } from "../src/lib/boundary/wkt";
import { netArea, clipBuildingsToParcel } from "../src/lib/boundary/geo-clip";
```
Append at the end of the file:
```ts
// WKT parse (lon/lat order, Polish coords)
const wktRing = parseWktPolygon(
  "POLYGON((18.000 53.100, 18.001 53.100, 18.001 53.101, 18.000 53.101, 18.000 53.100))",
);
assert.ok(wktRing && wktRing.length >= 4, "expected a parsed WKT ring");
assert.ok(
  Math.abs(wktRing![0].lat - 53.1) < 1e-6 && Math.abs(wktRing![0].lng - 18.0) < 1e-6,
  "expected lat/lng order from WKT",
);

// netArea: a parcel with an interior building subtracts the building area.
const parcel = [
  { lat: 0, lng: 0 },
  { lat: 0.0089832, lng: 0 },
  { lat: 0.0089832, lng: 0.0089832 },
  { lat: 0, lng: 0.0089832 },
]; // ~1,000,000 m²
const building = [
  { lat: 0.002, lng: 0.002 },
  { lat: 0.004, lng: 0.002 },
  { lat: 0.004, lng: 0.004 },
  { lat: 0.002, lng: 0.004 },
]; // interior ~ (0.002 deg)^2 ≈ 49,600 m²
const net = netArea(parcel, [building]);
assert.ok(net < 1_000_000 && net > 900_000, `expected net < parcel, got ${net}`);
assert.equal(netArea(parcel, []), 1000010, "no buildings → parcel area");

// clip: a building straddling the parcel edge only subtracts the inside part.
const halfOut = [
  { lat: 0.001, lng: -0.001 },
  { lat: 0.001, lng: 0.001 },
  { lat: 0.003, lng: 0.001 },
  { lat: 0.003, lng: -0.001 },
];
const clipped = clipBuildingsToParcel(parcel, [halfOut]);
assert.ok(clipped.length === 1 && clipped[0].length >= 4, "expected one clipped ring");

console.log("boundary geo OK — wkt + netArea + clip");
```

- [ ] **Step 6: Run the sanity script**

Run: `npx tsx scripts/check-lawns.ts`
Expected: prints the existing `geo OK …`, `maps OK …`, and the new `boundary geo OK — wkt + netArea + clip`, exit 0.

- [ ] **Step 7: Verify + commit**

Run: `npm run check` (expect 3 known warnings, 0 errors).
```bash
git add src/lib/boundary/types.ts src/lib/boundary/wkt.ts src/lib/boundary/geo-clip.ts scripts/check-lawns.ts package.json package-lock.json
git commit -m "feat(boundary): types, WKT parser, polygon clip + net-area util"
```

---

### Task 2: Failover chain

**Files:**
- Create: `src/lib/boundary/chain.ts`
- Modify: `scripts/check-lawns.ts`

- [ ] **Step 1: Create `src/lib/boundary/chain.ts`**

```ts
/** Reject if the promise doesn't settle within `ms`. */
export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

export interface ChainResult<T> {
  value: T;
  provider: string;
}

/**
 * Try providers in order. Each `run(provider)` is wrapped in a timeout; a provider
 * that throws, times out, or returns a value failing `isUsable` is skipped and the
 * next is tried. Returns the first usable result (and which provider answered), or
 * null if all fail. This is the failover seam — add providers by extending the array.
 */
export async function runChain<P extends { name: string }, T>(
  providers: P[],
  run: (p: P) => Promise<T>,
  isUsable: (v: T) => boolean,
  timeoutMs: number,
): Promise<ChainResult<T> | null> {
  for (const p of providers) {
    try {
      const value = await withTimeout(run(p), timeoutMs);
      if (isUsable(value)) return { value, provider: p.name };
    } catch {
      // skip this provider, try the next
    }
  }
  return null;
}
```

- [ ] **Step 2: Append a chain assertion to `scripts/check-lawns.ts`**

Add the import at the top:
```ts
import { runChain } from "../src/lib/boundary/chain";
```
Append at the end:
```ts
// chain failover: throwing/empty providers are skipped; the good one wins.
const chainProviders = [
  { name: "throws" },
  { name: "empty" },
  { name: "good" },
];
const chainRes = await runChain(
  chainProviders,
  async (p) => {
    if (p.name === "throws") throw new Error("boom");
    if (p.name === "empty") return [] as number[];
    return [1, 2, 3];
  },
  (v) => v.length > 0,
  1000,
);
assert.ok(chainRes && chainRes.provider === "good", "expected failover to 'good'");
assert.equal(
  await runChain([{ name: "x" }], async () => null, (v) => v !== null, 1000),
  null,
  "all-fail → null",
);

console.log("boundary chain OK — failover");
```
(The sanity script's `main`/top level is already `await`-capable since Task 1 used `await runChain`? It is NOT yet — wrap the whole script body so top-level `await` works: ensure the file's logic runs inside an `async function main(){…} main()` OR rely on tsx's top-level await. tsx supports top-level await, so the bare `await` is fine. If `npx tsx` errors on top-level await, wrap the new awaited blocks in an `async function checkChains(){…}` and call it. Report which you did.)

- [ ] **Step 3: Run + verify + commit**

Run: `npx tsx scripts/check-lawns.ts` (expect the new `boundary chain OK — failover`).
Run: `npm run check`.
```bash
git add src/lib/boundary/chain.ts scripts/check-lawns.ts
git commit -m "feat(boundary): failover chain with per-provider timeout"
```

---

### Task 3: ULDK parcel provider

**Files:**
- Create: `src/lib/boundary/uldk.ts`
- Modify: `scripts/check-lawns.ts`

- [ ] **Step 1: Create `src/lib/boundary/uldk.ts`**

```ts
import type { LawnPoint } from "../lawn-types";
import type { ParcelProvider } from "./types";
import { parseWktPolygon } from "./wkt";

const ULDK_BASE = "https://uldk.gugik.gov.pl/";

/** GetParcelByXY URL for a WGS84 point. ULDK xy order for 4326 is lng,lat. */
export function buildUldkUrl(point: LawnPoint): string {
  const params = new URLSearchParams({
    request: "GetParcelByXY",
    xy: `${point.lng},${point.lat},4326`,
    result: "geom_wkt",
    srid: "4326",
  });
  return `${ULDK_BASE}?${params.toString()}`;
}

/**
 * Parse a ULDK text response: line 1 is a status code ("0" = success), the rest is
 * the WKT geometry. Returns the parcel ring, or null on any non-zero status / miss.
 */
export function parseUldkResponse(text: string): LawnPoint[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const nl = trimmed.indexOf("\n");
  const status = (nl === -1 ? trimmed : trimmed.slice(0, nl)).trim();
  if (status !== "0") return null;
  const body = nl === -1 ? "" : trimmed.slice(nl + 1).trim();
  return parseWktPolygon(body);
}

export const uldkParcelProvider: ParcelProvider = {
  name: "uldk",
  async fetchParcel(point) {
    const res = await fetch(buildUldkUrl(point), {
      headers: { Accept: "text/plain" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`uldk ${res.status}`);
    return parseUldkResponse(await res.text());
  },
};
```

- [ ] **Step 2: Append ULDK parse assertions to `scripts/check-lawns.ts`**

Add import:
```ts
import { buildUldkUrl, parseUldkResponse } from "../src/lib/boundary/uldk";
```
Append:
```ts
const uldkUrl = buildUldkUrl({ lat: 53.123, lng: 18.008 });
assert.ok(uldkUrl.includes("xy=18.008%2C53.123%2C4326"), "expected lng,lat,4326 xy");
assert.ok(uldkUrl.includes("result=geom_wkt") && uldkUrl.includes("srid=4326"), "expected wkt+srid");

const okRes = parseUldkResponse(
  "0\nPOLYGON((18.000 53.100, 18.001 53.100, 18.001 53.101, 18.000 53.101, 18.000 53.100))",
);
assert.ok(okRes && okRes.length >= 4, "expected parcel ring from status-0 response");
assert.equal(parseUldkResponse("-1\n"), null, "non-zero status → null");
assert.equal(parseUldkResponse(""), null, "empty → null");

console.log("boundary uldk OK — url + parse");
```

- [ ] **Step 3: Verify + commit**

Run: `npx tsx scripts/check-lawns.ts` (expect `boundary uldk OK — url + parse`).
Run: `npm run check`.
```bash
git add src/lib/boundary/uldk.ts scripts/check-lawns.ts
git commit -m "feat(boundary): ULDK parcel provider (GetParcelByXY → WKT → ring)"
```

---

### Task 4: OSM building provider

**Files:**
- Create: `src/lib/boundary/osm-buildings.ts`
- Modify: `scripts/check-lawns.ts`

- [ ] **Step 1: Create `src/lib/boundary/osm-buildings.ts`**

```ts
import type { BuildingProvider, BBox, Ring } from "./types";

// Primary Overpass endpoint. To add a mirror as a failover link, register a second
// BuildingProvider with a different endpoint in buildingChain (boundary/index.ts).
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/** Overpass QL: building ways within the bbox, with inline node geometry. */
export function buildOverpassQuery(b: BBox): string {
  return `[out:json][timeout:20];(way["building"](${b.south},${b.west},${b.north},${b.east}););out geom;`;
}

interface OverpassWay {
  type: string;
  geometry?: { lat: number; lon: number }[];
}
interface OverpassResponse {
  elements?: OverpassWay[];
}

/** Building ways → rings. Ways only (most residential buildings); relations skipped. */
export function parseOverpassJson(json: OverpassResponse): Ring[] {
  const rings: Ring[] = [];
  for (const el of json.elements ?? []) {
    if (el.type !== "way" || !el.geometry || el.geometry.length < 4) continue;
    rings.push(el.geometry.map((g) => ({ lat: g.lat, lng: g.lon })));
  }
  return rings;
}

export const osmBuildingProvider: BuildingProvider = {
  name: "osm",
  async fetchBuildings(bbox) {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(buildOverpassQuery(bbox))}`,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`overpass ${res.status}`);
    return parseOverpassJson((await res.json()) as OverpassResponse);
  },
};
```

- [ ] **Step 2: Append OSM parse assertions to `scripts/check-lawns.ts`**

Add import:
```ts
import { buildOverpassQuery, parseOverpassJson } from "../src/lib/boundary/osm-buildings";
```
Append:
```ts
const oq = buildOverpassQuery({ south: 53.1, west: 18.0, north: 53.2, east: 18.1 });
assert.ok(oq.includes('way["building"](53.1,18,53.2,18.1)'), "expected building bbox query");
const oRings = parseOverpassJson({
  elements: [
    { type: "way", geometry: [{ lat: 53.1, lon: 18.0 }, { lat: 53.1, lon: 18.001 }, { lat: 53.101, lon: 18.001 }, { lat: 53.1, lon: 18.0 }] },
    { type: "node", geometry: undefined },
  ],
});
assert.ok(oRings.length === 1 && oRings[0].length === 4, "expected one building ring");

console.log("boundary osm OK — query + parse");
```

- [ ] **Step 3: Verify + commit**

Run: `npx tsx scripts/check-lawns.ts` (expect `boundary osm OK — query + parse`).
Run: `npm run check`.
```bash
git add src/lib/boundary/osm-buildings.ts scripts/check-lawns.ts
git commit -m "feat(boundary): OSM Overpass building provider"
```

---

### Task 5: Orchestrator

**Files:**
- Create: `src/lib/boundary/index.ts`

- [ ] **Step 1: Create `src/lib/boundary/index.ts`**

```ts
import type { LawnPoint } from "../lawn-types";
import { computePolygonArea } from "../geo";
import { bboxOf, clipBuildingsToParcel } from "./geo-clip";
import { runChain } from "./chain";
import { uldkParcelProvider } from "./uldk";
import { osmBuildingProvider } from "./osm-buildings";
import type {
  AutoFillError,
  AutoFillResult,
  BuildingProvider,
  ParcelProvider,
  Ring,
} from "./types";

// Ordered chains — try in order, fall through on error/timeout/empty. Add fallback
// providers (GUGiK EGiB, Google Building Outlines, an Overpass mirror, an AI
// segmenter) by appending here; the orchestrator and UI are untouched.
const parcelChain: ParcelProvider[] = [uldkParcelProvider];
const buildingChain: BuildingProvider[] = [osmBuildingProvider];

const PARCEL_TIMEOUT_MS = 5000;
const BUILDING_TIMEOUT_MS = 6000;

/**
 * Resolve a lawn from a point: parcel (ULDK chain) − buildings (OSM chain, clipped
 * to the parcel). Degrades gracefully: parcel chain fails → no-parcel (manual);
 * building chain fails/empty → whole parcel.
 */
export async function autoFillLawn(
  point: LawnPoint,
): Promise<AutoFillResult | AutoFillError> {
  const parcelRes = await runChain(
    parcelChain,
    (p) => p.fetchParcel(point),
    (v): boolean => Array.isArray(v) && v.length >= 3,
    PARCEL_TIMEOUT_MS,
  );
  if (!parcelRes || !parcelRes.value) return { error: "no-parcel" };
  const parcel: Ring = parcelRes.value;

  const buildingRes = await runChain(
    buildingChain,
    (p) => p.fetchBuildings(bboxOf(parcel)),
    (v) => Array.isArray(v), // [] is a valid answer (no buildings on the lot)
    BUILDING_TIMEOUT_MS,
  );
  const buildings = clipBuildingsToParcel(parcel, buildingRes?.value ?? []);

  const parcelAreaM2 = Math.round(computePolygonArea(parcel));
  const buildingAreaM2 = Math.round(
    buildings.reduce((s, b) => s + computePolygonArea(b), 0),
  );
  return {
    parcel,
    buildings,
    areaM2: Math.max(0, parcelAreaM2 - buildingAreaM2),
    parcelAreaM2,
    buildingAreaM2,
    sources: { parcel: parcelRes.provider, buildings: buildingRes?.provider ?? null },
  };
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run check` (the orchestrator must type-check; note `runChain`'s `parcelRes.value` is `Ring | null`, hence the explicit `!parcelRes.value` guard before assigning `Ring`).
```bash
git add src/lib/boundary/index.ts
git commit -m "feat(boundary): autoFillLawn orchestrator (parcel − buildings, failover)"
```

---

### Task 6: Data model — `buildings` + `source`, net area

**Files:**
- Modify: `src/lib/lawn-types.ts`, `src/collections/Lawns.ts`, `src/lib/lawns.ts`

- [ ] **Step 1: Extend the shared types (`src/lib/lawn-types.ts`)**

Replace the `LawnInput` and `LawnView` interfaces with:
```ts
/** What the client sends to create/update a lawn (area is computed server-side). */
export interface LawnInput {
  name: string;
  address: string;
  placeId?: string | null;
  location: LawnPoint;
  polygon: LawnPoint[];
  /** Clipped building rings to subtract (auto-fill). Omit/[] for manual lawns. */
  buildings?: LawnPoint[][];
  source?: "manual" | "auto";
}

/** The projected, UI-facing shape of a lawn (decoupled from the Payload row). */
export interface LawnView {
  id: string;
  name: string;
  address: string;
  placeId: string | null;
  location: LawnPoint;
  polygon: LawnPoint[];
  buildings: LawnPoint[][];
  source: "manual" | "auto";
  areaM2: number;
}
```

- [ ] **Step 2: Add the collection fields (`src/collections/Lawns.ts`)**

Insert after the `areaM2` field and before the `tenant` field:
```ts
    // Clipped building rings subtracted from the parcel (auto-fill). Empty for manual.
    { name: "buildings", type: "json" },
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "manual",
      options: ["manual", "auto"],
    },
```

- [ ] **Step 3: Regenerate types**

Run: `npx payload generate:types`
Expected: `src/payload-types.ts` `Lawn` now has `buildings?` (json union) + `source` (`"manual" | "auto"`). Exit 0.

- [ ] **Step 4: Update the data layer (`src/lib/lawns.ts`)**

Add the import:
```ts
import { netArea } from "./boundary/geo-clip";
```
Update `project()` to include the new fields:
```ts
function project(doc: Lawn): LawnView {
  const loc = (doc.location ?? {}) as { lat?: number; lng?: number };
  return {
    id: String(doc.id),
    name: doc.name,
    address: doc.address,
    placeId: doc.placeId ?? null,
    location: { lat: loc.lat ?? 0, lng: loc.lng ?? 0 },
    polygon: (doc.polygon as unknown as LawnPoint[] | null) ?? [],
    buildings: (doc.buildings as unknown as LawnPoint[][] | null) ?? [],
    source: (doc.source as "manual" | "auto" | null) ?? "manual",
    areaM2: doc.areaM2,
  };
}
```
In `createLawn`, set `buildings`/`source` and compute net area:
```ts
  const doc = await payload.create({
    collection: "lawns",
    data: {
      owner: userId,
      name: input.name,
      address: input.address,
      placeId: input.placeId ?? undefined,
      location: input.location,
      polygon: input.polygon,
      buildings: input.buildings ?? [],
      source: input.source ?? "manual",
      areaM2: netArea(input.polygon, input.buildings ?? []),
    } as unknown as RequiredDataFromCollectionSlug<"lawns">,
  });
```
In `updateLawn`, when the polygon changes recompute net area and persist buildings:
```ts
  if (input.polygon !== undefined) {
    data.polygon = input.polygon;
    data.buildings = input.buildings ?? [];
    data.areaM2 = netArea(input.polygon, input.buildings ?? []);
  }
  if (input.source !== undefined) data.source = input.source;
```
(Keep the existing `name`/`address`/`placeId`/`location` handling above these lines.)

- [ ] **Step 5: Verify (type-check only — no DB yet)**

Run: `npm run check`
Expected: passes (3 known warnings). This confirms the data layer compiles against the regenerated `Lawn` type.

- [ ] **Step 6: Create the columns (dev-push — CONTROLLER ACTION, requires authorization)**

> **STOP — implementer subagent: do not run this.** The new `buildings`/`source` columns need a dev-push against the shared Neon DB. Report DONE_WITH_CONCERNS noting "lawns needs dev-push for buildings/source". The controller obtains authorization and runs:
```bash
npx tsx --env-file=.env scripts/seed.ts
```
Expected: boots Payload, dev-push adds the two columns, no error.

- [ ] **Step 7: Commit**

```bash
git add src/lib/lawn-types.ts src/collections/Lawns.ts src/lib/lawns.ts src/payload-types.ts
git commit -m "feat(lawns): buildings + source fields; areaM2 is net (parcel − buildings)"
```

---

### Task 7: Card snapshot building overlays

**Files:**
- Modify: `src/lib/maps.ts`, `src/components/lawns/LawnCard.tsx`, `scripts/check-lawns.ts`

- [ ] **Step 1: Update `buildStaticMapUrl` (`src/lib/maps.ts`)**

Replace the `StaticMapOpts` interface and `buildStaticMapUrl` function with an options-only signature that also draws red building overlays:
```ts
interface StaticMapOpts {
  width?: number;
  height?: number;
  buildings?: LawnPoint[][];
  key?: string;
}

/**
 * Static Maps URL: emerald parcel outline over hybrid imagery, plus optional red
 * building overlays (drawn on top). The map auto-fits the paths. Returns null with
 * no key or fewer than 3 parcel vertices. `key` is injectable for the sanity script.
 */
export function buildStaticMapUrl(
  polygon: LawnPoint[],
  opts: StaticMapOpts = {},
): string | null {
  const key = opts.key ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key || polygon.length < 3) return null;
  const { width = 600, height = 260, buildings = [] } = opts;
  const pts = polygon.map((p) => `${p.lat},${p.lng}`).join("|");
  const parcelPath = `fillcolor:0x10b98144|color:0x10b981ff|weight:2|${pts}`;
  const params = new URLSearchParams({
    size: `${width}x${height}`,
    scale: "2",
    maptype: LAWN_MAP_TYPE,
    key,
  });
  let url = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}&path=${encodeURIComponent(parcelPath)}`;
  for (const b of buildings) {
    if (b.length < 3) continue;
    const bp = `fillcolor:0xef444455|color:0xef4444ff|weight:1|${b.map((p) => `${p.lat},${p.lng}`).join("|")}`;
    url += `&path=${encodeURIComponent(bp)}`;
  }
  return url;
}
```

- [ ] **Step 2: Update the existing maps assertions in `scripts/check-lawns.ts`**

The signature changed (key/buildings now in opts). Replace the existing maps assertion block with:
```ts
const url = buildStaticMapUrl(square, { key: "FAKE_KEY" });
assert.ok(url && url.includes("staticmap"), "expected a static map url");
assert.ok(url!.includes("maptype=hybrid"), "expected hybrid map type");
assert.ok(url!.includes("key=FAKE_KEY"), "expected the key in the url");
assert.equal(buildStaticMapUrl(square, {}), null, "no key (env unset in tsx) → null");
assert.equal(
  buildStaticMapUrl([{ lat: 0, lng: 0 }], { key: "FAKE_KEY" }),
  null,
  "<3 points → null",
);
const withB = buildStaticMapUrl(square, { key: "FAKE_KEY", buildings: [square] });
assert.ok(withB!.includes("0xef4444ff"), "expected a red building path");
```
(The `square` constant already exists earlier in the file. Note `buildStaticMapUrl(square, {})` returns null only if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is unset in the tsx env — it is not passed via `--env-file` here, so this holds; if the implementer runs the script with the env file, change that assertion to pass an explicit empty key: `buildStaticMapUrl(square, { key: "" })`.)

- [ ] **Step 3: Pass buildings from the card (`src/components/lawns/LawnCard.tsx`)**

Change the snapshot call:
```tsx
  const snapshot = buildStaticMapUrl(lawn.polygon, {
    width: 480,
    height: 220,
    buildings: lawn.buildings,
  });
```

- [ ] **Step 4: Verify + commit**

Run: `npx tsx scripts/check-lawns.ts` (maps assertions pass, incl. the red building path).
Run: `npm run check`.
```bash
git add src/lib/maps.ts src/components/lawns/LawnCard.tsx scripts/check-lawns.ts
git commit -m "feat(lawns): card snapshot draws red building overlays"
```

---

### Task 8: Auto-fill server action

**Files:**
- Modify: `src/app/(app)/panel/ogrody/actions.ts`

- [ ] **Step 1: Add `autoFillLawnAction`**

Add these imports to `actions.ts`:
```ts
import { autoFillLawn } from "@/lib/boundary";
import type { AutoFillResult, AutoFillError } from "@/lib/boundary/types";
```
Add the action (the existing `createLawnAction`/`updateLawnAction` already forward the full `LawnInput`, which now carries `buildings`/`source`, so they need no change):
```ts
/** Read-only: resolve a parcel (minus buildings) for the given point. */
export async function autoFillLawnAction(
  lat: number,
  lng: number,
): Promise<AutoFillResult | AutoFillError> {
  const userId = await requireUserId();
  if (!userId) return { error: "failed" };
  try {
    return await autoFillLawn({ lat, lng });
  } catch {
    return { error: "failed" };
  }
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run check`.
```bash
git add src/app/\(app\)/panel/ogrody/actions.ts
git commit -m "feat(lawns): autoFillLawnAction (session-gated parcel resolver)"
```

---

### Task 9: Fill-pulse animation

**Files:**
- Create: `src/components/lawns/play-fill-pulse.ts`

- [ ] **Step 1: Create `src/components/lawns/play-fill-pulse.ts`**

```ts
/**
 * Play the "snap pulse" when a polygon lands: fade the fill in (0 → 0.3 over ~420ms,
 * easeOutCubic) while a one-shot outline overlay pulses brighter/wider then fades out
 * and is removed. Pure requestAnimationFrame; no deps.
 */
export function playFillPulse(
  polygon: google.maps.Polygon,
  maps: google.maps.MapsLibrary,
  map: google.maps.Map,
): void {
  const DURATION = 420;
  const start = performance.now();
  const paths = polygon
    .getPath()
    .getArray()
    .map((ll) => ({ lat: ll.lat(), lng: ll.lng() }));
  const pulse = new maps.Polygon({
    paths,
    strokeColor: "#34d399",
    strokeOpacity: 0.9,
    strokeWeight: 3,
    fillOpacity: 0,
    clickable: false,
    map,
  });
  function frame(now: number) {
    const t = Math.min(1, (now - start) / DURATION);
    const ease = 1 - Math.pow(1 - t, 3);
    polygon.setOptions({ fillOpacity: 0.3 * ease });
    pulse.setOptions({ strokeOpacity: 0.9 * (1 - t), strokeWeight: 3 + 6 * t });
    if (t < 1) requestAnimationFrame(frame);
    else pulse.setMap(null);
  }
  requestAnimationFrame(frame);
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run check` (uses global `google.maps` types).
```bash
git add src/components/lawns/play-fill-pulse.ts
git commit -m "feat(lawns): fill-pulse landing animation helper"
```

---

### Task 10: LawnDrawer — auto-fill, overlays, animation, net area

**Files:**
- Modify (REPLACE entirely): `src/components/lawns/LawnDrawer.tsx`

This is the integration task. Replace the whole file with the version below. Changes vs the current file: a `mapsLibRef` + `buildingPolysRef`; `source`/`autoFilling`/`parcelArea`/`buildingArea` state; `attachBuildings`; net `recomputeArea`; the manual `polygoncomplete` and edit-init now set source + play the pulse + load buildings; a `handleAutoFill`; `handleSave` sends `buildings`+`source`; the draw-phase "✨ Auto wypełnij" button; the ready-phase area breakdown.

- [ ] **Step 1: Write `src/components/lawns/LawnDrawer.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { loadMapsLibraries, hasMapsKey } from "@/lib/google-maps-loader";
import { LAWN_FILL, LAWN_STROKE, LAWN_MAP_TYPE } from "@/lib/maps";
import type { LawnInput, LawnPoint, LawnView } from "@/lib/lawn-types";
import { playFillPulse } from "./play-fill-pulse";
import { autoFillLawnAction } from "@/app/(app)/panel/ogrody/actions";

type Phase = "search" | "draw" | "ready";

interface Props {
  initial?: LawnView;
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
  const mapsLibRef = useRef<google.maps.MapsLibrary | null>(null);
  const managerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const buildingPolysRef = useRef<google.maps.Polygon[]>([]);
  const geometryRef = useRef<google.maps.GeometryLibrary | null>(null);
  const drawingLibRef = useRef<google.maps.DrawingLibrary | null>(null);

  const [phase, setPhase] = useState<Phase>(initial ? "ready" : "search");
  const [area, setArea] = useState<number>(initial?.areaM2 ?? 0);
  const [parcelArea, setParcelArea] = useState<number>(0);
  const [buildingArea, setBuildingArea] = useState<number>(0);
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [address, setAddress] = useState<string>(initial?.address ?? "");
  const [placeId, setPlaceId] = useState<string | null>(initial?.placeId ?? null);
  const [source, setSource] = useState<"manual" | "auto">(initial?.source ?? "manual");
  const [center, setCenter] = useState<LawnPoint>(
    initial?.location ?? { lat: 53.1235, lng: 18.0084 },
  );
  const [mapsError] = useState<string | null>(() =>
    hasMapsKey() ? null : "Mapa jest chwilowo niedostępna — brak konfiguracji.",
  );
  const [hasPolygon, setHasPolygon] = useState<boolean>(
    (initial?.polygon.length ?? 0) >= 3,
  );
  const [saving, setSaving] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);

  function recomputeArea() {
    const poly = polygonRef.current;
    const geometry = geometryRef.current;
    if (!poly || !geometry) return;
    const ringArea = geometry.spherical.computeArea(poly.getPath());
    let bArea = 0;
    for (const b of buildingPolysRef.current) {
      bArea += geometry.spherical.computeArea(b.getPath());
    }
    setParcelArea(Math.round(ringArea));
    setBuildingArea(Math.round(bArea));
    setArea(Math.max(0, Math.round(ringArea - bArea)));
  }

  function attachPolygon(poly: google.maps.Polygon) {
    polygonRef.current?.setMap(null);
    polygonRef.current = poly;
    setHasPolygon(true);
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

  function attachBuildings(rings: LawnPoint[][]) {
    buildingPolysRef.current.forEach((p) => p.setMap(null));
    buildingPolysRef.current = [];
    const maps = mapsLibRef.current;
    const map = mapRef.current;
    if (!maps || !map) return;
    for (const ring of rings) {
      if (ring.length < 3) continue;
      const poly = new maps.Polygon({
        paths: ring,
        strokeColor: "#ef4444",
        strokeWeight: 1.5,
        fillColor: "#ef4444",
        fillOpacity: 0.35,
        clickable: false,
        map,
      });
      buildingPolysRef.current.push(poly);
    }
  }

  function startDrawing() {
    const drawing = drawingLibRef.current;
    if (!drawing) return;
    setPhase("draw");
    managerRef.current?.setDrawingMode(drawing.OverlayType.POLYGON);
  }

  function redraw() {
    polygonRef.current?.setMap(null);
    polygonRef.current = null;
    attachBuildings([]);
    setSource("manual");
    setHasPolygon(false);
    setArea(0);
    setParcelArea(0);
    setBuildingArea(0);
    startDrawing();
  }

  async function handleAutoFill() {
    const map = mapRef.current;
    const maps = mapsLibRef.current;
    if (!map || !maps) return;
    const c = map.getCenter();
    if (!c) return;
    setAutoFilling(true);
    const res = await autoFillLawnAction(c.lat(), c.lng());
    if ("error" in res) {
      toast.error(
        res.error === "no-parcel"
          ? "Nie znaleźliśmy granic działki tutaj — narysuj ręcznie."
          : "Nie udało się pobrać granic. Spróbuj ponownie lub narysuj ręcznie.",
      );
      setAutoFilling(false);
      return;
    }
    managerRef.current?.setDrawingMode(null);
    polygonRef.current?.setMap(null);
    const parcel = new maps.Polygon({ paths: res.parcel });
    parcel.setMap(map);
    attachPolygon(parcel);
    attachBuildings(res.buildings);
    setSource("auto");
    setPhase("ready");
    const lats = res.parcel.map((p) => p.lat);
    const lngs = res.parcel.map((p) => p.lng);
    map.fitBounds({
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    });
    playFillPulse(parcel, maps, map);
    recomputeArea();
    setAutoFilling(false);
    if (!res.buildings.length) {
      toast.message("Nie wykryto budynku — liczymy całą działkę.");
    }
  }

  useEffect(() => {
    let cancelled = false;
    if (!hasMapsKey()) return;
    (async () => {
      try {
        const { maps, drawing, geometry, places } = await loadMapsLibraries();
        if (cancelled || !mapDivRef.current) return;
        geometryRef.current = geometry;
        drawingLibRef.current = drawing;
        mapsLibRef.current = maps;

        const map = new maps.Map(mapDivRef.current, {
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

        const manager = new drawing.DrawingManager({
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
        manager.addListener("polygoncomplete", (poly: google.maps.Polygon) => {
          manager.setDrawingMode(null);
          attachBuildings([]);
          attachPolygon(poly);
          setSource("manual");
          setPhase("ready");
          playFillPulse(poly, maps, map);
        });

        if (initial && initial.polygon.length >= 3) {
          const poly = new maps.Polygon({ paths: initial.polygon });
          poly.setMap(map);
          attachPolygon(poly);
          attachBuildings(initial.buildings);
          recomputeArea();
          const lats = initial.polygon.map((p) => p.lat);
          const lngs = initial.polygon.map((p) => p.lng);
          map.fitBounds({
            north: Math.max(...lats),
            south: Math.min(...lats),
            east: Math.max(...lngs),
            west: Math.min(...lngs),
          });
        }

        if (searchInputRef.current) {
          const ac = new places.Autocomplete(searchInputRef.current, {
            fields: ["geometry", "formatted_address", "place_id"],
            componentRestrictions: { country: "pl" },
          });
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
        if (!cancelled) toast.error("Nie udało się załadować mapy.");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSave = name.trim().length > 0 && area > 0 && hasPolygon;

  async function handleSave() {
    if (!polygonRef.current) return;
    setSaving(true);
    const input: LawnInput = {
      name: name.trim(),
      address,
      placeId,
      location: center,
      polygon: pathToPoints(polygonRef.current),
      buildings: buildingPolysRef.current.map(pathToPoints),
      source,
    };
    const res = await onSave(input);
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

      {phase === "search" && (
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/40">
          <p className="rounded-full bg-black/60 px-4 py-2 text-sm text-white">
            Zacznij od wpisania adresu
          </p>
        </div>
      )}

      {phase === "draw" && (
        <>
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs text-white">
            Klikaj rogi trawnika — albo użyj „Auto wypełnij”
          </div>
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={autoFilling}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {autoFilling ? "Szukam działki…" : "✨ Auto wypełnij działkę"}
            </button>
          </div>
        </>
      )}

      {phase === "ready" && (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl sm:left-auto sm:right-3 sm:w-80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Powierzchnia</span>
            <span className="text-xl font-bold text-emerald-700">
              ≈ {area.toLocaleString("pl-PL")} m²
            </span>
          </div>
          {buildingArea > 0 && (
            <p className="mt-1 text-[11px] text-neutral-500">
              działka {parcelArea.toLocaleString("pl-PL")} m² − dom{" "}
              {buildingArea.toLocaleString("pl-PL")} m²
            </p>
          )}
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

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: passes (3 known warnings). Watch for the same React-Compiler lint rules the 3a build hit (no reading refs in render — `canSave` correctly uses `hasPolygon`, not the ref). Importing the server action `autoFillLawnAction` into this client component is valid (Next serializes it). If `mapsLibRef`/`maps.MapsLibrary` types need adjustment, make the minimal correct fix and report.

- [ ] **Step 3: Commit**

```bash
git add src/components/lawns/LawnDrawer.tsx
git commit -m "feat(lawns): Auto wypełnij + building overlays + fill animation in LawnDrawer"
```

---

### Task 11: Mind updates

**Files:**
- Modify: `kryscar-mind/map/zones/customer-lawns.md`
- Create: `kryscar-mind/map/decisions/auto-fill-parcel-uldk-osm.md`

- [ ] **Step 1: Update the `customer-lawns` zone**

In `kryscar-mind/map/zones/customer-lawns.md`:
- Add to `owns.globs`: `"src/lib/boundary/**"`, `"src/components/lawns/play-fill-pulse.ts"`.
- Add to `owns.anchors`: `"symbol:autoFillLawn"`, `"symbol:playFillPulse"`.
- Add an invariant (as a `{rule, enforcedBy}` object — bare strings break the generator):
```yaml
  - rule: "Auto-fill is server-only: ULDK/OSM fetch + polygon-clipping run in src/lib/boundary/* behind a failover chain; the client calls autoFillLawnAction and computes only its display area via Google geometry. areaM2 is net (parcel − buildings), recomputed server-side."
    enforcedBy: []
```
- In the body, add an "Auto-fill" subsection: parcel (ULDK chain) − buildings (OSM chain, clipped), area = działka − dom, the fill-pulse animation, and the provider-chain failover seam. Re-stamp `verifiedAt:` to the current HEAD (`git rev-parse HEAD`) after the final commit.

- [ ] **Step 2: Write the decision record**

Create `kryscar-mind/map/decisions/auto-fill-parcel-uldk-osm.md` (follow the format of `kryscar-mind/map/decisions/google-maps-integration.md`): why ULDK (parcel) + OSM (buildings) + area subtraction ("Option B" — outline + overlay, not hole geometry); the failover provider chain with per-provider timeouts and the manual floor; net-area semantics (`areaM2` = parcel − clipped buildings); Poland-only degradation; the new `polygon-clipping` dependency; and that everything runs server-side.

- [ ] **Step 3: Regenerate + verify**

Run: `npm run check`
Expected: the Mind generator runs clean — no broken anchors (the new `symbol:autoFillLawn`/`symbol:playFillPulse` must resolve to the real exports), no `invariant "undefined"` gaps. 0 errors + 3 known warnings.

- [ ] **Step 4: Commit**

```bash
git add kryscar-mind/
git commit -m "docs(mind): customer-lawns auto-fill + decision record"
```

---

## Final verification (after all tasks)

- [ ] `npm run check` passes (3 known `<img>` warnings only).
- [ ] `npx tsx scripts/check-lawns.ts` passes (geo + maps + boundary geo + chain + uldk + osm).
- [ ] Runtime (controller, non-UI): a throwaway `scripts/verify-autofill.ts` that calls `autoFillLawn({ lat, lng })` for a real Bydgoszcz residential point → prints a parcel ring, a `buildingAreaM2 > 0` (or a "no building" note), and `areaM2 < parcelAreaM2`. Delete the script after. (This needs network → controller runs it.)
- [ ] Dispatch a final whole-feature code review, then use **superpowers:finishing-a-development-branch**.

---

## Self-review (author)

- **Spec coverage:** auto-fill flow (T8, T10), ULDK provider (T3), OSM provider (T4), clip + net area (T1), failover chain + timeouts (T2, T5), graceful floor (T5 + T10 toasts), data model `buildings`/`source` + net `areaM2` (T6), card overlays (T7), animation (T9, T10), provider-chain seam (T5 comments), testing (sanity script extensions + runtime), Mind (T11). All spec sections map to a task.
- **Type consistency:** `Ring`/`BBox`/`ParcelProvider`/`BuildingProvider`/`AutoFillResult`/`AutoFillError` defined once in `boundary/types.ts`; `LawnInput`/`LawnView` gain `buildings`/`source` consistently; `netArea(parcel, buildings)`, `clipBuildingsToParcel`, `bboxOf`, `autoFillLawn`, `autoFillLawnAction(lat,lng)`, `playFillPulse(polygon, maps, map)`, `buildStaticMapUrl(polygon, opts)` used with matching signatures across tasks.
- **Dev-push** flagged as controller-authorized (T6.6), matching the 3a pattern.
- **Client/server boundary:** `polygon-clipping` + `fetch` stay in `src/lib/boundary/*` (server); the client (`LawnDrawer`) imports only the action + types + `play-fill-pulse` + `@/lib/maps`. The browser's live area uses Google geometry (approximate); the server recomputes net area authoritatively on save.
- **External-API risk:** ULDK/OSM are free and Poland-focused; the failover chain + manual floor mean an outage degrades, never breaks. The axis-order guard in `parseWktPolygon` hedges a WKT lon/lat surprise.
