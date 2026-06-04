import type { LawnPoint } from "./lawn-types";

/** Brand colours for map polygons (emerald-500), shared by drawer + snapshot. */
export const LAWN_STROKE = "#10b981";
export const LAWN_FILL = "#10b981";

/** Google Maps map type for the drawer + snapshots — real grass/terrain. */
export const LAWN_MAP_TYPE = "hybrid";

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
