---
type: zone
summary: "Root layout, header, footer, preloader, and social links — the shared page shell, now with a responsive mobile nav and a session-aware Zaloguj/Panel auth button."
tags: [ui]
status: active
created: 2026-06-02
updated: 2026-06-03
related: ["[[seo]]", "[[brand-data]]", "[[winter-services]]", "[[service-pages]]", "[[ogrodowe-abc]]", "[[realizacje]]"]
sources: ["[[2026-06-03-nav-auth-responsive-design]]"]
owns:
  routes: []
  anchors: ["symbol:SiteHeader", "symbol:SiteFooter", "symbol:Socials", "symbol:HeaderAuth", "symbol:MobileNav"]
  globs: ["src/app/(public)/layout.tsx", "src/components/SiteHeader.tsx", "src/components/SiteFooter.tsx", "src/components/SitePreloader.tsx", "src/components/Socials.tsx", "src/components/HeaderAuth.tsx", "src/components/MobileNav.tsx"]
depends: ["[[brand-data]]", "[[winter-services]]"]
invariants:
  - rule: "SiteFooter anchors are root-relative (/#...) so it works on every page"
    enforcedBy: []
  - rule: "SiteHeader is the single header for the homepage and all subpages; its nav uses root-relative /#anchors and it renders the seasonal winter banner, so every page that renders it sets revalidate=86400"
    enforcedBy: []
verifiedAt: "7d7d0765b24dcc20ee1ee45aeb6e606e65ec2abd"
---
## Purpose
Shared chrome reused by **every** page — the homepage now renders `SiteHeader` too (it previously had its own inline header). `SiteHeader` is the single canonical nav: Katalog · Zima · Ogrodowe ABC · Jak to działa · Opinie · Kontakt (section links are root-relative `/#...` so they work from any page), plus the phone link and the "Zamów wycenę" CTA. It also renders the ❄ seasonal winter banner site-wide (via `isWinterNow`), so SiteHeader pages use daily ISR (revalidate=86400). The nav and footer also carry a **Realizacje** link to the [[realizacje]] gallery. See [[nav-unification]].

**Auth + responsive (nav-auth):** the desktop nav maps `NAV_LINKS` (lib/data); `HeaderAuth` (client island via `useSession`) shows **Zaloguj** (→/sign-in) or **Panel** (→/panel) left of the CTA and in the footer; `MobileNav` (client island) is the `< md` hamburger → dropdown menu (the header previously had no mobile nav). Both are client islands, so marketing pages stay statically generated. See [[nav-auth-client-islands]], [[auth-portal]].
## Anchors
`SiteHeader`, `SiteFooter`, `Socials`, `src/app/(public)/layout.tsx`.
