---
type: decision
summary: "The 8 services are a Payload `services` collection (full service: catalog + price + landing content + tenant). The async accessors (lib/catalog, lib/services) read Payload; getCatalogServices is now async. Static SERVICES/SERVICE_BADGES/CATEGORIES stay in data.ts as the seed source + the design-variant pages' data."
tags: [payload, services, data]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[service-catalog]]", "[[service-pages]]", "[[payload-backend]]", "[[tenancy-and-roles]]"]
sources: ["[[2026-06-04-services-payload-collection-design]]"]
decided: 2026-06-04
supersededBy: ""
---
## Context
The service catalog needed to be CMS-editable and to back the customer-panel
service picker. The codebase already had an async-accessor migration boundary.
## Decision
A `services` collection holds the whole service. `lib/catalog.getCatalogServices`
(now async) + `lib/services` accessors read Payload (`find` sorted by `order`,
depth 1 for the media image). The static `SERVICES`/`SERVICE_BADGES` arrays remain
in data.ts as the seed source + the design-variant pages' data; the per-service
content/price/image maps moved to `lib/services-seed-data.ts` (seed-only). The few
live sync callers gained an `await`.
## Why
Full service in one record avoids a split entity and makes /uslugi CMS-driven too.
Keeping the static arrays for the throwaway variant pages avoids churn; the live
boundary is the accessors.
## Consequences
`getCatalogServices` is async — server-component callers await it. `CatalogItem` is
now an explicit type (decoupled from `typeof SERVICES`), and the badge comes from the
service doc. Projects/guides/winter/locations are NOT migrated (still static).
