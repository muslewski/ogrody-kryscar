---
type: zone
summary: "sitemap.xml, robots.txt, and canonical/metadataBase wiring."
tags: [seo]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]", "[[brand-data]]"]
sources: []
owns:
  routes: ["/sitemap.xml", "/robots.txt"]
  anchors: ["symbol:SITE_URL"]
  globs: ["src/app/sitemap.ts", "src/app/robots.ts"]
depends: ["[[brand-data]]", "[[city-landing-pages]]"]
invariants:
  - rule: "every public route has a sitemap entry"
    enforcedBy: []
verifiedAt: "74d28486554072404071920bafd9c109390994e7"
---
## Purpose
Search-engine surface: sitemap enumerates the homepage + all /ogrodnik pages.
## Anchors
`route:/sitemap.xml`, `route:/robots.txt`, `SITE_URL`.
## Lineage
sources → [[local-seo-city-pages-design]].
