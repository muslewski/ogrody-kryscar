---
type: zone
summary: "Pricing algorithm and the interactive area/frequency calculator form."
tags: [feature]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[service-catalog]]"]
sources: []
owns:
  routes: []
  anchors: ["symbol:estimate", "symbol:formatPLN", "symbol:CalculatorForm"]
  globs: ["src/lib/calculator.ts", "src/components/CalculatorForm.tsx"]
depends: ["[[service-catalog]]"]
invariants: []
verifiedAt: "3c19f5f930f1abc0d84c63b2c4b0ef9b140ad7e0"
---
## Purpose
Estimates prices from service type + area (+ frequency). This is the **marketing** calculator
(`src/lib/calculator.ts` + `CalculatorForm`), still carrying its own per-service constants.
## Note (3b.1)
Authoritative pricing now lives on the `services` collection (`pricing` group), read by the
pure data-driven `src/lib/pricing.ts` `estimate` (the panel configurator + server recompute,
owned by [[service-requests]]). Migrating this marketing `calculator.ts` onto `lib/pricing`
so both share one engine is a **noted follow-up** (not done). See [[services-pricing-metadata]].
## Anchors
`estimate`, `formatPLN`, `CalculatorForm`.
