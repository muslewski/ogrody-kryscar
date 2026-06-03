---
type: zone
summary: "Root layout, header, footer, preloader, and social links — the shared page shell, with a session-aware Zaloguj/Panel button and a mobile nav that is a left-sliding shadcn Sheet drawer."
tags: [ui]
status: active
created: 2026-06-02
updated: 2026-06-04
related: ["[[seo]]", "[[brand-data]]", "[[winter-services]]", "[[service-pages]]", "[[ogrodowe-abc]]", "[[realizacje]]"]
sources: ["[[2026-06-03-nav-auth-responsive-design]]", "[[2026-06-03-nav-cleanup-mobile-sheet-design]]"]
owns:
  routes: []
  anchors: ["symbol:SiteHeader", "symbol:SiteFooter", "symbol:Socials", "symbol:HeaderAuth", "symbol:MobileNav"]
  globs: ["src/app/(public)/layout.tsx", "src/components/SiteHeader.tsx", "src/components/SiteFooter.tsx", "src/components/SitePreloader.tsx", "src/components/Socials.tsx", "src/components/HeaderAuth.tsx", "src/components/MobileNav.tsx", "src/components/ui/sheet.tsx"]
depends: ["[[brand-data]]", "[[winter-services]]"]
invariants:
  - rule: "SiteFooter anchors are root-relative (/#...) so it works on every page"
    enforcedBy: []
  - rule: "SiteHeader is the single header for the homepage and all subpages; its nav uses root-relative /#anchors and it renders the seasonal winter banner, so every page that renders it sets revalidate=86400"
    enforcedBy: []
verifiedAt: "7608c33aa23dc7fbf3c2a5e2db12fb482ec0eeb5"
---
## Purpose
Shared chrome reused by **every** page — the homepage now renders `SiteHeader` too (it previously had its own inline header). `SiteHeader` is the single canonical nav: Katalog · Realizacje · Zima · Ogrodowe ABC · Jak to działa · Opinie · Kontakt (section links are root-relative `/#...` so they work from any page), plus the "Zamów wycenę" CTA. It also renders the ❄ seasonal winter banner site-wide (via `isWinterNow`), so SiteHeader pages use daily ISR (revalidate=86400). See [[nav-unification]].

**Auth + responsive (nav-auth):** the desktop nav maps `NAV_LINKS` (lib/data); `HeaderAuth` (client island via `useSession`) shows **Zaloguj** (→/sign-in) or **Panel** (→/panel). On **desktop** the bar carries `HeaderAuth` + the CTA (the phone number was removed); on **mobile** the bar is just **logo + hamburger**, and `MobileNav` (client island) opens a **shadcn `Sheet` drawer sliding from the left** (Radix Dialog → focus-trap / scroll-lock / Escape) that carries the nav links + the session-aware Zaloguj/Panel link + the "Zamów wycenę" CTA + a tap-to-call. Both are client islands, so marketing pages stay statically generated. See [[nav-auth-client-islands]], [[mobile-nav-sheet-drawer]], [[auth-portal]].
## Anchors
`SiteHeader`, `SiteFooter`, `Socials`, `MobileNav`, `src/components/ui/sheet.tsx`, `src/app/(public)/layout.tsx`.
