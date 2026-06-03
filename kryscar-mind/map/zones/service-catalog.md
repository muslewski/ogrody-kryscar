---
type: zone
summary: "Service definitions, categories, catalog enrichment, and the single-select filter + motion reorder island."
tags: [feature, data]
status: active
created: 2026-06-02
updated: 2026-06-03
related: ["[[brand-data]]", "[[city-landing-pages]]", "[[service-pages]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:ServiceCatalog", "symbol:getCatalogServices", "symbol:SERVICES", "symbol:CATEGORIES"]
  globs: ["src/components/service-catalog.tsx", "src/lib/catalog.ts", "src/lib/data.ts"]
depends: ["[[brand-data]]"]
invariants:
  - rule: "SERVICES drives both the homepage catalog and the city pages"
    enforcedBy: []
verifiedAt: "fa9a5e3cac79d83545f7d25ff3a3a8c4bd16f5e2"
---
## Purpose
Catalog data + the client island that filters/reorders cards. Each catalog card now links to its own `/uslugi/[slug]` service landing page — the whole card is a `next/link`, with "Zamów →" demoted to a `<span>`.
## Anchors
`ServiceCatalog`, `getCatalogServices`, `SERVICES`, `CATEGORIES`.
## Lineage
sources → [[catalog-category-filter-animation-design]].
