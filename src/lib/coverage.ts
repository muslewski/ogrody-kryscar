/**
 * Service-area data for Ogrody Kryscar.
 *
 * Base: Bydgoszcz. Service radius ~80 km centered on Bydgoszcz, covering
 * most of województwo kujawsko-pomorskie plus a slice of pomorskie /
 * wielkopolskie. Distances are road-distance approximations rounded to
 * the nearest 5 km.
 *
 * Coordinates are normalized 0–100 within a bounding box that fits the
 * voivodeship — used by `components/PolandMap.tsx` to plot pins on the
 * shared SVG outline without needing a tiles API.
 */

export interface CoverageCity {
  name: string;
  /** Road distance from Bydgoszcz in km. */
  km: number;
  /**
   * Compass bearing from Bydgoszcz in degrees (0 = north, 90 = east,
   * 180 = south, 270 = west). Approximated to real geography.
   * (Kept for the older radial map; new geo maps use lat/lng.)
   */
  angle: number;
  /** Real geographic latitude (WGS84). */
  lat: number;
  /** Real geographic longitude (WGS84). */
  lng: number;
  /** Postal-code prefix — used by the catalog example's lookup. */
  zip: string;
  /** Tag for the catalog example's filtering. */
  region: "centrum" | "polnoc" | "poludnie" | "wschod" | "zachod";
  /** Whether we have stała opieka clients here right now. */
  active?: boolean;
}

export const HEADQUARTERS: CoverageCity = {
  name: "Bydgoszcz",
  km: 0,
  angle: 0,
  lat: 53.1235,
  lng: 18.0084,
  zip: "85-001",
  region: "centrum",
  active: true,
};

export const COVERAGE_CITIES: CoverageCity[] = [
  HEADQUARTERS,
  { name: "Toruń",              km: 45, angle: 100, lat: 53.0138, lng: 18.6086, zip: "87-100", region: "wschod",   active: true },
  { name: "Inowrocław",         km: 40, angle: 155, lat: 52.7989, lng: 18.2592, zip: "88-100", region: "poludnie", active: true },
  { name: "Solec Kujawski",     km: 18, angle: 110, lat: 53.0857, lng: 18.2336, zip: "86-050", region: "centrum",  active: true },
  { name: "Nakło nad Notecią",  km: 30, angle: 260, lat: 53.1416, lng: 17.5961, zip: "89-100", region: "zachod",   active: true },
  { name: "Świecie",            km: 55, angle:  25, lat: 53.4099, lng: 18.4400, zip: "86-100", region: "polnoc",   active: true },
  { name: "Tuchola",            km: 65, angle: 310, lat: 53.5882, lng: 17.8638, zip: "89-500", region: "polnoc" },
  { name: "Chełmno",            km: 60, angle:  45, lat: 53.3505, lng: 18.4252, zip: "86-200", region: "polnoc" },
  { name: "Grudziądz",          km: 80, angle:  30, lat: 53.4843, lng: 18.7536, zip: "86-300", region: "polnoc" },
  { name: "Włocławek",          km: 90, angle: 135, lat: 52.6481, lng: 19.0678, zip: "87-800", region: "poludnie" },
  { name: "Żnin",               km: 50, angle: 210, lat: 52.8474, lng: 17.7140, zip: "88-400", region: "poludnie" },
  { name: "Sępólno Krajeńskie", km: 50, angle: 295, lat: 53.4453, lng: 17.5331, zip: "89-400", region: "zachod" },
];

/** Maximum service radius shown on the radial map (km). */
export const MAX_RADIUS_KM = 100;

/** Default map view — centered just east of Bydgoszcz so HQ sits slightly left of center. */
export const MAP_CENTER = { lat: 53.18, lng: 18.2 };
export const MAP_ZOOM = 8;

export const COVERAGE_HEADLINE =
  "Bydgoszcz, Toruń i całe województwo Kujawsko-Pomorskie.";

export const COVERAGE_INTRO =
  "Pracujemy z bazy w Bydgoszczy. Dojeżdżamy do klientów w promieniu około 80 km — głównie Bydgoszcz, Toruń, Inowrocław, Solec Kujawski, Nakło nad Notecią, Świecie i Tuchola. Dla większych zleceń wyjeżdżamy też dalej.";

export const COVERAGE_NOTE =
  "Nie jesteście na liście? Zadzwońcie — w sezonie często jeździmy do klientów spoza najbliższego promienia.";
