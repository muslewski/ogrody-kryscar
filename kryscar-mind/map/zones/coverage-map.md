---
type: zone
summary: "Service-area geography and the static coverage map (Mapbox/OSM)."
tags: [feature, data]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:CoverageMap", "symbol:COVERAGE_CITIES", "symbol:HEADQUARTERS"]
  globs: ["src/components/CoverageMap.tsx", "src/components/PolandMap.tsx", "src/lib/coverage.ts"]
depends: []
invariants: []
verifiedAt: "74d28486554072404071920bafd9c109390994e7"
---
## Purpose
Renders the coverage area; supports an optional `focus`/`center` pin for city pages.
## Anchors
`CoverageMap`, `COVERAGE_CITIES`.
