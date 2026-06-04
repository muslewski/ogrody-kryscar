import proj4 from "proj4";

import type { LawnPoint } from "../lawn-types";

// EPSG:2180 (PUWG 1992) — the native CRS many Polish county EGiB services return.
// ULDK sometimes passes that geometry through verbatim despite an srid=4326
// request (the per-powiat services don't all honour the output SRID), so we must
// be able to project it to WGS84 ourselves.
proj4.defs(
  "EPSG:2180",
  "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 " +
    "+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
);

/** Convert an EPSG:2180 (easting, northing) pair to WGS84 lat/lng. */
export function from2180(easting: number, northing: number): LawnPoint {
  const [lng, lat] = proj4("EPSG:2180", "WGS84", [easting, northing]);
  return { lat, lng };
}
