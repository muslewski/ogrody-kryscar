---
type: debt
summary: "The 'no component imports LOCATIONS directly' rule (Payload-migration boundary) is a convention, not enforced. Add an ESLint no-restricted-imports rule."
tags: [lint, architecture]
status: open
created: 2026-06-02
updated: 2026-06-02
related: ["[[city-landing-pages]]", "[[payload-ready-location-layer]]"]
sources: ["[[payload-ready-location-layer]]"]
severity: med
effort: low
---
## Problem
Nothing prevents a component from importing the raw `LOCATIONS` array, which would break the clean PayloadCMS swap boundary.
## Fix
Add an ESLint `no-restricted-imports` (or `no-restricted-syntax`) rule forbidding non-`locations.ts` files from importing `LOCATIONS`, and wire it as the `enforcedBy` of the city-landing-pages invariant.
