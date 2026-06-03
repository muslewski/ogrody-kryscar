---
type: debt
summary: "No self-hosted winter photography; winter cards use a gradient + icon fallback."
tags: [content, images, seasonal]
status: open
created: 2026-06-02
updated: 2026-06-03
related: ["[[winter-services]]", "[[brand-data]]"]
---
## What
`IMG` (src/lib/data.ts) has no snow/lights/wrapped-plant photos, so v1 winter cards and pages render a gradient + lucide icon instead of imagery.
## Why deferred
Sourcing/self-hosting stock would block the feature on a Pixabay key + `fetch-stock.sh` run; the `WinterService.image` slot is already wired so photos drop in later.
## Fix
Add winter keys (e.g. `snowDrive`, `gardenLights`, `wrappedPlants`) to `fetch-stock.sh` + the `IMG` map, then populate `WinterService.image` and render it in `WinterServiceCard`/the subpage hero.

**Code is wired (2026-06-03):** `fetch-stock.sh` has the 3 winter fetch slots (`snowDrive`, `gardenLights`, `wrappedPlants` → `public/img/winter/`), `IMG` keys are defined in `data.ts`, `WinterService.image` is set per-service in `winter.ts`, and rendering is gated via `hasBlurImage` in both `/zima/[usluga]` hero and `WinterServiceCard`. The remaining step is operational: run `PIXABAY_KEY=… bash scripts/fetch-stock.sh` then `npm run blur` and commit the photos + regenerated `blur-data.ts`.
