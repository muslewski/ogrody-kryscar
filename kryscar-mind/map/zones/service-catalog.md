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
verifiedAt: "3c19f5f930f1abc0d84c63b2c4b0ef9b140ad7e0"
---
## Purpose
Catalog data + the client island that filters/reorders cards. Each catalog card links to its own `/uslugi/[slug]` service landing page — the whole card is a `next/link`, with "Zamów →" demoted to a `<span>`. The catalog data is now Payload-sourced: `getCatalogServices` (async) reads the `services` collection; server components await it. The static `SERVICES`/`SERVICE_BADGES`/`CATEGORIES` arrays remain in `data.ts` for the design-variant pages and as the seed source.
## Pricing (3b.1)
Pricing now lives **on the `services` collection** as a structured `pricing` group (kind
area/perUnit/fixed/custom + base/perM2/perUnit/unitLabel + recurring) — the single source of
truth — read by the pure data-driven `src/lib/pricing.ts` `estimate`. The customer
configurator + server recompute (owned by [[service-requests]]) consume it via
`getConfiguratorServices`. The marketing `calculator.ts` still carries its own constants; its
migration onto `lib/pricing` is a noted follow-up. See [[services-pricing-metadata]].
## Anchors
`ServiceCatalog`, `getCatalogServices`, `SERVICES`, `CATEGORIES`.
## Lineage
sources → [[catalog-category-filter-animation-design]]; Payload migration → [[services-as-payload-collection]]; pricing metadata → [[services-pricing-metadata]].
