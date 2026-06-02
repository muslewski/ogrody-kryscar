---
type: zone
summary: "Local-SEO /ogrodnik/[miasto] pages and the Payload-migration-ready location data layer."
tags: [feature, seo, data]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[seo]]", "[[service-catalog]]", "[[coverage-map]]"]
sources: []
owns:
  routes: ["/ogrodnik/[miasto]"]
  anchors: ["symbol:getAllLocations", "symbol:getLocationBySlug", "symbol:getLocationSlugs", "symbol:Location", "symbol:LocationJsonLd"]
  globs: ["src/app/ogrodnik/**", "src/lib/locations.ts", "src/components/LocationJsonLd.tsx"]
depends: ["[[service-catalog]]", "[[coverage-map]]", "[[layout-chrome]]"]
invariants:
  - rule: "Components consume locations only via async accessors — no component imports the LOCATIONS array (Payload-migration boundary)"
    enforcedBy: []
verifiedAt: "74d28486554072404071920bafd9c109390994e7"
---
## Purpose
Per-city landing pages; data flows through async accessors so a PayloadCMS swap touches only `locations.ts`.
## Anchors
`getAllLocations`, `getLocationBySlug`, `Location`, `LocationJsonLd`, `route:/ogrodnik/[miasto]`.
## Lineage
sources → [[local-seo-city-pages-design]].
