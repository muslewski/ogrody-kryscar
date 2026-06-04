/** Runnable sanity checks for the pricing engine. Run: npx tsx scripts/check-pricing.ts */
import assert from "node:assert/strict";

import { estimate, type PricedService } from "../src/lib/pricing";

const SERVICES: PricedService[] = [
  { slug: "koszenie", title: "Koszenie", pricing: { kind: "area", basePrice: 180, pricePerM2: 0.35, recurring: true } },
  { slug: "ciecie", title: "Cięcie", pricing: { kind: "perUnit", basePrice: 250, pricePerUnit: 18, unitLabel: "mb", recurring: false } },
  { slug: "aranzacja", title: "Aranżacja", pricing: { kind: "custom", recurring: false } },
];

// area: koszenie @ 420 m² jednorazowo → 180 + 0.35*420 = 327 → ±15% = 278..376
const a = estimate(SERVICES, [{ serviceSlug: "koszenie", frequency: "jednorazowo" }], 420);
assert.equal(a.lines[0].min, 278, `min ${a.lines[0].min}`);
assert.equal(a.lines[0].max, 376, `max ${a.lines[0].max}`);

// recurring multiplier applies: co_2_tyg (0.92) → 327*0.92=300.84 → 256..346
const b = estimate(SERVICES, [{ serviceSlug: "koszenie", frequency: "co_2_tyg" }], 420);
assert.equal(b.lines[0].min, 256, `min ${b.lines[0].min}`);
assert.equal(b.lines[0].max, 346, `max ${b.lines[0].max}`);

// perUnit: ciecie qty 25 → 250 + 18*25 = 700 → 595..805
const c = estimate(SERVICES, [{ serviceSlug: "ciecie", quantity: 25 }], 0);
assert.equal(c.lines[0].min, 595, `min ${c.lines[0].min}`);
assert.equal(c.lines[0].max, 805, `max ${c.lines[0].max}`);

// custom excluded from totals; hasCustom true
const d = estimate(SERVICES, [{ serviceSlug: "koszenie", frequency: "jednorazowo" }, { serviceSlug: "aranzacja" }], 420);
assert.equal(d.hasCustom, true, "hasCustom");
assert.equal(d.min, 278, `total min ${d.min}`); // only koszenie counts
assert.equal(d.lines[1].custom, true, "aranzacja custom");

// unknown service → custom (not NaN)
const e = estimate(SERVICES, [{ serviceSlug: "nieznana" }], 420);
assert.equal(e.lines[0].custom, true, "unknown → custom");
assert.equal(e.min, 0, "unknown contributes 0");

console.log("pricing OK — area + recurring + perUnit + custom + unknown");
