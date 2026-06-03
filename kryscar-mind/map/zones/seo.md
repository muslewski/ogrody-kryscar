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
  globs: ["src/app/sitemap.ts", "src/app/robots.ts"]
depends: ["[[brand-data]]", "[[city-landing-pages]]"]
invariants:
  - rule: "every public route has a sitemap entry"
    enforcedBy: []
verifiedAt: "6f6884f5bfdefdb7a22fc35cbfe6fc498815837a"
---
## Purpose
Search-engine surface: sitemap enumerates the homepage + all /ogrodnik city pages + all /zima winter-service pages + all 8 /uslugi/[slug] service landing pages (priority 0.8) + /ogrodowe-abc and every /ogrodowe-abc/[slug] guide.
## Anchors
`route:/sitemap.xml`, `route:/robots.txt`, `SITE_URL`.
## Lineage
sources → [[local-seo-city-pages-design]].
