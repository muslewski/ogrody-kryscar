---
type: zone
summary: "shadcn/radix UI primitives (new-york): button, checkbox, input, label, radio-group, scroll-area, separator, sidebar, skeleton, slider, tooltip."
tags: [ui]
status: active
created: 2026-06-02
updated: 2026-06-04
related: []
sources: []
owns:
  routes: []
  anchors: ["glob:src/components/ui/scroll-area.tsx"]
  globs: ["src/components/ui/**"]
depends: []
invariants:
  - "sidebar tokens are concrete hex values inside the single @theme block in globals.css — no :root or @theme inline layers"
  - "sidebar.tsx and use-mobile.ts are vendored as-is from shadcn CLI except for two lint fixes (Math.random in useState lazy init; onChange() replaces inline setIsMobile in useEffect)"
verifiedAt: "4f73ddb3e4374429067aa73c09eca1c06dea7d5e"
---
## Purpose
Low-level styled primitives consumed across features.
## Anchors
`src/components/ui/**`, `src/hooks/use-mobile.ts`.
