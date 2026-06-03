---
type: zone
summary: "The root homepage (re-exports example-9) plus the ten design-variant pages."
tags: [ui]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[service-catalog]]", "[[layout-chrome]]", "[[winter-services]]", "[[ogrodowe-abc]]", "[[realizacje]]"]
sources: []
owns:
  routes: ["/", "/example-9"]
  anchors: []
  globs: ["src/app/(public)/page.tsx", "src/app/(public)/example-*/**"]
depends: ["[[service-catalog]]", "[[layout-chrome]]", "[[motion-and-3d]]"]
invariants: []
verifiedAt: "9cba57ddb7618ae0dc52283a1783b7e9656d7841"
---
## Purpose
The marketing homepage and its design explorations. `/` re-exports `example-9`, which now renders the shared `SiteHeader` ([[layout-chrome]]) instead of its old inline header/banner, and uses daily ISR so the seasonal banner flips. `example-9` also carries a **Realizacje** teaser (3 latest projects) after the service catalog, linking to the [[realizacje]] gallery. See [[nav-unification]].
## Anchors
`route:/`, `route:/example-9`, `src/app/(public)/example-*/**`.
## Lineage
The example-N variants predate the Mind.
