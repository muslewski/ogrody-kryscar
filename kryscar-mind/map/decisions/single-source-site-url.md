---
type: decision
summary: "The canonical origin lives once as SITE_URL in lib/data.ts; layout, sitemap, robots, and JSON-LD all import it."
tags: [seo]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[seo]]", "[[brand-data]]"]
sources: ["[[local-seo-city-pages-design]]"]
decided: 2026-06-02
supersededBy: ""
---
## Context
The domain literal was duplicated across several files.
## Decision
Define `SITE_URL` once in `lib/data.ts`; consume everywhere.
## Why
A domain change is a one-line edit; no stray literals.
## Consequences
New SEO code imports `SITE_URL`, never a string literal.
