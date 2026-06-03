---
type: decision
summary: "Customers and gardeners are both Better Auth users distinguished by a role; public signup is always customer, gardeners are admin-promoted."
tags: [auth]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[tenancy-and-roles]]", "[[auth-portal]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
Kryscar staff need a minimal ops view of customer requests, and the platform horizon wants partner gardeners to log in like customers (not via Payload admin). We need a role concept without invitation machinery.
## Decision
A `role` select (`customer`|`gardener`) on `users`, default `customer`, field-access admin-only writable. Public signup always creates a customer (BA never sends `role`). A gardener is an existing user PROMOTED in `/admin`. The `(app)` portal has two role-gated areas: `/panel` (customer) and `/zespol` (gardener).
## Why
Promotion sidesteps credential-provisioning (the user already has a BA password from signup) and the admin-only field write is the self-elevation guard. One data spine, two role-gated front doors.
## Consequences
No invitation flow for MVP. Gates do an authoritative getSession + a Payload role lookup (see debt [[role-lookup-per-request]]). Verified at runtime: customer↔/panel, gardener↔/zespol, cross-role redirected.
