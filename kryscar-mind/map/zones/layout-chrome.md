---
type: zone
summary: "Root layout, header, footer, preloader, and social links — the shared page shell."
tags: [ui]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[seo]]", "[[brand-data]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:SiteHeader", "symbol:SiteFooter", "symbol:Socials"]
  globs: ["src/app/layout.tsx", "src/components/SiteHeader.tsx", "src/components/SiteFooter.tsx", "src/components/SitePreloader.tsx", "src/components/Socials.tsx"]
depends: ["[[brand-data]]"]
invariants:
  - rule: "SiteFooter anchors are root-relative (/#...) so it works on every page"
    enforcedBy: []
verifiedAt: "74d28486554072404071920bafd9c109390994e7"
---
## Purpose
Shared chrome reused by the homepage and city pages.
## Anchors
`SiteHeader`, `SiteFooter`, `Socials`, `src/app/layout.tsx`.
