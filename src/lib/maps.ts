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
