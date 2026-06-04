import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

/**
 * Google Maps JS loader (js-api-loader v2 functional API): setOptions() once,
 * then importLibrary() per library. Client-only — reads the public key directly
 * (env.ts is server-runtime only). Polish locale. Returns the typed library
 * objects so callers use library classes (maps.Map, drawing.DrawingManager,
 * geometry.spherical, places.Autocomplete) rather than the global namespace.
 */
export interface MapsLibraries {
  maps: google.maps.MapsLibrary;
  drawing: google.maps.DrawingLibrary;
  geometry: google.maps.GeometryLibrary;
  places: google.maps.PlacesLibrary;
}

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  setOptions({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    v: "weekly",
    language: "pl",
    region: "PL",
  });
  configured = true;
}

export function hasMapsKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
}

export async function loadMapsLibraries(): Promise<MapsLibraries> {
  ensureConfigured();
  const [maps, drawing, geometry, places] = await Promise.all([
    importLibrary("maps"),
    importLibrary("drawing"),
    importLibrary("geometry"),
    importLibrary("places"),
  ]);
  return { maps, drawing, geometry, places };
}
