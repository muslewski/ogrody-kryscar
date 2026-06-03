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
depends: ["[[brand-data]]", "[[winter-services]]"]
invariants:
  - rule: "SiteFooter anchors are root-relative (/#...) so it works on every page"
    enforcedBy: []
  - rule: "SiteHeader is the single header for the homepage and all subpages; its nav uses root-relative /#anchors and it renders the seasonal winter banner, so every page that renders it sets revalidate=86400"
    enforcedBy: []
verifiedAt: "86e5aaa6d37df606fb12826663fc91ecf40ce6f7"
---
## Purpose
Shared chrome reused by **every** page — the homepage now renders `SiteHeader` too (it previously had its own inline header). `SiteHeader` is the single canonical nav: Katalog · Zima · Ogrodowe ABC · Jak to działa · Opinie · Kontakt (section links are root-relative `/#...` so they work from any page), plus the phone link and the "Zamów wycenę" CTA. It also renders the ❄ seasonal winter banner site-wide (via `isWinterNow`), so SiteHeader pages use daily ISR (revalidate=86400). See [[nav-unification]].
## Anchors
`SiteHeader`, `SiteFooter`, `Socials`, `src/app/layout.tsx`.
