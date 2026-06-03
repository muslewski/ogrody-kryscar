---
type: zone
summary: "Realizacje — before/after project gallery (/realizacje + /realizacje/[slug]) for aranżacja/rabaty, its Payload-ready projects data layer, and the BeforeAfterSlider client island."
tags: [feature, ui, seo, data, gallery]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-pages]]", "[[service-catalog]]", "[[layout-chrome]]", "[[homepage-and-variants]]", "[[seo]]", "[[image-loading]]"]
sources: ["[[2026-06-03-realizacje-gallery-design]]"]
owns:
  routes: ["/realizacje", "/realizacje/[slug]"]
  anchors: ["symbol:getAllProjects", "symbol:getProjectBySlug", "symbol:getProjectSlugs", "symbol:getProjectsForService", "symbol:Project", "symbol:BeforeAfterSlider", "symbol:ProjectCard", "symbol:ProjectJsonLd"]
  globs: ["src/app/(public)/realizacje/**", "src/lib/projects.ts", "src/components/BeforeAfterSlider.tsx", "src/components/ProjectCard.tsx", "src/components/ProjectJsonLd.tsx"]
depends: ["[[service-pages]]", "[[service-catalog]]", "[[image-loading]]", "[[layout-chrome]]"]
invariants:
  - rule: "Components consume projects only via async accessors — no component imports the PROJECTS array (Payload-migration boundary)"
    enforcedBy: []
  - rule: "every before/after image path is present in BLUR_DATA so the slider always blurs up"
    enforcedBy: []
  - rule: "pages render SiteHeader, so they set revalidate=86400 (site-wide winter banner)"
    enforcedBy: []
verifiedAt: "9cba57ddb7618ae0dc52283a1783b7e9656d7841"
---
## Purpose
Visual before/after proof for the high-ticket aranżacja/rabaty work. Data flows through async accessors (Payload-ready). The drag slider is a `"use client"` island; everything else is static + daily ISR.
## Anchors
`getAllProjects`, `getProjectBySlug`, `getProjectsForService`, `Project`, `BeforeAfterSlider`, `ProjectCard`, `ProjectJsonLd`, `route:/realizacje`, `route:/realizacje/[slug]`.
## Lineage
sources → [[2026-06-03-realizacje-gallery-design]]; decision → [[realizacje-gallery]].
