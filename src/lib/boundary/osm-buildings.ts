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
