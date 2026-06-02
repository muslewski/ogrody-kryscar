---
type: decision
summary: "The homepage catalog uses single-select category tabs with a Framer Motion popLayout reorder, not multi-select."
tags: [ui, feature]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[service-catalog]]"]
sources: ["[[catalog-category-filter-animation-design]]"]
decided: 2026-06-02
supersededBy: ""
---
## Context
Eight services; existing pill UI implied one active filter.
## Decision
Single-select tabs; each service in exactly one category; animate reorder with `AnimatePresence mode="popLayout"` + `layout`.
## Why
Simplest UX matching the existing pills; clean reorder.
## Consequences
Badges/numbers bind to slug (stable), not array index.
