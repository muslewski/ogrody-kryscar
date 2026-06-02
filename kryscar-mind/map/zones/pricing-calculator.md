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
verifiedAt: "74d28486554072404071920bafd9c109390994e7"
---
## Purpose
Estimates prices from service type + area (+ frequency).
## Anchors
`estimate`, `formatPLN`, `CalculatorForm`.
