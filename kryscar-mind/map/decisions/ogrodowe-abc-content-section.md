---
type: decision
summary: "The blog-style content section is named 'Ogrodowe ABC' (/ogrodowe-abc), built as a TS data layer behind async accessors (Approach A, like services/locations), with hero images reused from already-committed BLUR_DATA files (no Pixabay fetch)."
tags: [content, seo, data, decision]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[ogrodowe-abc]]", "[[service-pages]]", "[[image-loading]]"]
sources: ["[[2026-06-03-ogrodowe-abc-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
The site needed a reader/SEO content section targeting informational long-tail queries that feed the seasonal offers. Options: TS data layer (house pattern), MDX files, or a Payload collection now.
## Decision
Name = "Ogrodowe ABC", route `/ogrodowe-abc`. Approach A: a `src/lib/guides.ts` const array behind async accessors mirroring `services.ts`/`locations.ts` — fully static, Payload-migration-ready, no new deps. Launch with 6 cornerstone articles. Hero images reuse files already in `BLUR_DATA` (no Pixabay fetch). Surfaced via header nav, reverse "Warto wiedzieć" blocks on /uslugi & /zima, and a homepage teaser.
## Why
MDX breaks the repo's "data behind async accessors" convention and the clean Payload-migration story; standing up Payload now is premature (the whole repo is migration-ready, not migrated). Reusing committed imagery avoids a live API dependency and guarantees blur-up.
## Consequences
Long-form prose lives as typed strings in TS (verbose but consistent). When Payload lands, reimplement the `guides.ts` accessors only. New guides must use an image already in `BLUR_DATA` (or add one via `fetch-stock.sh` + `npm run blur`).
