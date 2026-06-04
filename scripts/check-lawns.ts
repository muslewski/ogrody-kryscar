/**
 * Runnable sanity checks for the pure lawn utils (no unit-test runner in repo).
 * Run: npx tsx scripts/check-lawns.ts
 */
import assert from "node:assert/strict";

import { computePolygonArea } from "../src/lib/geo";

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
