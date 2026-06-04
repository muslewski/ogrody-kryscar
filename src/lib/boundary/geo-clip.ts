// polygon-clipping@0.15 ships a CJS build whose .d.ts declares NAMED exports
// only (no default). A namespace import satisfies the .d.ts at compile time. Where
// the functions actually live at runtime depends on the loader's ESM↔CJS interop:
// directly on the namespace (Node CJS — `module.exports` IS the functions object),
// or nested under `.default` (some ESM-interop loaders). We type against the
// namespace and resolve whichever shape actually carries the impl, so both work.
import * as polygonClippingNS from "polygon-clipping";

import { computePolygonArea } from "../geo";
import type { BBox, Ring } from "./types";

const polygonClipping: typeof polygonClippingNS =
  typeof (polygonClippingNS as { intersection?: unknown }).intersection ===
  "function"
    ? polygonClippingNS
    : ((polygonClippingNS as { default?: typeof polygonClippingNS }).default ??
      polygonClippingNS);

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
      if (outer && outer.length >= 4) out.push(xyToRing(outer));
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
