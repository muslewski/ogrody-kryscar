---
type: zone
summary: "Gardener panel (3b.2): /zespol/zlecenia request triage (accept→schedule / decline / done) and a shared team schedule /zespol/grafik backed by a new visits collection — single dated visits, optional assignee. The team boundary is role==gardener (requireGardener), every query tenant-scoped."
tags: [feature, app, schedule, team]
status: active
created: 2026-06-10
updated: 2026-06-10
related: ["[[service-requests]]", "[[customer-lawns]]", "[[app-shell]]", "[[tenancy-and-roles]]", "[[payload-backend]]"]
sources: ["[[2026-06-10-team-schedule-mvp-design]]"]
owns:
  routes: ["/zespol/zlecenia", "/zespol/grafik"]
  anchors: ["symbol:Visits", "symbol:requireGardener", "symbol:getTenantRequests", "symbol:acceptRequest", "symbol:getTeamVisits", "symbol:suggestNextVisitDate", "symbol:canTransitionRequest", "symbol:RequestTriageCard", "symbol:VisitCard"]
  globs: ["src/collections/Visits.ts", "src/lib/visits.ts", "src/lib/team.ts", "src/lib/team-auth.ts", "src/components/team/**", "src/app/(app)/zespol/zlecenia/**", "src/app/(app)/zespol/grafik/**", "scripts/check-visits.ts"]
depends: ["[[service-requests]]", "[[customer-lawns]]", "[[payload-backend]]", "[[ui-primitives]]"]
invariants:
  - rule: "The team boundary is role == gardener, re-verified server-side per call via requireGardener (src/lib/team-auth.ts) — every /zespol server action calls it FIRST; the layout gate is not trusted by directly-callable actions. Team queries are tenant-scoped."
    enforcedBy: []
  - rule: "Request status transitions are guarded by canTransitionRequest server-side (new→accepted/declined/cancelled; accepted→done/cancelled; declined/done/cancelled terminal) — the UI never offers an illegal move and the data layer asserts it too."
    enforcedBy: ["scripts/check-visits.ts (npm run check)"]
  - rule: "acceptRequest flips new→accepted as a conditional CAS (id+tenant+status==new) BEFORE creating the visit, reverting on visit-create failure — concurrent accepts collapse to one winner (the Local API has no transaction primitive)."
    enforcedBy: []
  - rule: "Visits are single dated rows; recurrence is manual (scheduleNextVisit re-derives lawn/customer/tenant from the request row, client sends only requestId+date). suggestNextVisitDate (+7/+14/+30 by frequency) is pure."
    enforcedBy: ["scripts/check-visits.ts (npm run check)"]
  - rule: "Visit ownership: getUpcomingVisitsForCustomer filters customer==userId (owner-scoped); getTeamVisits + setVisitStatus filter by tenant. The visits collection access is closed (mcpOnly admin carve-out only) — see [[mcp-principal-is-admins]]."
    enforcedBy: []
verifiedAt: "7a99c4fe689b975026565e3d16b7bf98a6028ba5"
---
## Purpose
Closes the order loop. A customer's `service-request` ([[service-requests]]) lands as
`new`; this zone is where the Kryscar team acts on it. At `/zespol/zlecenia` a gardener
triages requests grouped **Nowe / W realizacji / Archiwum**: **Przyjmij** (pick a first
visit date → request `accepted`, a `visits` row is created) · **Odrzuć** (reason, visible
to the customer → `declined`) · **Zakończ zlecenie** (`accepted` → `done`). At
`/zespol/grafik` the shared team agenda lists visits by day (soonest first, **Zaległe**
past-planned surfaced on top): **Wykonana** · **Odwołaj** · **Zaplanuj kolejną**
(pre-filled date). The customer sees status changes in `/panel/zamowienia` and the next
planned visit on `/panel` ("Najbliższa wizyta").

## Lifecycle
```
customer creates ─────────────────────► new
new ── accept (+first visit date) ─────► accepted   (visit row, status planned)
new ── decline (+reason) ──────────────► declined
new / accepted ── customer cancel ─────► cancelled  (planned visits → cancelled)
accepted ── "Zakończ zlecenie" ────────► done
```

## Trust boundary
`requireGardener()` (`src/lib/team-auth.ts`) resolves the Better Auth session, looks up
the Payload role + tenant, and returns `{ userId, tenantId }` only for a gardener — every
`/zespol` server action calls it first (actions are directly callable, so the layout gate
is not enough). `src/lib/team.ts` carries the tenant filter on every query; `acceptRequest`
uses a conditional CAS so concurrent accepts can't double-book. The `visits` collection is
access-closed like lawns/service-requests; security lives in the data layer
([[lawns-ownership-in-data-layer]]). Visits reach `/api/mcp` only through the admin
carve-out ([[mcp-principal-is-admins]]).

## Data
`visits` collection: `request` · `lawn` · `customer` (denormalized for cheap agenda +
"najbliższe wizyty" queries) · `scheduledAt` · `assignee` (optional, informational) ·
`status` (planned/done/cancelled) · `note` · `tenant`. `service-requests.status` gained
`accepted/declined/done` and a `declineReason` ([[service-requests]]).

## Anchors
`Visits` (collection), `requireGardener` (team gate), `getTenantRequests` + `acceptRequest`
+ `declineRequest` + `completeRequest` (team.ts), `getTeamVisits` + `getUpcomingVisitsForCustomer`
+ `createVisit` + `setVisitStatus` + `suggestNextVisitDate` + `canTransitionRequest` (visits.ts),
`RequestTriageCard` + `VisitCard` (components/team).

## Lineage
sources → [[2026-06-10-team-schedule-mvp-design]]; visit-row rationale →
[[visit-per-row-schedule]]; CAS accept + tenant scoping → [[visit-per-row-schedule]];
MCP access → [[mcp-principal-is-admins]].
