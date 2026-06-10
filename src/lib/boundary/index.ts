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
 * True when the point is plausibly inside Poland — the only area ULDK covers.
 * The abuse gate for autoFillLawnAction: junk/foreign coords are rejected
 * before any provider fetch. Same magnitude box wkt.ts uses for axis-order
 * detection (lat 49–55, lng 14–25) — keep them in sync.
 */
export function isLikelyInPoland(point: LawnPoint): boolean {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= 49 &&
    point.lat <= 55 &&
    point.lng >= 14 &&
    point.lng <= 25
  );
}

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
