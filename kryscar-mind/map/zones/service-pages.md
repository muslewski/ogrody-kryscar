---
type: zone
summary: "Per-service landing pages: /uslugi/[usluga] for all 8 catalog services + the Payload-ready service-page data layer that composes SERVICES + catalog price + landing content."
tags: [feature, seo, data]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-catalog]]", "[[winter-services]]", "[[city-landing-pages]]", "[[seo]]", "[[homepage-and-variants]]", "[[image-loading]]", "[[ogrodowe-abc]]"]
sources: ["[[2026-06-03-service-landing-pages-design]]"]
owns:
  routes: ["/uslugi/[usluga]"]
  anchors: ["symbol:getAllServices", "symbol:getServiceBySlug", "symbol:getServiceSlugs", "symbol:ServicePage", "symbol:ServiceFaq"]
  globs: ["src/app/(public)/uslugi/**", "src/lib/services.ts"]
depends: ["[[service-catalog]]", "[[coverage-map]]", "[[layout-chrome]]", "[[city-landing-pages]]", "[[winter-services]]"]
invariants:
  - rule: "Components consume service pages only via async accessors — no component imports SERVICE_CONTENT (Payload-migration boundary)"
    enforcedBy: []
verifiedAt: "86e5aaa6d37df606fb12826663fc91ecf40ce6f7"
---
## Purpose
A statically-rendered landing page per catalog service, mirroring the city/winter arcs. The data layer composes the thin SERVICES list + catalog pricing + net-new page content; the catalog cards link here. The `/uslugi/[usluga]` hero now renders via `BlurImage` (blur-up) — an instant blurred preview sharpens into the full photo, replacing the prior gray-box-then-pop.
## Anchors
`getAllServices`, `getServiceBySlug`, `getServiceSlugs`, `ServicePage`, `route:/uslugi/[usluga]`.
## Invariants
Accessor-only data boundary (mirrors city/winter). Pages now use daily ISR (revalidate=86400) so the site-wide seasonal banner in `SiteHeader` ([[layout-chrome]]) flips without a redeploy. Shares the generalized `ServiceJsonLd` owned by [[winter-services]].
## Lineage
sources → [[2026-06-03-service-landing-pages-design]]; data-layer rationale → [[service-page-data-module]].
