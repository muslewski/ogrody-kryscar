---
type: decision
summary: "Tenancy is wired as a structural seam (one Kryscar tenant + tenant/role on users) now; the BA organization + multi-tenant plugin machinery is deferred."
tags: [data, platform, auth]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[tenancy-and-roles]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
The product's north star is a platform serving multiple gardening companies, but the MVP serves only Kryscar's customers. delieta needed the full plugin stack (its tenancy IS the product); ours does not yet. The expensive-to-retrofit part is the data shape (tenant-aware rows), not the plugin wiring (which delieta proves adds later "with no adapter rewrite").
## Decision
Add a plain `tenants` collection (seeded: Kryscar) + `tenant` relationship + `role` on `users`, with a default-tenant hook assigning Kryscar on create. Write access control tenant-aware. DEFER the BA `organization` plugin, `@payloadcms/plugin-multi-tenant`, members/invitations, and partner-onboarding UI.
## Why
Capture the costly seam (rows tenant-aware from row #1) while skipping unused machinery. The default-tenant hook is the single future home of customer→tenant routing.
## Consequences
Single-tenant today, trivially. Onboarding partners later = add org collections + enable the plugins; the adapter maps them automatically. See debt [[defer-multitenant-plugin]].
