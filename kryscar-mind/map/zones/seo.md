---
type: zone
summary: "sitemap.xml, robots.txt, and canonical/metadataBase wiring."
tags: [seo]
status: active
created: 2026-06-02
updated: 2026-06-03
related: ["[[city-landing-pages]]", "[[brand-data]]", "[[winter-services]]", "[[service-pages]]", "[[ogrodowe-abc]]"]
sources: []
owns:
  routes: ["/sitemap.xml", "/robots.txt"]
  anchors: ["symbol:SITE_URL"]
  globs: ["src/app/(public)/sitemap.ts", "src/app/(public)/robots.ts"]
depends: ["[[brand-data]]", "[[city-landing-pages]]"]
invariants:
  - rule: "every public route has a sitemap entry"
    enforcedBy: []
verifiedAt: "f51a2305c2c1052a667a67ee2c10e0458843d733"
---
## Purpose
Search-engine surface: sitemap enumerates the homepage + all /ogrodnik city pages + all /zima winter-service pages + all 8 /uslugi/[slug] service landing pages (priority 0.8) + /ogrodowe-abc and every /ogrodowe-abc/[slug] guide.
## Anchors
`route:/sitemap.xml`, `route:/robots.txt`, `SITE_URL`.
## Lineage
sources → [[local-seo-city-pages-design]].
