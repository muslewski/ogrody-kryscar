---
description: Rebuild + validate the Mind index; report stale zones and verification gaps.
---

Run the Mind generator and report results.

1. Run `npm run mind` (or `node scripts/mind/generate.mjs`).
2. If it exits non-zero, surface each hard error (unresolved glob/anchor/flow step) and stop — these block `npm run check`.
3. If green, read `kryscar-mind/map/index.md` and report: the zone count, any rows marked `⚠ stale` (their `verifiedAt` is behind code changes — re-verify and re-stamp), and the "Verification gaps" section (invariants with no `enforcedBy` — consider filing tech-debt).
4. If `index.md` changed, remind to commit it.
