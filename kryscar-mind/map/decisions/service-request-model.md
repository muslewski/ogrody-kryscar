---
type: decision
summary: "A service request is a basket of snapshot line items (frozen serviceTitle + estMin/estMax per line, plus a request total), with multiple requests allowed per lawn as a history. Ownership is enforced in the data layer (src/lib/requests.ts: every query filtered by owner == userId; estimate recomputed server-side) and the ServiceRequests collection access is fully closed."
tags: [data, payload, auth, security, pricing, requests]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[service-requests]]", "[[customer-lawns]]", "[[payload-backend]]"]
sources: ["[[2026-06-04-service-selection-3b1-design]]"]
decided: 2026-06-04
supersededBy: ""
---
## Context
The customer's "what should be done" output had to be persisted for the team. A customer
may want several distinct things on one lawn, prices on the `services` collection can change
over time, and (like lawns) the Better Auth → Payload Local API runs as admin, so Payload
collection access can't see "who" is asking.

## Decision
Model a request as a **basket of snapshot line items** in a new `service-requests`
collection:
- One request = `owner` + `lawn` + `items[]` + request-level `estMin`/`estMax` + `note?` +
  `status`. Each item snapshots `serviceSlug`, `serviceTitle`, `frequency?`, `quantity?`,
  and its own `estMin`/`estMax`/`custom`.
- **Snapshot estimate** — `createRequest` recomputes the estimate server-side via
  `lib/pricing.estimate` and **freezes** the line + total ranges (and titles) on the doc, so
  a later price edit in `/admin` never rewrites past quotes. Client-sent prices are ignored.
- **Multiple per lawn** — requests accumulate as a history; no one-per-lawn limit. Statuses
  are `draft` / `new` / `cancelled` (created `new`; the list cancels by flipping status).
- **Owner-scoped data layer** — `src/lib/requests.ts` is the single gate: every accessor
  (`getMyRequests`, `getRequest`, `createRequest`, `cancelRequest`) takes `userId` and
  filters every query by `owner == userId`. The `ServiceRequests` collection's own `access`
  is fully **closed**; nothing reaches it except this module.

## Why
Snapshots keep history truthful independent of live pricing. A basket (not one service per
request) matches how a customer thinks about a job. Ownership must live where the trusted
identity exists (the BA session in the server action), so a closed collection plus an
owner-filtered accessor is the only place that can both see the customer and constrain rows
— the same shape as [[lawns-ownership-in-data-layer]].

## Consequences
- Any new request query path must go through `src/lib/requests.ts` with a `userId`; a raw
  `payload.find({ collection: 'service-requests' })` would leak cross-customer data and is
  forbidden.
- Stored `estMin`/`estMax` are historical snapshots — never re-derive them from current
  prices when displaying an existing request.
- New per-customer collections should follow this closed-collection + owner-accessor pattern.
