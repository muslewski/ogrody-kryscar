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
