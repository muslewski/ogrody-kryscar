/** Runnable sanity checks for visit scheduling logic. Run: npx tsx scripts/check-visits.ts */
import assert from "node:assert/strict";

import { suggestNextVisitDate, canTransitionRequest } from "../src/lib/visits";

// +7 for weekly, from a fixed anchor (no Date.now — deterministic).
const anchor = new Date("2026-06-10T09:00:00.000Z");
assert.equal(
  suggestNextVisitDate(anchor, "co_tydzien").slice(0, 10),
  "2026-06-17",
  "co_tydzien → +7d",
);
assert.equal(
  suggestNextVisitDate(anchor, "co_2_tyg").slice(0, 10),
  "2026-06-24",
  "co_2_tyg → +14d",
);
assert.equal(
  suggestNextVisitDate(anchor, "raz_w_miesiacu").slice(0, 10),
  "2026-07-10",
  "raz_w_miesiacu → +30d",
);
assert.equal(
  suggestNextVisitDate(anchor, null).slice(0, 10),
  "2026-06-17",
  "unknown freq → +7d default",
);

// Transition guard.
assert.ok(canTransitionRequest("new", "accepted"), "new→accepted allowed");
assert.ok(canTransitionRequest("new", "declined"), "new→declined allowed");
assert.ok(canTransitionRequest("accepted", "done"), "accepted→done allowed");
assert.ok(!canTransitionRequest("done", "accepted"), "done→accepted rejected");
assert.ok(!canTransitionRequest("declined", "accepted"), "declined→accepted rejected");
assert.ok(!canTransitionRequest("new", "done"), "new→done (skipping accept) rejected");

console.log("visits OK — suggestNextVisitDate + transition guard");
