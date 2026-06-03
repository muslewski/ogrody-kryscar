---
type: decision
summary: "Winter images render only when present in BLUR_DATA (a file-exists proxy), so the wired-but-unfetched state degrades to the gradient instead of 404-ing."
tags: [ui, images, seasonal]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[winter-services]]", "[[image-loading]]", "[[brand-data]]"]
sources: ["[[2026-06-03-winter-service-images-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
The winter photos can't be fetched in the build/agent environment (no Pixabay key). Setting `WinterService.image` to a not-yet-existing path would make `next/image` render broken images (404) until someone runs the fetch.
## Decision
Gate winter image rendering on `hasBlurImage(src)` — i.e. `src in BLUR_DATA`. `gen-blur.mjs` only emits a key for files that exist, so blur-map membership is a reliable "file exists and is ready" signal. `next/image` only ever receives a path with a blur entry.
## Why
- No broken images before the fetch: absent file → not in `BLUR_DATA` → gradient/icon fallback.
- Auto-rollout after the fetch: `fetch-stock.sh` → `npm run blur` adds the keys → images render with no further code change.
## Consequences
A file present but blur-not-regenerated reads as "absent" (fallback) until `npm run blur` runs — documented in the post-fetch step. The gate is reused for both the `/zima/[usluga]` hero and `WinterServiceCard`.
