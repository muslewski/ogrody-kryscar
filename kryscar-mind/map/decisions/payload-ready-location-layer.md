---
type: decision
summary: "Location content flows through async accessors over a serializable Location interface, so a future PayloadCMS swap touches only locations.ts."
tags: [data, architecture]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]"]
sources: ["[[local-seo-city-pages-design]]"]
decided: 2026-06-02
supersededBy: ""
---
## Context
City pages need content now; PayloadCMS is planned later.
## Decision
Expose `getAllLocations`/`getLocationBySlug`/`getLocationSlugs` (async) over a flat, serializable `Location`. Only `locations.ts` knows the source.
## Why
Migration = reimplement 3 functions; pages/components unchanged.
## Consequences
Components must never import `LOCATIONS` directly (see tech-debt: enforce-locations-import-boundary).
