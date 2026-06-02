---
type: flow
summary: "User filters the homepage service catalog and the cards reorder with animation."
tags: [ui]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[service-catalog]]"]
sources: ["[[catalog-category-filter-animation-design]]"]
steps: ["route:/", "symbol:getCatalogServices", "symbol:ServiceCatalog"]
verify: "Clicking a category pill shows only that category's cards; others animate out and remaining cards spring into place."
e2e: []
---
## Steps
Homepage builds services via `getCatalogServices`, passes them to the `ServiceCatalog` client island which owns the single-select filter state.
## Verify
Pick "Porządki" → 3 cards; "Trawnik" → 1 card; smooth reorder.
