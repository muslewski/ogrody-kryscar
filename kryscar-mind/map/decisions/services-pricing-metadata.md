---
type: decision
summary: "Pricing lives on the services collection (a structured `pricing` group: kind area/perUnit/fixed/custom + base/perM2/perUnit/unitLabel + recurring) as the single source of truth, read by a pure lib/pricing.estimate shared by the client configurator and the server recompute. Frequency multipliers are policy constants in lib/pricing; the marketing calculator.ts migration onto it is a noted follow-up."
tags: [pricing, data, payload, catalog]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[service-requests]]", "[[service-catalog]]", "[[pricing-calculator]]", "[[payload-backend]]"]
sources: ["[[2026-06-04-service-selection-3b1-design]]"]
decided: 2026-06-04
supersededBy: ""
---
## Context
3b.1 needed to quote a customer's basket against their lawn. Prices had been scattered:
the marketing `calculator.ts` carried its own per-service constants, and the catalog had no
machine-readable price at all. To price a basket in both the browser (live preview) and the
server (trusted total) we needed one authoritative, structured price per service that any
caller could read.

## Decision
Move pricing onto the Payload `services` collection as a structured `pricing` group — the
single source of truth — and read it through a pure `estimate` function:
- **`pricing` group fields**: `kind` (`area` | `perUnit` | `fixed` | `custom`),
  `basePrice`, `pricePerM2`, `pricePerUnit`, `unitLabel`, `recurring`.
- **`src/lib/pricing.ts` `estimate`** is PURE — no payload/server imports — so the **client
  configurator and the server recompute share the exact same math**. It takes priced
  services + a basket + the lawn's `areaM2` and returns a min–max **range** per line and
  for the total (`area` = base + perM2·m²; `perUnit` = base + perUnit·qty; `fixed` = base;
  `custom`/non-positive → flagged "wycena", excluded from totals).
- **Frequency multipliers are policy constants** in `lib/pricing` (`FREQUENCY_MULT`,
  applied only to `recurring` lines), not per-service data. A future Payload Global could
  own them; per-service numbers stay on the collection.
- **`getConfiguratorServices`** (`src/lib/catalog.ts`) projects the collection into the
  minimal priced shape the configurator + `createRequest` consume.

## Why
One structured price per service means a new service added in `/admin` is automatically
priced everywhere — no panel-side service list or price table to keep in sync. A pure
`estimate` is the only way the live client preview and the trusted server snapshot can be
guaranteed identical. Keeping prices as data (not code) lets the team retune without a deploy.

## Consequences
- The panel has **no hardcoded service list or price table**; everything flows from the
  collection through `getConfiguratorServices` + `estimate`.
- `estimate` must stay pure (no server-only imports) so the client can import it.
- **Follow-up (not done):** the marketing `calculator.ts` still carries its own constants.
  Migrating it onto `lib/pricing` (so the public calculator and the panel share one engine)
  is a noted follow-up, tracked against [[pricing-calculator]].
