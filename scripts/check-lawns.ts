/**
 * Runnable sanity checks for the pure lawn utils (no unit-test runner in repo).
 * Run: npx tsx scripts/check-lawns.ts
 */
import assert from "node:assert/strict";

import { computePolygonArea } from "../src/lib/geo";
import { buildStaticMapUrl } from "../src/lib/maps";
import { parseWktPolygon } from "../src/lib/boundary/wkt";
import { netArea, clipBuildingsToParcel } from "../src/lib/boundary/geo-clip";
import { runChain } from "../src/lib/boundary/chain";
import { buildUldkUrl, parseUldkResponse } from "../src/lib/boundary/uldk";
import { buildOverpassQuery, parseOverpassJson } from "../src/lib/boundary/osm-buildings";

// A ~1 km square at the equator (0.0089832° ≈ 1000 m of both lat and lng there)
// must measure ≈ 1,000,000 m² within 2 %.
const side = 0.0089832;
const square = [
  { lat: 0, lng: 0 },
  { lat: side, lng: 0 },
  { lat: side, lng: side },
  { lat: 0, lng: side },
];
const area = computePolygonArea(square);
assert.ok(
  Math.abs(area - 1_000_000) < 20_000,
  `expected ~1,000,000 m², got ${area}`,
);

// Degenerate polygons are zero.
assert.equal(computePolygonArea([{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }]), 0);

console.log(`geo OK — 1km² square measured ${area} m²`);

const url = buildStaticMapUrl(square, {}, "FAKE_KEY");
assert.ok(url && url.includes("staticmap"), "expected a static map url");
assert.ok(url!.includes("maptype=hybrid"), "expected hybrid map type");
assert.ok(url!.includes("key=FAKE_KEY"), "expected the key in the url");
assert.equal(buildStaticMapUrl(square, {}, undefined), null, "no key → null");
assert.equal(
  buildStaticMapUrl([{ lat: 0, lng: 0 }], {}, "FAKE_KEY"),
  null,
  "<3 points → null",
);

console.log("maps OK — static url builder");

// WKT parse (lon/lat order, Polish coords)
const wktRing = parseWktPolygon(
  "POLYGON((18.000 53.100, 18.001 53.100, 18.001 53.101, 18.000 53.101, 18.000 53.100))",
);
assert.ok(wktRing && wktRing.length >= 4, "expected a parsed WKT ring");
assert.ok(
  Math.abs(wktRing![0].lat - 53.1) < 1e-6 && Math.abs(wktRing![0].lng - 18.0) < 1e-6,
  "expected lat/lng order from WKT",
);

// netArea: a parcel with an interior building subtracts the building area.
const parcel = [
  { lat: 0, lng: 0 },
  { lat: 0.0089832, lng: 0 },
  { lat: 0.0089832, lng: 0.0089832 },
  { lat: 0, lng: 0.0089832 },
]; // ~1,000,000 m²
const building = [
  { lat: 0.002, lng: 0.002 },
  { lat: 0.004, lng: 0.002 },
  { lat: 0.004, lng: 0.004 },
  { lat: 0.002, lng: 0.004 },
]; // interior ~ (0.002 deg)^2 ≈ 49,600 m²
const net = netArea(parcel, [building]);
assert.ok(net < 1_000_000 && net > 900_000, `expected net < parcel, got ${net}`);
assert.equal(netArea(parcel, []), 1000010, "no buildings → parcel area");

// clip: a building straddling the parcel edge only subtracts the inside part.
const halfOut = [
  { lat: 0.001, lng: -0.001 },
  { lat: 0.001, lng: 0.001 },
  { lat: 0.003, lng: 0.001 },
  { lat: 0.003, lng: -0.001 },
];
const clipped = clipBuildingsToParcel(parcel, [halfOut]);
assert.ok(clipped.length === 1 && clipped[0].length >= 4, "expected one clipped ring");

console.log("boundary geo OK — wkt + netArea + clip");

// chain failover: throwing/empty providers are skipped; the good one wins.
const chainProviders = [{ name: "throws" }, { name: "empty" }, { name: "good" }];
const chainRes = await runChain(
  chainProviders,
  async (p) => {
    if (p.name === "throws") throw new Error("boom");
    if (p.name === "empty") return [] as number[];
    return [1, 2, 3];
  },
  (v) => v.length > 0,
  1000,
);
assert.ok(chainRes && chainRes.provider === "good", "expected failover to 'good'");
assert.equal(
  await runChain([{ name: "x" }], async () => null, (v) => v !== null, 1000),
  null,
  "all-fail → null",
);

console.log("boundary chain OK — failover");

const uldkUrl = buildUldkUrl({ lat: 53.123, lng: 18.008 });
assert.ok(uldkUrl.includes("xy=18.008%2C53.123%2C4326"), "expected lng,lat,4326 xy");
assert.ok(
  uldkUrl.includes("result=geom_wkt") && uldkUrl.includes("srid=4326"),
  "expected wkt+srid",
);

const okRes = parseUldkResponse(
  "0\nPOLYGON((18.000 53.100, 18.001 53.100, 18.001 53.101, 18.000 53.101, 18.000 53.100))",
);
assert.ok(okRes && okRes.length >= 4, "expected parcel ring from status-0 response");
assert.equal(parseUldkResponse("-1\n"), null, "non-zero status → null");
assert.equal(parseUldkResponse(""), null, "empty → null");

console.log("boundary uldk OK — url + parse");

const oq = buildOverpassQuery({ south: 53.1, west: 18.0, north: 53.2, east: 18.1 });
assert.ok(oq.includes('way["building"](53.1,18,53.2,18.1)'), "expected building bbox query");
const oRings = parseOverpassJson({
  elements: [
    {
      type: "way",
      geometry: [
        { lat: 53.1, lon: 18.0 },
        { lat: 53.1, lon: 18.001 },
        { lat: 53.101, lon: 18.001 },
        { lat: 53.1, lon: 18.0 },
      ],
    },
    { type: "node", geometry: undefined },
  ],
});
assert.ok(oRings.length === 1 && oRings[0].length === 4, "expected one building ring");

console.log("boundary osm OK — query + parse");
