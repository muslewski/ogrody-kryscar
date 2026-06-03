---
type: decision
summary: "Service landing pages get their content from a separate src/lib/services.ts that composes SERVICES + catalog price + net-new content, not by enriching SERVICES."
tags: [data, seo]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-pages]]", "[[service-catalog]]", "[[winter-services]]"]
sources: ["[[2026-06-03-service-landing-pages-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
Each catalog service needed a landing page with depth (hero, includes, pricing note, FAQ, SEO meta). The thin `SERVICES` array is imported by the *client* catalog island, so enriching it would ship page copy to the browser and widen the catalog type.
## Decision
A dedicated `src/lib/services.ts` holds only the net-new `ServicePageContent` keyed by slug and **composes** the existing thin `SERVICES` + the catalog `from`/`duration`/`img` (via `getCatalogServices()`) into a `ServicePage`. `SERVICES` and `catalog.ts` are unchanged.
## Why
Mirrors the [[winter-data-module]] decision: keep the catalog-driving data thin, give landing pages a separate Payload-ready module. Composition (not duplication) keeps one source for the slug list and one for the display price. Zero churn to the client island and the homepage.
## Consequences
A service's data spans three single-purpose modules (data.ts canonical list, catalog.ts presentation, services.ts page content); accepted — each has one clear role and they compose. The accessor-only boundary for `SERVICE_CONTENT` is an unenforced invariant (same gap as locations/winter — see [[enforce-locations-import-boundary]]).
