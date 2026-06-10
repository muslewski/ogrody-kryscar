/** Runnable sanity checks for the sign-in `?next=` sanitizer. Run: npx tsx scripts/check-safe-next.ts */
import assert from "node:assert/strict";

import { safeInternalPath } from "../src/lib/safe-internal-path";

// Internal paths pass through untouched (incl. query strings).
assert.equal(safeInternalPath("/panel", "/panel"), "/panel");
assert.equal(
  safeInternalPath("/panel/ogrody/nowy?from=card", "/panel"),
  "/panel/ogrody/nowy?from=card",
);

// Open-redirect shapes fall back.
assert.equal(safeInternalPath("https://evil.example", "/panel"), "/panel");
assert.equal(safeInternalPath("http://evil.example/panel", "/panel"), "/panel");
assert.equal(safeInternalPath("//evil.example", "/panel"), "/panel");
assert.equal(safeInternalPath("/\\evil.example", "/panel"), "/panel"); // browsers normalize "/\" → "//"
assert.equal(safeInternalPath("javascript:alert(1)", "/panel"), "/panel");

// Missing/empty falls back.
assert.equal(safeInternalPath(null, "/panel"), "/panel");
assert.equal(safeInternalPath(undefined, "/panel"), "/panel");
assert.equal(safeInternalPath("", "/panel"), "/panel");

console.log("safe-next OK — internal paths pass, external/protocol-relative fall back");
