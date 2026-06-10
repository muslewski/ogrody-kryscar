---
type: spec
summary: "Gardener-panel MVP (3b.2): /zespol/zlecenia request triage (accept→schedule / decline / done), a new visits collection + shared team schedule at /zespol/grafik (single dated visits, optional assignee), customer-side status + 'najbliższe wizyty' wiring, and the Payload MCP plugin exposing ops collections at /api/mcp."
tags: [app, requests, schedule, payload, mcp]
status: active
created: 2026-06-10
related: ["[[service-requests]]", "[[customer-lawns]]", "[[app-shell]]", "[[tenancy-and-roles]]", "[[payload-backend]]"]
supersedes: []
---

# Team schedule MVP (3b.2) — design

## Context

Sub-project 3b.1 gave customers the full order side: owner-scoped `service-requests`
(status `draft|new|cancelled`) created from the ServiceConfigurator, listed at
`/panel/zamowienia`. The gardener side is stubs: `/zespol` greets, `/zespol/zlecenia`
and `/zespol/klienci` are ComingSoon. Nothing closes the loop — a request lands in the
DB and only `/admin` can see it. The `/panel` dashboard copy already promises
"najbliższe wizyty".

This slice makes the MVP shippable: gardeners triage requests and run a schedule;
customers see what happens to their orders. Single Kryscar tenant (multi-tenant stays
deferred, [[tenancy-seam-not-plugin]]).

Decided with the owner (2026-06-10): **triage + schedule** (no price negotiation),
**single dated visits** (no auto-generated series), **shared team schedule**
(optional informational assignee), **MCP = ops data full CRUD** (auth collections off).

## Data model

### New `visits` collection (`src/collections/Visits.ts`)

| field | type | notes |
|---|---|---|
| `request` | rel → service-requests, required, indexed | the order this visit fulfils |
| `lawn` | rel → lawns, required | denormalized from the request for cheap agenda queries |
| `customer` | rel → users, required, indexed | denormalized owner — powers the customer's "najbliższe wizyty" |
| `scheduledAt` | date (with time), required, indexed | when the crew shows up |
| `assignee` | rel → users, optional | informational only — never access-controlling |
| `status` | select `planned\|done\|cancelled`, default `planned`, required | |
| `note` | textarea, optional | crew-facing |
| `tenant` | rel → tenants, required | via the shared `assignDefaultTenant` beforeChange hook |

Access fully closed (`() => false` × CRUD) like lawns/service-requests — the Local API
runs as admin, so security lives in the data layer ([[lawns-ownership-in-data-layer]]).
Timestamps on.

### `service-requests` changes

- `status` options extended: `draft | new | cancelled` → + `accepted | declined | done`.
- New optional `declineReason` (text), shown to the customer.

Lifecycle (all transitions server-action-driven, never client-trusted):

```
customer creates ────────────────► new
new ── gardener accepts (+ first visit date) ──► accepted   (visit row created)
new ── gardener declines (+ reason) ───────────► declined
new / accepted ── customer cancels ────────────► cancelled  (planned visits → cancelled)
accepted ── gardener "Zakończ zlecenie" ───────► done
```

Recurrence is manual: from `/zespol/grafik` a gardener clicks „Zaplanuj kolejną" on a
visit; the date input is pre-filled by pure `suggestNextVisitDate(lastDate, frequency)`
(+7 / +14 / +30 days for co_tydzien / co_2_tyg / raz_w_miesiacu; one-off/sezonowy →
+7 default). No series engine; the visit-per-row model doesn't fight one later.

## Trust boundaries

- Customer boundary (unchanged): `owner == userId` in `src/lib/requests.ts` / new
  customer-facing visit reads.
- **Team boundary (new): `role == "gardener"`**, verified server-side in every team
  action — a `requireGardener()` helper (session → Payload `users` role lookup, the
  same check the `/zespol` layout performs) lives in `src/lib/team-auth.ts`. Server
  actions are directly callable, so they never trust the layout's gate.
- Team accessors filter by tenant (today: the single Kryscar tenant of the acting
  gardener) — multi-tenant-ready without a plugin.
- New modules:
  - `src/lib/visits.ts` — visit CRUD + projections: `getTeamVisits`, `createVisit`,
    `setVisitStatus`, `getUpcomingVisitsForCustomer` (owner-scoped), `suggestNextVisitDate`
    (pure, exported for the check script).
  - `src/lib/team.ts` — team-side request reads + transitions: `getTenantRequests`,
    `acceptRequest` (transactionally: status → accepted + create visit), `declineRequest`,
    `completeRequest`.
  - Server actions: `src/app/(app)/zespol/zlecenia/actions.ts`,
    `src/app/(app)/zespol/grafik/actions.ts` — thin wrappers: `requireGardener()` →
    data layer → `revalidatePath`.
- Customer `cancelRequest` (existing) extends to `accepted` requests and cancels their
  `planned` visits.

## UI

### `/zespol/zlecenia` (replaces ComingSoon)
Requests grouped: **Nowe** / **W realizacji** (accepted) / **Archiwum** (done, declined,
cancelled). Card: `LawnSnapshot` (shared anchor, [[customer-lawns]]), customer name +
address, line items with est range (`formatRange`), note. Actions on *Nowe*: „Przyjmij"
(dialog: date+time input, default tomorrow 9:00 → `acceptRequest`) and „Odrzuć"
(dialog: reason textarea → `declineRequest`). On *W realizacji*: „Zakończ zlecenie".
Dialogs reuse the existing shadcn alert-dialog/sheet primitives — no new UI deps.

### `/zespol/grafik` (new route + nav item)
Agenda list (no calendar grid): visits grouped by day, soonest first, today highlighted.
Per visit: time, lawn name + address, customer, service titles (from the request
snapshot), assignee chip, note. Actions: „Wykonana" (→ done), „Odwołaj" (→ cancelled),
„Zaplanuj kolejną" (dialog pre-filled via `suggestNextVisitDate`). Past `planned`
visits surface at top as "Zaległe" so nothing silently rots.
NAV change: gardener gets `{ label: "Grafik", href: "/zespol/grafik", icon: CalendarDays }`
after Zlecenia ([[app-shell]] role-driven nav).

### `/zespol` dashboard
Two live count cards (same visual pattern as `/panel`): „Nowe zlecenia" → /zespol/zlecenia,
„Wizyty (najbliższe 7 dni)" → /zespol/grafik.

### Customer side
- `RequestCard` + `/panel/zamowienia`: status badges for the new states (accepted =
  „Przyjęte", declined = „Odrzucone" + declineReason, done = „Zakończone"); cancel
  button shown for `new` **and** `accepted`.
- `/panel` dashboard: „Najbliższa wizyta" line — next `planned` visit via
  `getUpcomingVisitsForCustomer`, read-only.
- `/zespol/klienci` stays ComingSoon (out of scope).

## Payload MCP plugin

- `@payloadcms/plugin-mcp` (version matching payload 3.85.x) added to
  `payload.config.ts` plugins.
- Exposed (full CRUD): `services`, `service-requests`, `lawns`, `visits`, `tenants`.
  **Never exposed:** `users`, `sessions`, `accounts`, `verifications`, `admins`, `media`
  (media via /admin).
- Endpoint `/api/mcp`, Bearer API keys minted in /admin (MCP → API Keys). Keys are
  admin-grade secrets (they reach customer PII in lawns/requests).
- Access carve-out: the closed collections' access functions change from `() => false`
  to "false for everyone EXCEPT the MCP plugin's API-key principal" (exact principal
  check determined from the plugin source during implementation, e.g.
  `req.user?.collection === <plugin api-key slug>`). BA customers remain fully denied;
  the data-layer ownership boundary is untouched. This becomes a zone invariant.
- Dev convenience wiring: `claude mcp add --transport http payload http://localhost:1111/api/mcp
  --header "Authorization: Bearer <key>"` documented in the README dev section.

## Error handling & observability

Team/customer actions follow the existing action pattern (validated input, Polish error
strings) **plus** `console.error` with context in every catch — no more silent
swallows in new code (audit finding OPS-5; existing actions are retrofitted
opportunistically when touched).

## Verification

- `scripts/check-visits.ts` (pure, `node:assert`): `suggestNextVisitDate` per frequency,
  status-transition guard table (illegal transitions rejected), wired into `check:logic`.
- `npm run check` green (tsc, eslint, payload types, mind, logic checks).
- Manual smoke with demo accounts: klient orders → ogrodnik accepts+schedules →
  grafik shows visit → done → klient sees status + dashboard visit line.
- `payload generate:types` after collection changes; dev DB push (prod migrations
  remain a known pre-launch tech-debt, [[prod-migrations-needed]]).

## Out of scope (deliberate)

Auto-generated recurring series · price negotiation/quotes · per-gardener access
scoping · notifications/e-mail · calendar-grid UI · drag-drop rescheduling ·
multi-tenant · /zespol/klienci.

## Mind upkeep (on finish)

New zone `team-schedule` (owns visits collection, lib/visits+team, /zespol/zlecenia +
/zespol/grafik); update `service-requests` (status model), `app-shell` (nav) zone cards;
decision record `visit-per-row-schedule.md`; re-stamp verifiedAt; `npm run mind`.
