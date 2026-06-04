---
type: zone
summary: "Per-service landing pages: /uslugi/[usluga] for all 8 catalog services + the Payload-backed service-page data layer whose accessors read the services collection."
tags: [feature, seo, data]
status: active
created: 2026-06-03
updated: 2026-06-04
related: ["[[service-catalog]]", "[[winter-services]]", "[[city-landing-pages]]", "[[seo]]", "[[homepage-and-variants]]", "[[image-loading]]", "[[ogrodowe-abc]]", "[[payload-backend]]"]
sources: ["[[2026-06-03-service-landing-pages-design]]"]
owns:
  routes: ["/uslugi/[usluga]"]
  anchors: ["symbol:getAllServices", "symbol:getServiceBySlug", "symbol:getServiceSlugs", "symbol:ServicePage", "symbol:ServiceFaq"]
  globs: ["src/app/(public)/uslugi/**", "src/lib/services.ts", "src/lib/services-seed-data.ts"]
depends: ["[[service-catalog]]", "[[coverage-map]]", "[[layout-chrome]]", "[[city-landing-pages]]", "[[winter-services]]"]
invariants:
  - rule: "Components consume service data only via async accessors (getAllServices, getServiceBySlug, getServiceSlugs) — no component imports SERVICE_CONTENT or services-seed-data directly; the source is the Payload services collection"
    enforcedBy: []
verifiedAt: "0edd4d16cb23146fd271d9276b0bc776d44adb10"
---
## Purpose
A statically-rendered landing page per catalog service, mirroring the city/winter arcs. The data layer now reads the Payload `services` collection: `getAllServices`, `getServiceBySlug`, and `getServiceSlugs` all call Payload `find`/`findByID` (async). The services-seed-data module is seed-only. The `/uslugi/[usluga]` hero renders via `MediaImage` (blur-up from the Payload media doc's `blurDataURL`), preserving the instant blurred-preview → sharp-image transition.
## Anchors
`getAllServices`, `getServiceBySlug`, `getServiceSlugs`, `ServicePage`, `route:/uslugi/[usluga]`.
## Invariants
Accessor-only data boundary (mirrors city/winter). Pages use daily ISR (revalidate=86400) so the site-wide seasonal banner in `SiteHeader` ([[layout-chrome]]) flips without a redeploy. Shares the generalized `ServiceJsonLd` owned by [[winter-services]].
## Lineage
sources → [[2026-06-03-service-landing-pages-design]]; data-layer rationale → [[service-page-data-module]]; Payload migration → [[services-as-payload-collection]]; media blur → [[media-vercel-blob-blur-hook]].
