---
type: decision
summary: "Before/after gallery is named 'Realizacje' (/realizacje + /realizacje/[slug]); the comparison is a hand-rolled clip-path drag slider client island (no dep); placeholder before/after pairs are fetched stock; project image paths live inline on Project (not IMG keys)."
tags: [ui, gallery, seo, data, decision]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[realizacje]]", "[[service-pages]]", "[[image-loading]]"]
sources: ["[[2026-06-03-realizacje-gallery-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
High-ticket aranżacja/rabaty jobs close on visual proof. We needed a before/after gallery as a subpage + homepage section + nav/footer item, with stock placeholders until real paired photos exist.
## Decision
Name "Realizacje", route `/realizacje` (index) + `/realizacje/[slug]` (detail). Approach A: `projects.ts` const array behind async accessors. The before/after comparison is a hand-rolled `"use client"` `BeforeAfterSlider` (clip-path reveal, pointer + keyboard) — no comparison-slider dependency. Placeholder pairs are fetched from Pixabay via `fetch-stock.sh` into `public/img/projects/`. Project image paths are stored inline on `Project` (project-specific, not shared brand imagery — unlike `IMG`-keyed photos).
## Why
Hand-rolling the slider avoids a dependency for ~70 lines of code and keeps full control. Inline image paths avoid a dozen `IMG` keys for 1:1 project images. Fetched stock lets the client feel the feature before supplying real photos.
## Consequences
Real paired photos replace the stock later (same filenames, or update the paths). Pages render SiteHeader so they carry daily ISR. The `pairs` array supports multiple comparisons per project in future without a schema change.
