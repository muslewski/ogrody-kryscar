---
type: decision
summary: "Garden images use next/image blur-up backed by a committed, generated blurDataURL map — not build-time generation or per-image static imports."
tags: [perf, ui, images]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[image-loading]]", "[[service-pages]]", "[[brand-data]]"]
sources: ["[[2026-06-03-image-blur-loading-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
The /uslugi hero showed an empty box then a hard pop, worst on client navigation (where next/image `priority` does nothing). We wanted an instant preview that sharpens in, reusable across the site's data-driven garden images (referenced by string path, e.g. `svc.img`).
## Decision
A manual generator (`scripts/gen-blur.mjs`, sharp) emits a committed `src/lib/blur-data.ts` map (16px base64 webp, keyed by public path). A server component `BlurImage` looks the blur up by `src` and renders `next/image` `placeholder="blur"`.
## Why
- **Generated map vs. static `import` per image:** the images are chosen dynamically by slug (`svc.img` is a string path), so static imports (next/image's automatic blur) don't compose. A path-keyed map does.
- **Manual + committed vs. build-time:** mirrors `fetch-stock.sh`/`IMG` — keeps `build`/`check` fast and deterministic; the graceful `placeholder="empty"` fallback makes a forgotten regen non-fatal.
- **Server component:** keeps the whole map server-side; only the one chosen dataURL is serialized into HTML.
## Consequences
A manual step to re-run (`npm run blur`) when images change. Blur is generated for all `public/img/**`, but only the /uslugi hero is wired in v1; catalog `WarpedHoverImage` adoption is deferred.
