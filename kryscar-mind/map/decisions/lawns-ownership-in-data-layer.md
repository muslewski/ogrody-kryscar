---
type: decision
summary: "Lawn ownership is enforced in the data-access layer (src/lib/lawns.ts: every query filtered by owner == userId), not in Payload field access — because the Better Auth adapter runs the Payload Local API as admin, which bypasses collection access control. The Lawns collection access is therefore fully closed."
tags: [payload, auth, security, data, lawns]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[customer-lawns]]", "[[auth-portal]]", "[[payload-backend]]", "[[tenancy-and-roles]]"]
sources: ["[[2026-06-04-customer-lawns-3a-design]]"]
decided: 2026-06-04
supersededBy: ""
---
## Context
Customers create and read their own lawns. The natural Payload pattern is a per-field /
per-document access function keyed off the request user. But in this app the customer
identity comes from Better Auth, and lawn reads/writes go through the Payload **Local
API** via the Better Auth → Payload adapter. The Local API runs as admin and does not
carry the customer as the Payload request user, so Payload access functions can't see
"who" is asking — field/collection access can't scope rows to the customer.
## Decision
Enforce ownership in the data-access layer. `src/lib/lawns.ts` is the single gate: every
accessor (`getMyLawns`, `getLawn`, `createLawn`, `updateLawn`, `deleteLawn`) takes the
`userId` (resolved from the Better Auth session in the server action) and filters every
Payload query by `owner == userId` (and sets `owner` on create). The Lawns collection's
own `access` is fully **closed** — nothing reaches it except this module. Components and
server actions never query lawns directly.
## Why
Security must live where the trusted identity actually exists. Since the Local API is
admin, a closed collection + an owner-filtered accessor layer is the only place that can
both see the customer (from the BA session) and constrain the rows.
## Consequences
- The Lawns collection access is closed; bypassing `src/lib/lawns.ts` (e.g. a raw
  `payload.find({ collection: 'lawns' })`) would return cross-customer data — so that is
  forbidden and the accessor layer is the invariant to preserve.
- Any new lawn query path must go through `src/lib/lawns.ts` with a `userId`.
- This is the same shape future per-customer collections should follow.
