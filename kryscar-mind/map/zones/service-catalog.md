---
type: zone
summary: "Service definitions, categories, catalog enrichment, and the single-select filter + motion reorder island."
tags: [feature, data]
status: active
created: 2026-06-02
updated: 2026-06-04
related: ["[[brand-data]]", "[[city-landing-pages]]", "[[service-pages]]", "[[payload-backend]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:ServiceCatalog", "symbol:getCatalogServices", "symbol:SERVICES", "symbol:CATEGORIES"]
  globs: ["src/components/service-catalog.tsx", "src/lib/catalog.ts", "src/lib/data.ts", "src/lib/services-seed-data.ts"]
depends: ["[[brand-data]]"]
invariants:
  - rule: "the live catalog + city pages read the Payload services collection via getCatalogServices (async); SERVICES/SERVICE_BADGES stay static for the design-variant pages + as seed source"
    enforcedBy: []
verifiedAt: "0edd4d16cb23146fd271d9276b0bc776d44adb10"
---
## Purpose
Catalog data + the client island that filters/reorders cards. Each catalog card links to its own `/uslugi/[slug]` service landing page — the whole card is a `next/link`, with "Zamów →" demoted to a `<span>`. The catalog data is now Payload-sourced: `getCatalogServices` (async) reads the `services` collection; server components await it. The static `SERVICES`/`SERVICE_BADGES`/`CATEGORIES` arrays remain in `data.ts` for the design-variant pages and as the seed source.
## Anchors
`ServiceCatalog`, `getCatalogServices`, `SERVICES`, `CATEGORIES`.
## Lineage
sources → [[catalog-category-filter-animation-design]]; Payload migration → [[services-as-payload-collection]].
