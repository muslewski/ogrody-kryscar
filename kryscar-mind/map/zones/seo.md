---
type: zone
summary: "sitemap.xml, robots.txt, and canonical/metadataBase wiring."
tags: [seo]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]", "[[brand-data]]", "[[winter-services]]"]
sources: []
owns:
  routes: ["/sitemap.xml", "/robots.txt"]
  anchors: ["symbol:SITE_URL"]
  globs: ["src/app/sitemap.ts", "src/app/robots.ts"]
depends: ["[[brand-data]]", "[[city-landing-pages]]"]
invariants:
  - rule: "every public route has a sitemap entry"
    enforcedBy: []
verifiedAt: "777b2d897f2306e857ee098cc94995f81f64de89"
---
## Purpose
Search-engine surface: sitemap enumerates the homepage + all /ogrodnik pages.
## Anchors
`route:/sitemap.xml`, `route:/robots.txt`, `SITE_URL`.
## Lineage
sources → [[local-seo-city-pages-design]].
