---
type: decision
summary: "One canonical SiteHeader is used on the homepage AND every subpage (replacing the homepage's inline header); it carries the fuller nav with root-relative /#anchors and renders the seasonal winter banner site-wide, so all SiteHeader pages set revalidate=86400."
tags: [ui, nav, seasonal, decision]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[layout-chrome]]", "[[homepage-and-variants]]", "[[winter-services]]"]
sources: []
decided: 2026-06-03
supersededBy: ""
---
## Context
The homepage (`example-9`) shipped with its own inline `<header>` and winter banner, while every subpage rendered the shared `<SiteHeader>`. They diverged in links, labels, CTA, and breakpoints, and the homepage nav even lacked the new "Ogrodowe ABC" link — two navigations for one site.
## Decision
`SiteHeader` is the single canonical header, rendered by the homepage and all subpages. It carries the homepage's fuller nav — Katalog · Zima · Ogrodowe ABC · Jak to działa · Opinie · Kontakt — using root-relative `/#...` anchors (like `SiteFooter`) so the section links work from any page, plus the phone link and the "Zamów wycenę" CTA. The ❄ seasonal winter banner moved into `SiteHeader`, so it appears site-wide. Every page that renders `SiteHeader` sets `revalidate = 86400` so the banner flips without a redeploy.
## Why
A single component is the only durable way to keep the nav identical everywhere; root-relative anchors let one link set serve both the one-page homepage and the standalone routes (`/zima`, `/ogrodowe-abc`). Putting the banner in `SiteHeader` makes the seasonal signal consistent site-wide; daily ISR keeps it correct on otherwise-static pages.
## Consequences
`SiteHeader` now depends on `isWinterNow` (the season engine owned by [[winter-services]]). All `SiteHeader` pages — `/uslugi/[usluga]`, `/zima`, `/zima/[usluga]`, `/ogrodowe-abc`, `/ogrodowe-abc/[slug]`, `/ogrodnik/[miasto]`, and the homepage — are daily-ISR. No mobile hamburger was added (nav links remain hidden below `md`, as before). Future pages that render `SiteHeader` should also set `revalidate = 86400`.
