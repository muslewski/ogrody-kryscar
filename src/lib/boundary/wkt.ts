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
