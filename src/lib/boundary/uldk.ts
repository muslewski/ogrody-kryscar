import type { LawnPoint } from "../lawn-types";
import type { ParcelProvider } from "./types";
import { parseWktPolygon } from "./wkt";
import { from2180 } from "./crs";

const ULDK_BASE = "https://uldk.gugik.gov.pl/";

// First "(( … )" group = the outer ring of the first polygon (holes ignored).
const RING_RE = /\(\(\s*([^()]+?)\s*\)/;

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
 * the (E)WKT geometry, prefixed `SRID=N;`. ULDK does NOT reliably honour our
 * requested output SRID — some powiats return native EPSG:2180 — so we read the
 * prefix and project 2180 to WGS84 ourselves. Returns the parcel ring, or null on
 * any non-zero status / unknown CRS / miss.
 */
export function parseUldkResponse(text: string): LawnPoint[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const nl = trimmed.indexOf("\n");
  const status = (nl === -1 ? trimmed : trimmed.slice(0, nl)).trim();
  if (status !== "0") return null;
  const body = nl === -1 ? "" : trimmed.slice(nl + 1).trim();
  if (!body) return null;

  const sridMatch = body.match(/SRID=(\d+);/i);
  const srid = sridMatch ? Number(sridMatch[1]) : 4326;

  // 4326: coords are "lng lat" — parseWktPolygon handles them (axis-order guarded).
  if (srid === 4326) return parseWktPolygon(body);

  // 2180: coords are "easting northing" — project each pair to WGS84.
  if (srid === 2180) {
    const m = body.match(RING_RE);
    if (!m) return null;
    const ring: LawnPoint[] = [];
    for (const pair of m[1].split(",")) {
      const nums = pair.trim().split(/\s+/).map(Number);
      if (nums.length < 2 || nums.some((n) => Number.isNaN(n))) continue;
      ring.push(from2180(nums[0], nums[1]));
    }
    return ring.length >= 3 ? ring : null;
  }

  return null; // unknown CRS → no-parcel (graceful manual fallback)
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
