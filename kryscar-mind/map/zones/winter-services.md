---
type: zone
summary: "Winter-services arc: /zima hub + /zima/[usluga] pages, the Payload-ready winter data layer, and the seasonal engine."
tags: [feature, seo, data, seasonal]
status: active
created: 2026-06-02
updated: 2026-06-03
related: ["[[city-landing-pages]]", "[[seo]]", "[[homepage-and-variants]]", "[[coverage-map]]", "[[service-pages]]", "[[image-loading]]", "[[ogrodowe-abc]]"]
sources: ["[[2026-06-02-winter-services-design]]"]
owns:
  routes: ["/zima", "/zima/[usluga]"]
  anchors: ["symbol:getWinterServices", "symbol:getWinterServiceBySlug", "symbol:getWinterServiceSlugs", "symbol:WinterService", "symbol:isWinterActive", "symbol:isWinterNow", "symbol:ServiceJsonLd", "symbol:WinterServiceCard"]
  globs: ["src/app/(public)/zima/**", "src/lib/winter.ts", "src/lib/season.ts", "src/components/ServiceJsonLd.tsx", "src/components/WinterServiceCard.tsx"]
depends: ["[[service-catalog]]", "[[coverage-map]]", "[[layout-chrome]]", "[[city-landing-pages]]"]
invariants:
  - rule: "Components consume winter services only via async accessors — no component imports the WINTER_SERVICES array (Payload-migration boundary)"
    enforcedBy: []
  - rule: "Pages that branch on the season set revalidate=86400 so the winter toggle flips without a redeploy"
    enforcedBy: []
verifiedAt: "86e5aaa6d37df606fb12826663fc91ecf40ce6f7"
---
## Purpose
The winter revenue arc — three landing pages + a hub, a Payload-ready data layer, and a pure seasonal engine that escalates the homepage Nov–Mar.
## Anchors
`getWinterServices`, `getWinterServiceBySlug`, `WinterService`, `isWinterActive`, `ServiceJsonLd`, `WinterServiceCard`, `route:/zima`, `route:/zima/[usluga]`.
## Invariants
Accessor-only data boundary (mirrors city pages); seasonal pages use daily ISR. The ❄ seasonal banner now renders in `SiteHeader` ([[layout-chrome]]) site-wide (see [[nav-unification]]), so this revalidate=86400 rule applies to every SiteHeader page, not just the homepage. `ServiceJsonLd` was generalized to `{name, description, url, breadcrumbs}` props so it can be shared with [[service-pages]] — the `/zima/[usluga]` call site behavior is unchanged.
## Images
The `/zima/[usluga]` hero and `WinterServiceCard` now render service photos (from `WinterService.image`, set via `IMG` in `winter.ts`) when the blur map has an entry for the path (`hasBlurImage` guard from [[image-loading]]). Until the winter photos are fetched (`fetch-stock.sh` + `npm run blur`), both components fall back to the existing gradient/icon variant — no code change required to unlock photos.
## Lineage
sources → [[2026-06-02-winter-services-design]]; image gating → [[winter-image-blur-gating]].
