---
type: spec
title: "Service Selection & Pricing (sub-project 3b.1)"
status: draft
created: 2026-06-04
slice: "3b.1 of the booking loop; 3b.2 = scheduling/booking (separate spec)"
related: ["[[service-catalog]]", "[[service-pages]]", "[[pricing-calculator]]", "[[customer-lawns]]", "[[payload-backend]]", "[[tenancy-and-roles]]"]
---

# Service Selection & Pricing — 3b.1 design

## Goal

Let a customer say **what should be done** to a lawn: pick services from a smart
catalog, configure the few things that matter per service, see a **live price range**,
and save it as a **service request**. The `services` Payload collection is the
**single source of truth** for both the catalog and the pricing — adding a service in
`/admin` makes it appear, configured and priced, with no code change.

Scheduling (gardener availability + booking a visit) is sub-project **3b.2** and is
out of scope here.

## Scope

**In scope (3b.1):**
- Pricing metadata on the `services` collection (the source of truth).
- A data-driven estimate (`src/lib/pricing.ts`) that reads it.
- A smart-catalog **configurator** at `/panel/ogrody/[id]/zamow` (reached from a
  lawn's "Zamów usługi"): toggle services → inline config → live "od X do Y zł" → save.
- A new **`serviceRequests`** collection (multiple per lawn — a history).
- **`/panel/zamowienia`** management list (view / cancel / re-edit a draft).

**Out of scope (3b.2+):** gardener availability, slot picking, booking confirmation,
gardener-side views, status beyond draft/new/cancelled. **Explicitly cut (YAGNI):**
terrain/slope input (the price *range* absorbs site uncertainty; the team assesses
on-site); editing a service's catalog content (that's the existing admin); migrating
the marketing `CalculatorForm` onto `lib/pricing` (a noted follow-up, not 3b.1).

## Decisions locked in brainstorming

- **Structured pricing on the collection** (live range), not a hardcoded enum.
- **Smart catalog list** interaction (catalog + configurator + running total on one
  screen) — chosen over a cart or a wizard.
- **Multiple requests per lawn** (a history), managed in `/panel/zamowienia`.
- **One request = a basket** of configured line items for **one** lawn.
- **Frequency** is a per-line attribute on recurring services (the "what"); 3b.2
  schedules the actual dates.

## `services` collection — pricing metadata

A `pricing` group added to each service (the single source of truth):

| field         | type / values                                  | notes |
|---------------|------------------------------------------------|-------|
| kind          | select: `area` \| `perUnit` \| `fixed` \| `custom` | how price is computed |
| basePrice     | number (PLN), optional                          | minimum / starting amount |
| pricePerM2    | number (PLN/m²), optional                       | used by `area` kind (× lawn area) |
| pricePerUnit  | number (PLN/unit), optional                     | used by `perUnit` kind |
| unitLabel     | text, optional                                  | e.g. "mb żywopłotu", "roślina" (perUnit) |
| recurring     | checkbox                                        | does frequency apply? |

`custom` kind = "wycena indywidualna" (captured, never auto-priced). Frequency
multipliers and the range spread are **business-policy constants in `src/lib/pricing.ts`**
(not per-service) — a possible future Payload Global. The pricing values for the
existing 8 services are seeded from today's `calculator.ts` model so behaviour is
preserved.

**Invariant:** the configurator and the estimate read service definitions + pricing
ONLY from the `services` collection (via the existing async accessors, extended to
include the `pricing` group) — no hardcoded service list or price table in the panel.

## `src/lib/pricing.ts` — data-driven estimate

```
Frequency = "jednorazowo" | "co_tydzien" | "co_2_tyg" | "raz_w_miesiacu" | "sezonowy"
FREQUENCY_MULT, RANGE_SPREAD = policy constants (from calculator.ts)

RequestLineInput = { serviceSlug, frequency?, quantity? }
LineEstimate     = { serviceSlug, label, min, max, custom: boolean }
Estimate         = { lines: LineEstimate[], min, max, hasCustom: boolean }

estimate(services: ServiceWithPricing[], items: RequestLineInput[], lawnAreaM2): Estimate
```
Per line, by `kind`: `area` → (basePrice + pricePerM2·area); `perUnit` → (basePrice +
pricePerUnit·quantity); `fixed` → basePrice; `custom` → no number (`custom:true`). Apply
the frequency multiplier when the service is `recurring`, then the ± range spread →
min/max. `custom` lines are excluded from the totals and surfaced via `hasCustom`. Pure
and unit-testable; reused everywhere (the marketing calculator can migrate later).

## `serviceRequests` collection

```
owner    → users (required; ownership key, set server-side from session)
lawn     → lawns (required)
items    array of:
           { service →services (required), frequency? (select), quantity? (number),
             estMin (number), estMax (number), custom (checkbox) }
estMin   number   (snapshot total range min at save)
estMax   number   (snapshot total range max at save)
note     textarea (optional, free text)
status   select: draft | new | cancelled   (default new; 3b.2 adds scheduled/completed)
tenant   → tenants (assigned by the shared assignDefaultTenant hook)
+ timestamps
```
Access **closed** (read/create/update/delete → false), reached only via the Local API.
Multiple rows per lawn. The estimate is **snapshotted** at save (per-line + total) so a
saved request keeps its quote even if catalog prices change later. Dev-push creates the
table (controller-authorized).

## Ownership boundary — `src/lib/requests.ts`

Same security seam as lawns: the BA→Payload Local API runs as admin, so ownership is
enforced in the data layer. `src/lib/requests.ts` exposes only owner-scoped functions —
`getMyRequests(userId)`, `getRequest(userId, id)`, `createRequest(userId, input)`,
`cancelRequest(userId, id)` — every query filtered by `owner == userId`. Server actions
read `session.user.id`; they never trust an owner from the client. `estMin`/`estMax` and
the per-line estimates are **recomputed server-side** via `lib/pricing` on create — the
client values are display-only and never trusted.

## Configurator UX (smart catalog list)

Route `/panel/ogrody/[id]/zamow` (server component loads the lawn — area known — + the
services with pricing; client island is the configurator):
- Each service = a card. Tap to **toggle on** → expands inline showing only its kind's
  control: **frequency pills** (recurring), a **quantity stepper + unitLabel** (perUnit),
  **nothing** (area/fixed — area from the lawn), or an amber **"Wycena indywidualna"**
  tag (custom). Each priced card shows its live "od X do Y zł".
- A free-text **note** field.
- A **sticky bottom bar**: running total range + "+ wycena" when custom items are
  present + **"Zapisz zapytanie"** (disabled until ≥1 service selected). Saving calls a
  server action → `createRequest` (status `new`) → redirect to `/panel/zamowienia`.

## Management — `/panel/zamowienia`

The nav stub becomes real: the customer's requests across all lawns as cards (lawn name,
chosen services, total range, status badge, date). Actions: **cancel** (status →
cancelled, confirm dialog) and re-open. The lawn card's existing "Zamów usługi" button
routes to the configurator for that lawn. `/panel` dashboard gains a small "X zapytań"
summary line (optional, low cost).

## Error handling & edges

- Empty selection → "Zapisz" disabled.
- Custom-only request → total shows "Wycena indywidualna", still saveable.
- A perUnit service toggled on with quantity 0 → "Zapisz" is blocked with an inline
  hint "podaj ilość" on that card (the stepper defaults to a sensible value, e.g. 10,
  so this is an edge, not the norm).
- Missing pricing fields on a service (misconfigured in CMS) → that service shows
  "wycena" rather than a wrong number (defensive in `lib/pricing`).
- Unauthenticated → existing `panel/layout.tsx` gate redirects to `/sign-in`.

## Testing / verification

`npm run check` gate. `src/lib/pricing.ts` gets sanity assertions in a runnable script:
a known `area` service + area + frequency → expected range; a `perUnit` service + qty →
expected range; a `custom` service → excluded from totals, `hasCustom:true`; a missing-
pricing service → "wycena" not NaN. Runtime (non-UI, controller): create a request via
the data layer, confirm owner-scoping + snapshot estimate + a second account can't see it.

## Mind updates (ship with the code)

- New zone `service-requests` (the configurator, `serviceRequests`, `lib/requests`,
  `lib/pricing`, `/panel/ogrody/[id]/zamow`, `/panel/zamowienia`).
- Decisions: `services-pricing-metadata` (collection as the pricing source of truth;
  why structured fields + a data-driven estimate over the hardcoded calculator) and
  `service-request-model` (basket of line items, snapshot estimate, multiple-per-lawn,
  owner-scoped data layer).
- Update `service-catalog`/`pricing-calculator` zones (pricing now lives on the
  collection; `calculator.ts` migration noted as follow-up); `prod-migrations-needed`
  (new `service_requests` table); re-stamp touched zones.
