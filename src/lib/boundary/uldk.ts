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
