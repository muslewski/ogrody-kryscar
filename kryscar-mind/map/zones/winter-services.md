---
type: zone
summary: "Winter-services arc: /zima hub + /zima/[usluga] pages, the Payload-ready winter data layer, and the seasonal engine."
tags: [feature, seo, data, seasonal]
status: active
created: 2026-06-02
updated: 2026-06-03
related: ["[[city-landing-pages]]", "[[seo]]", "[[homepage-and-variants]]", "[[coverage-map]]", "[[service-pages]]"]
sources: ["[[2026-06-02-winter-services-design]]"]
owns:
  routes: ["/zima", "/zima/[usluga]"]
  anchors: ["symbol:getWinterServices", "symbol:getWinterServiceBySlug", "symbol:getWinterServiceSlugs", "symbol:WinterService", "symbol:isWinterActive", "symbol:isWinterNow", "symbol:ServiceJsonLd", "symbol:WinterServiceCard"]
  globs: ["src/app/zima/**", "src/lib/winter.ts", "src/lib/season.ts", "src/components/ServiceJsonLd.tsx", "src/components/WinterServiceCard.tsx"]
depends: ["[[service-catalog]]", "[[coverage-map]]", "[[layout-chrome]]", "[[city-landing-pages]]"]
invariants:
  - rule: "Components consume winter services only via async accessors — no component imports the WINTER_SERVICES array (Payload-migration boundary)"
    enforcedBy: []
  - rule: "Pages that branch on the season set revalidate=86400 so the winter toggle flips without a redeploy"
    enforcedBy: []
verifiedAt: "fa9a5e3cac79d83545f7d25ff3a3a8c4bd16f5e2"
---
## Purpose
The winter revenue arc — three landing pages + a hub, a Payload-ready data layer, and a pure seasonal engine that escalates the homepage Nov–Mar.
## Anchors
`getWinterServices`, `getWinterServiceBySlug`, `WinterService`, `isWinterActive`, `ServiceJsonLd`, `WinterServiceCard`, `route:/zima`, `route:/zima/[usluga]`.
## Invariants
Accessor-only data boundary (mirrors city pages); seasonal pages use daily ISR. `ServiceJsonLd` was generalized to `{name, description, url, breadcrumbs}` props so it can be shared with [[service-pages]] — the `/zima/[usluga]` call site behavior is unchanged.
## Lineage
sources → [[2026-06-02-winter-services-design]].
