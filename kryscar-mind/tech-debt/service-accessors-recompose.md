---
type: debt
summary: "Each accessor in src/lib/services.ts calls compose() independently, so a page calling both getAllServices() and getServiceBySlug() runs the full composition twice; getAllServices() also returns the internal array without a defensive copy."
tags: [performance, architecture]
status: open
created: 2026-06-03
updated: 2026-06-03
related: ["[[service-pages]]", "[[service-page-data-module]]"]
sources: []
severity: low
effort: low
---
## Problem
`getAllServices`, `getServiceSlugs`, and `getServiceBySlug` each call `compose()`, which re-runs `getCatalogServices()` and iterates `SERVICE_CONTENT` from scratch. A page that calls both `getAllServices()` and `getServiceBySlug()` (the current `/uslugi/[usluga]` template does exactly this) composes twice. Additionally `getAllServices()` returns the composed array directly — a caller could mutate it in place, affecting other callers if Node caches the module.

Harmless for the current static build (pure synchronous, no I/O, Node module cache makes it fast in practice), but wasteful and fragile once a PayloadCMS migration introduces real async I/O in `compose()`.
## Fix
Two small changes before the Payload migration:
1. Rewrite `getServiceBySlug` to `(await getAllServices()).find(s => s.slug === slug) ?? null` — single compose path.
2. Return a defensive copy from `getAllServices`: `return [...compose()]`.

Optionally memoize `compose()` behind a module-level `let cache: ServicePage[] | null = null` (reset on hot-reload in dev via `module.hot` or just accept the extra compose on first cold call per worker).
