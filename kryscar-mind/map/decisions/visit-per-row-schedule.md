---
type: decision
summary: "The team schedule is a separate visits collection — one dated row per appointment — not schedule fields on service-requests. A request has many visits over time, which is what 'schedule the next mowing' needs; the customer's 'najbliższe wizyty' and the team agenda both query it cheaply; and a future series/calendar feature builds on it without remodeling."
tags: [schedule, data, payload, team]
status: active
created: 2026-06-10
updated: 2026-06-10
related: ["[[team-schedule]]", "[[service-requests]]", "[[tenancy-and-roles]]"]
sources: ["[[2026-06-10-team-schedule-mvp-design]]"]
decided: 2026-06-10
supersededBy: ""
---
## Context
A `service-request` is the customer's standing "do these services on this lawn". The team
needs to schedule when the crew actually shows up — and for recurring services (co tydzień
/ co 2 tyg. / raz w miesiącu) that's many appointments over time. Two shapes were on the
table: (A) put `scheduledAt` directly on the request; (B) a separate `visits` collection,
one row per appointment.

## Decision
Option B — a `visits` collection (`request`, `lawn`, `customer`, `scheduledAt`, `assignee?`,
`status`, `note`, `tenant`). Accepting a request creates the first visit; "Zaplanuj kolejną"
creates the next. `lawn`/`customer` are denormalized from the request at creation so the
team agenda (`tenant == X AND status != cancelled`) and the customer's next-visit line
(`customer == U AND status == planned`) query without a second join.

## Why
Option A gives a recurring contract exactly one date — "schedule next" would overwrite
history, and there's nowhere to record a done/cancelled past visit. Option B models the
real cardinality (one request → many visits), keeps both hot queries to a single indexed
filter, and means a future feature (auto-generated series, a calendar grid, drag-drop
reschedule) is additive — it operates on visit rows that already exist, no remodel. The
cost is denormalization (lawn/customer copied onto the visit), which is safe because both
are write-once for the life of a request.

## Notes
- Recurrence stays **manual** for the MVP (no series engine): the gardener clicks "Zaplanuj
  kolejną"; `suggestNextVisitDate` only pre-fills the date. Auto-series is deferred.
- `acceptRequest` flips the status as a conditional CAS (id+tenant+status==new) before
  creating the visit and reverts on failure — Payload's Local API exposes no transaction
  primitive here ([[better-auth-via-payload-adapter]]), so the CAS is how concurrent
  accepts collapse to one winner.
- Visit writes re-derive lawn/customer/tenant from the request row server-side; the client
  never supplies them (see [[team-schedule]]).
