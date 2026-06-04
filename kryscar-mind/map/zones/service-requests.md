---
type: zone
summary: "Service Selection & Pricing (3b.1): the customer 'what should be done' flow — a smart-catalog ServiceConfigurator at /panel/ogrody/[id]/zamow that prices a basket live via the data-driven lib/pricing.estimate, saved as owner-scoped service-requests (server-recomputed snapshot) and listed at /panel/zamowienia."
tags: [feature, app, data, pricing]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[service-catalog]]", "[[pricing-calculator]]", "[[customer-lawns]]", "[[payload-backend]]", "[[app-shell]]"]
sources: ["[[2026-06-04-service-selection-3b1-design]]"]
owns:
  routes: ["/panel/ogrody/[id]/zamow", "/panel/zamowienia"]
  anchors: ["symbol:estimate", "symbol:createRequest", "symbol:getConfiguratorServices", "symbol:ServiceConfigurator"]
  globs: ["src/lib/pricing.ts", "src/lib/requests.ts", "src/collections/ServiceRequests.ts", "src/components/requests/**", "src/app/(app)/panel/zamowienia/**", "src/app/(app)/panel/ogrody/[id]/zamow/**"]
depends: ["[[customer-lawns]]", "[[payload-backend]]", "[[ui-primitives]]"]
invariants:
  - rule: "Pricing is data-driven from the services collection `pricing` group via lib/pricing.estimate (pure); no hardcoded service list or price table in the panel. A new service in /admin appears in the configurator, priced."
    enforcedBy: []
  - rule: "Request ownership is enforced in src/lib/requests.ts (every query filtered by owner == userId); estMin/estMax are recomputed server-side via estimate on create — client values are display-only."
    enforcedBy: []
verifiedAt: "3c19f5f930f1abc0d84c63b2c4b0ef9b140ad7e0"
---
## Purpose
The customer's "what should be done on my lawn" flow, built on top of [[customer-lawns]].
A logged-in customer picks a mapped lawn, toggles the services they want, and the panel
quotes them live ("od X do Y zł") against that lawn's `areaM2` — then saves the basket as
a **service request** for the team. The whole flow is **data-driven**: services and their
prices come from the Payload `services` collection (the `pricing` group is the single
source of truth), and a pure `lib/pricing.estimate` turns a basket + area into a min–max
range. The same `estimate` runs in the browser (live preview) and on the server (the
trusted, snapshotted total). There is no hardcoded service list or price table in the panel.

## Configurator flow
`ServiceConfigurator` (`src/components/requests/ServiceConfigurator.tsx`, client) renders the
catalog as a smart toggle list driven by each service's `pricing.kind`:
- **toggle** a service on/off; only enabled services contribute to the basket.
- **per-kind control** once enabled — `area` (recurring) shows **frequency pills**
  (Jednorazowo / Co tydzień / Co 2 tyg. / Raz w miesiącu / Sezonowo); `perUnit` shows a
  **quantity stepper** with the service's `unitLabel`; `fixed` shows **nothing** (just
  on/off); `custom` shows **"Wycena indywidualna"** (no price, excluded from totals).
- **live range** — each enabled line shows its own "od X do Y zł" (or "wycena" for custom),
  recomputed in-component via `estimate` as the user toggles / changes frequency / quantity.
- **sticky total** — a sticky footer sums the basket into one range and offers **save**.
- **save** — a server action calls `createRequest`, which **recomputes** the estimate
  server-side and persists the request; the client-shown numbers are display-only.

## Request model
A request is a **basket of snapshot line items** (`service-requests` collection,
`src/collections/ServiceRequests.ts`), not a single service:
- `owner`, `lawn` (relationship), `items[]` (each: `service` rel + `serviceSlug` +
  `serviceTitle` + `frequency?` + `quantity?` + `estMin`/`estMax` + `custom`), request-level
  `estMin`/`estMax`, `note?`, `status`.
- **Snapshot estimate** — line and total `estMin`/`estMax` are computed by `estimate` at
  create time and frozen on the doc, so a later price change in `/admin` doesn't rewrite
  history. `serviceTitle` is likewise snapshotted.
- **Multiple per lawn** — a lawn accumulates a history of requests; there is no one-request
  limit. Statuses are `draft` / `new` / `cancelled` (created as `new`; the list can cancel).
- **Owner-scoped** — `src/lib/requests.ts` is the only access path: every accessor
  (`getMyRequests`, `getRequest`, `createRequest`, `cancelRequest`) takes `userId` and
  filters by `owner == userId`. The collection's own `access` is closed (the Local API runs
  as admin), mirroring [[customer-lawns]].

## App-map (for browser agents — orient here first)
- `/panel/ogrody/[id]/zamow` — the `ServiceConfigurator` for one lawn: toggle services →
  per-kind control → live range → sticky total → save. Reached from a lawn's "Zamów usługi".
- `/panel/zamowienia` — the customer's request list: one row per request (lawn name, basket
  summary, range, **status badge**, **cancel**). Replaces the old `ComingSoon` stub.
- Server actions call the owner-scoped accessors in `src/lib/requests.ts`; pages and the
  client configurator never touch Payload directly.

## Anchors
`estimate` (`src/lib/pricing.ts`), `createRequest` (`src/lib/requests.ts`),
`getConfiguratorServices` (`src/lib/catalog.ts`), `ServiceConfigurator`
(`src/components/requests/ServiceConfigurator.tsx`).

## Lineage
sources → [[2026-06-04-service-selection-3b1-design]]; pricing-metadata rationale →
[[services-pricing-metadata]]; request-model rationale → [[service-request-model]];
ownership pattern → [[lawns-ownership-in-data-layer]].
