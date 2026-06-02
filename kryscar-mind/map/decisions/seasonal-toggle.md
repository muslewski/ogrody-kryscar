---
type: decision
summary: "Winter escalation = pure season engine + auto/on/off override + daily ISR."
tags: [seasonal, ui]
status: active
created: 2026-06-02
updated: 2026-06-02
related: ["[[winter-services]]", "[[homepage-and-variants]]"]
sources: ["[[2026-06-02-winter-services-design]]"]
decided: 2026-06-02
supersededBy: ""
---
## Context
The homepage must mention winter year-round and escalate (ribbon + dark section + hero swap) once winter hits. A statically-prerendered `new Date()` would freeze at build time.
## Decision
A pure `isWinterActive(month, mode)` in `src/lib/season.ts`; a `WINTER.mode` of `auto|on|off`; seasonal pages export `revalidate = 86400`.
## Why
Purity makes the logic trivially reasoned-about (no test runner in this repo). The override gives the owner a marketing lever (force on for a cold snap/promo, or off). Daily ISR flips the toggle within a day with no redeploy.
## Consequences
`/`, `/example-9` and `/zima` recompute daily. Route-segment config like `revalidate` cannot be re-exported through a barrel (`export { revalidate } from …`) — Next/Turbopack rejects it — so the root `src/app/page.tsx` declares its own `export const revalidate = 86400` directly.
