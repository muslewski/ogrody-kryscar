---
type: zone
summary: "Service definitions, categories, catalog enrichment, and the single-select filter + motion reorder island."
tags: [feature, data]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[brand-data]]", "[[city-landing-pages]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:ServiceCatalog", "symbol:getCatalogServices", "symbol:SERVICES", "symbol:CATEGORIES"]
  globs: ["src/components/service-catalog.tsx", "src/lib/catalog.ts", "src/lib/data.ts"]
depends: ["[[brand-data]]"]
invariants:
  - rule: "SERVICES drives both the homepage catalog and the city pages"
    enforcedBy: []
verifiedAt: "74d28486554072404071920bafd9c109390994e7"
---
## Purpose
Catalog data + the client island that filters/reorders cards.
## Anchors
`ServiceCatalog`, `getCatalogServices`, `SERVICES`, `CATEGORIES`.
## Lineage
sources → [[catalog-category-filter-animation-design]].
