---
type: decision
summary: "Winter services live in a separate src/lib/winter.ts, not folded into SERVICES."
tags: [data, seasonal]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[winter-services]]", "[[service-catalog]]"]
sources: ["[[2026-06-02-winter-services-design]]"]
decided: 2026-06-02
supersededBy: ""
---
## Context
Winter services needed a home. Option A: fold into the existing `SERVICES` array. Option B: a dedicated module.
## Decision
A dedicated `src/lib/winter.ts` with a private array + async accessors, mirroring `locations.ts`.
## Why
`SERVICES` is thin and drives the summer catalog filter (trawnik/cięcie/…). Winter services need landing-page depth (hero, includes, FAQ, SEO) and must not pollute the catalog or its categories. A separate module keeps both clean and is Payload-migration-ready by construction.
## Consequences
Two data modules to maintain; the homepage imports both. Accepted — same pattern as the city pages.
