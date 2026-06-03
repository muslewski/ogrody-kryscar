---
type: idea
summary: "Authenticated customer portal built around a per-garden visual canvas: customers see/select their green space, get live pricing, request visits, and watch staff paint in completed work over time. Phased: MVP → map → Stripe payments → mobile, with a multi-tenant platform horizon."
tags: [product, vision, auth, maps, platform]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[pricing-calculator]]", "[[service-catalog]]", "[[brand-data]]"]
sources: []
maturity: seed
---

> **Seed idea — envisioning, not a commitment.** Captured from a brainstorming session.
> Graduate the relevant slice to a `specs/` design + `plans/` plan before any code.

## One-liner
Turn Ogrody Kryscar from a service you *hire* into a place you *log into* — where every
customer has their own garden on screen, watches it get tended over time, and books the
next visit in a couple of taps.

## The core loop (the moat)
1. **Customer** signs in → sees *their* plot → selects areas → **live price** → requests + picks dates.
2. **Crew** does the work.
3. **Admin** (in Payload, on a laptop) spends ~2 min **coloring in what was done** — "trimmed here, mulched there, cleared that corner."
4. **Customer** gets an **email** and opens their plot to watch it **light up with this visit's work**.
5. The plot **accrues visible history** — the "almost Clash of Clans" feel: not a game, *your field evolving as we tend it.*

Most services hand you an invoice. This hands the customer **a living, visual record of their own green space.**

## Why it's beneficial
- **Customer:** emotional ownership ("that's *my* garden"), transparent live pricing, before/after proof of every visit, one home for all their properties + schedule.
- **Business:** real differentiation; **retention** — the accruing record is a switching cost → recurring revenue; an **upsell surface** painted on the map ("bare patch here — want planting?"); and the admin annotation doubles as a **per-property work log / CRM**.
- **Strategic:** structured per-garden history is a **data asset** that (a) powers a **mobile app** almost for free later, and (b) lets the GardenCanvas grow toward auto-magic without rework.

## Platform horizon (the north star)
If the loop works and scales, Ogrody Kryscar stops being *a* gardener and becomes **the
platform**: sign partnerships with other gardening businesses, each gets the portal +
GardenCanvas for their own customers, and we run the rails. "Not yet another gardening
service" taken to its conclusion — **the infrastructure layer for gardening services.**
Implies eventual **multi-tenancy** (org/partner → their customers → their gardens). The
clean module seams below are what make this reachable rather than a rewrite. (Better Auth's
organization model is the likely vehicle, but that's a horizon concern, not MVP.)

## Roadmap (phased — agreed sequencing)
1. **MVP — the portal foundation (A).** Auth · add a property · pick services · request a date · profile + visit history, with live pricing from the existing [[pricing-calculator]]. *Ship this first, standalone.* (Detail in "MVP cut".)
2. **The map — GardenCanvas for real (B).** The "better map": customers see/select their green space, staff paint in completed work, the plot visibly evolves. The star. (Detail below.)
3. **Stripe — easy payments.** *Once the better map is in customers' hands*, integrate **Stripe** so book → pay is frictionless — turning the request loop into a transactional one (deposits / per-visit / subscriptions for recurring care). Skills available: `stripe-best-practices`.
4. **Mobile app.** The per-garden data model from phases 1–2 powers a native app almost for free.

Each phase rides the clean module seams, so it lands **additively** without reworking the last. The platform horizon (multi-tenant partners) sits beyond phase 4.

## MVP cut
- **Foundation (A) — must work:** Better Auth sign-up/in · add a property by address · pick services · request a date · profile with visit history. Reuses the existing [[pricing-calculator]] (`estimate`) for live totals and [[service-catalog]] for what's selectable.
- **Star, thin (B-mvp):** a **GardenCanvas** module showing the property with a few **manually-selectable/drawn zones** + the staff "what we did" annotation layer. Minimal rendering — but a *real* module boundary from day one. "MVP of that system, inside the MVP of the app."

## The GardenCanvas module (the star, built to grow)
A self-contained module behind a clean, **provider-agnostic** interface (Google Maps / Mapbox / raw satellite tiles all swappable behind it — same discipline as the repo's Payload-migration boundary). Conceptual surfaces:
- `provider` — maps/imagery source (pluggable).
- `geometry` — the zones a user or admin draws on the plot.
- `annotations` — the "work done" layer staff paint after a visit.
- `render` — the "feels like my garden" visuals + animation.

**Growth path (each step lands behind the seam, no rip-up):**
manual zones → richer visuals / animation ("hmm, it's *my* garden") → **auto-detect green areas from satellite** (the eventual wow) → mobile app → multi-tenant for partners.

## Auth split
- **Better Auth = customers** (the portal). Skills available: `better-auth-best-practices`, `email-and-password-best-practices`, `organization-best-practices` (for the platform horizon).
- **Payload = staff / admins / developers** (annotate visits, manage catalog) — matches the repo's existing Payload-readiness.

## Working assumptions (revisit before spec)
- Scheduling = **request a date, staff confirm** — not brittle instant-booking (crews + weather).
- **No online payments at MVP** — phase 1 is about relationship + UX, not checkout; **Stripe arrives in phase 3** (after the map — see Roadmap).
- Property data (address, drawn geometry, visit imagery) is **per-customer private** — see risks.

## Beyond the MVP (sequenced in the Roadmap above)
The map / GardenCanvas (phase 2) · **Stripe payments (phase 3)** · mobile app (phase 4) · satellite green auto-detection (with/after the map) · multi-crew scheduling logic · full multi-tenant platform (the horizon). Named here so phase 1 stays small and none of it gets forgotten.

## Open questions / risks
- **Green auto-detection feasibility & cost** — satellite imagery licensing, accuracy, the hardest part. Deferred on purpose; manual draw de-risks it.
- **Map provider choice** — Google Maps vs Mapbox vs tiles: cost, ToS for storing/annotating imagery, offline/static rendering. The `provider` seam exists precisely to defer this.
- **RODO/GDPR** — storing home addresses + property imagery + visit history is personal data; needs a retention/consent story before launch.
- **Data model that won't fight multi-tenancy later** — even single-tenant MVP should shape entities (customer → property → garden → visit → annotation) so the partner/org layer can slot above without a migration.

## Plugs into what exists
[[pricing-calculator]] (live totals) · [[service-catalog]] (selectable work) · [[brand-data]] (identity, email) · the repo-wide Payload-migration boundary (the data layer this needs is the direction the codebase is already heading).
