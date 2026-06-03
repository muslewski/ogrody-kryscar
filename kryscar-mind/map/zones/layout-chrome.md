---
type: zone
summary: "Root layout, header, footer, preloader, and social links — the shared page shell."
tags: [ui]
status: active
created: 2026-06-02
updated: 2026-06-03
related: ["[[seo]]", "[[brand-data]]", "[[winter-services]]", "[[service-pages]]", "[[ogrodowe-abc]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:SiteHeader", "symbol:SiteFooter", "symbol:Socials"]
  globs: ["src/app/layout.tsx", "src/components/SiteHeader.tsx", "src/components/SiteFooter.tsx", "src/components/SitePreloader.tsx", "src/components/Socials.tsx"]
depends: ["[[brand-data]]"]
invariants:
  - rule: "SiteFooter anchors are root-relative (/#...) so it works on every page"
    enforcedBy: []
verifiedAt: "6f6884f5bfdefdb7a22fc35cbfe6fc498815837a"
---
## Purpose
Shared chrome reused by the homepage, city pages, winter pages, and service pages. `SiteHeader` has a "Usługi" nav link pointing at `/#katalog` and an "Ogrodowe ABC" link pointing at `/ogrodowe-abc`, sitting beside the existing "Zima" link.
## Anchors
`SiteHeader`, `SiteFooter`, `Socials`, `src/app/layout.tsx`.
