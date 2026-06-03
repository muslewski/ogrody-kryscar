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
  globs: ["src/app/page.tsx", "src/app/example-*/**"]
depends: ["[[service-catalog]]", "[[layout-chrome]]", "[[motion-and-3d]]"]
invariants: []
verifiedAt: "a6399f700bbc9492eb3130fdefd18b87bad23bb6"
---
## Purpose
The marketing homepage and its design explorations. `/` re-exports `example-9`, which now renders the shared `SiteHeader` ([[layout-chrome]]) instead of its old inline header/banner, and uses daily ISR so the seasonal banner flips. `example-9` also carries a **Realizacje** teaser (3 latest projects) after the service catalog, linking to the [[realizacje]] gallery. See [[nav-unification]].
## Anchors
`route:/`, `route:/example-9`, `src/app/example-*/**`.
## Lineage
The example-N variants predate the Mind.
