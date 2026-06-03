---
type: zone
summary: "Ogrodowe ABC — seasonal gardening-guide content section (/ogrodowe-abc + /ogrodowe-abc/[slug]) and its Payload-ready guides data layer; two-way internal links with /uslugi & /zima."
tags: [feature, content, seo, data]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-pages]]", "[[winter-services]]", "[[seo]]", "[[image-loading]]", "[[layout-chrome]]", "[[homepage-and-variants]]"]
sources: ["[[2026-06-03-ogrodowe-abc-design]]"]
owns:
  routes: ["/ogrodowe-abc", "/ogrodowe-abc/[slug]"]
  anchors: ["symbol:getAllGuides", "symbol:getGuideBySlug", "symbol:getGuideSlugs", "symbol:getGuidesForService", "symbol:getGuidesForWinter", "symbol:Guide", "symbol:ArticleJsonLd"]
  globs: ["src/app/(public)/ogrodowe-abc/**", "src/lib/guides.ts", "src/components/ArticleJsonLd.tsx", "src/components/GuideCard.tsx"]
depends: ["[[service-pages]]", "[[winter-services]]", "[[image-loading]]", "[[layout-chrome]]"]
invariants:
  - rule: "Components consume guides only via async accessors — no component imports the GUIDES array (Payload-migration boundary)"
    enforcedBy: []
  - rule: "every guide img is a path present in BLUR_DATA so the hero always blurs up"
    enforcedBy: []
verifiedAt: "9cba57ddb7618ae0dc52283a1783b7e9656d7841"
---
## Purpose
Seasonal long-tail SEO + reader content. Data flows through async accessors so a PayloadCMS swap touches only `guides.ts`. Two-way links feed the /uslugi & /zima offers.
## Anchors
`getAllGuides`, `getGuideBySlug`, `getGuidesForService`, `getGuidesForWinter`, `Guide`, `ArticleJsonLd`, `route:/ogrodowe-abc`, `route:/ogrodowe-abc/[slug]`.
## Lineage
sources → [[2026-06-03-ogrodowe-abc-design]]; content-section decision → [[ogrodowe-abc-content-section]].
