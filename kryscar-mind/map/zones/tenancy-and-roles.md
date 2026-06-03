---
type: zone
summary: "The tenancy seam (a single Kryscar tenant) + the customer/gardener role model on the BA users collection, including the default-tenant assignment hook."
tags: [feature, data, platform]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[customer-auth]]", "[[payload-backend]]", "[[auth-portal]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
owns:
  routes: []
  anchors: ["symbol:Tenants"]
  globs: ["src/collections/Tenants.ts"]
depends: ["[[payload-backend]]", "[[customer-auth]]"]
invariants:
  - rule: "Single tenant for MVP: exactly one tenants row (slug 'kryscar'); every user is assigned to it by the default-tenant beforeChange hook on the users collection"
    enforcedBy: []
  - rule: "users.role defaults to 'customer' and is admin-only writable (field access) — BA signup never sets it; only a Payload superadmin promotes to 'gardener'"
    enforcedBy: []
verifiedAt: "f51a2305c2c1052a667a67ee2c10e0458843d733"
---
## Purpose
Tenancy is wired as a structural seam, not a usable layer: a plain `tenants` collection (seeded: Kryscar), a `tenant` relationship + `role` (`customer`|`gardener`) on the BA `users` collection, and a `beforeChange` hook on `users` that assigns the Kryscar tenant on create. That hook is the designated future home of customer→tenant routing. No BA organization plugin / no `@payloadcms/plugin-multi-tenant` yet.
## Anchors
`Tenants` (the tenant collection); the `role`/`tenant` fields + default-tenant hook live on `Users` (see [[customer-auth]]).
## Lineage
sources → [[2026-06-03-payload-better-auth-foundation-design]]; why a seam not the plugin → [[tenancy-seam-not-plugin]]; the role model → [[roles-customer-gardener]].
