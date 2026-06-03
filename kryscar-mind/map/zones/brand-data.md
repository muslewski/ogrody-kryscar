---
type: zone
summary: "Company identity, address/NIP, socials, legal links, image map, and the canonical SITE_URL."
tags: [data]
status: active
created: 2026-06-02
updated: 2026-06-03
related: ["[[service-catalog]]", "[[seo]]", "[[layout-chrome]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:COMPANY", "symbol:ADDRESS", "symbol:SOCIALS", "symbol:IMG", "symbol:SITE_URL"]
  globs: ["src/lib/data.ts"]
depends: []
invariants: []
verifiedAt: "94b557442a444376e7f587b5c0afc0ea02d43a6e"
---
## Purpose
Single home for brand constants used site-wide.
## Anchors
`COMPANY`, `ADDRESS`, `SOCIALS`, `IMG`, `SITE_URL`.
## Winter imagery keys
`IMG` now includes three winter image keys under `public/img/winter`: `snowDrive` (driveway snow clearing), `gardenLights` (Christmas/garden lights), and `wrappedPlants` (plants with winter fleece/burlap). Files are fetched post-merge via `fetch-stock.sh`; until then the keys resolve to paths not yet in the blur map (graceful fallback in [[winter-services]]).
