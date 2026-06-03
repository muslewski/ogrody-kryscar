---
type: spec
summary: "Give each winter service a photo on its /zima/[usluga] hero and its /zima hub card, reusing the BlurImage blur-up pipeline — gated on blur-map presence so nothing breaks before the photos are fetched. Resolves the code side of the source-winter-imagery tech-debt."
tags: [ui, images, seasonal, seo]
status: done
created: 2026-06-03
updated: 2026-06-03
related: ["[[winter-services]]", "[[image-loading]]", "[[brand-data]]", "[[service-pages]]"]
sources: ["[[2026-06-03-image-blur-loading-design]]", "[[2026-06-02-winter-services-design]]"]
origin: "User: the /zima hub and /zima/[usluga] subpages should have images like the /uslugi service subpages now do. Decisions: source real winter photos by extending fetch-stock.sh (user runs it; no Pixabay key here); one image per winter service, shown on both the hub card and the subpage hero."
---

# Winter-service images — Design

**Date:** 2026-06-03
**Scope:** Give each of the 3 winter services a photo, shown as the `/zima/[usluga]` hero banner (mirroring `/uslugi/[usluga]`) and on its `/zima` hub card (the icon cards become image cards, like the homepage catalog). Reuses the existing `BlurImage` blur-up pipeline. Resolves the code side of the [[source-winter-imagery]] tech-debt. `/uslugi`, `/ogrodnik`, and the `/example-N` variants are untouched.

## Problem

The `/uslugi/[usluga]` pages now have blur-up hero photos, but the winter arc shipped with no imagery: `WinterService.image` is an unused optional field, `public/img/` has only `garden/` and `team/` (no `winter/`), and the `/zima/[usluga]` hero + the `/zima` hub `WinterServiceCard`s render an icon/gradient only. Garden photos are thematically wrong for winter (a green lawn on an odśnieżanie page), so this needs real winter imagery (snow clearing, świąteczne garden lighting, wrapped/frost-protected plants) — sourced via the repo's license-clean `fetch-stock.sh` (Pixabay).

## Approved decisions

- **Image source:** extend `scripts/fetch-stock.sh` with 3 winter slots; wire the data + pages + blur pipeline. The actual photos are fetched by the user running `PIXABAY_KEY=… bash scripts/fetch-stock.sh` (no Pixabay key is available in the build/agent environment). Until then, pages keep today's gradient/icon fallback. Same path the garden/team photos were sourced by.
- **Scope:** one image per winter service, used **both** as the `/zima/[usluga]` hero banner and on its `/zima` hub card (icon cards → image cards). 3 images total. No separate hub-hero banner (YAGNI).
- **No broken images pre-fetch:** image rendering is gated on `BLUR_DATA` membership (see Architecture), so a not-yet-fetched photo simply falls back to the gradient rather than rendering a 404.

## Architecture

### The gating idea — render only what exists

`gen-blur.mjs` scans `public/img/**` and emits a `BLUR_DATA` key only for files that actually exist. So **blur-map membership is a reliable "file exists and is ready" signal.** Winter image rendering is gated on it:

- **Files absent (now):** no winter keys in `BLUR_DATA` → `hasBlurImage(svc.image)` is `false` → pages render today's gradient/icon. Zero regression, no broken images.
- **After `fetch-stock.sh` → `npm run blur`:** winter keys appear → `hasBlurImage` is `true` → photos render via `BlurImage` (blur-up). No further code change.

`next/image` therefore only ever receives a path that has a blur entry — i.e. an existing file.

### Unit 1 — Fetch slots (`scripts/fetch-stock.sh`, edit)

Add `OUT_WINTER="$ROOT/public/img/winter"` to the `mkdir -p` line, a `echo "Winter imagery:"` section, and 3 fetch calls:

```bash
fetch snowDrive     "snow clearing driveway shovel"            "$OUT_WINTER" horizontal
fetch gardenLights  "christmas lights garden outdoor"          "$OUT_WINTER" horizontal
fetch wrappedPlants "plants winter protection fleece burlap"   "$OUT_WINTER" horizontal
```

(Queries are starting points; the `fetch` helper skips files that already exist, so a slot can be re-rolled by deleting its file.)

### Unit 2 — Image keys (`src/lib/data.ts`, edit)

Add a winter group to `IMG`:

```ts
const W = "/img/winter";
// ... inside IMG:
  // Winter
  snowDrive: `${W}/snowDrive.jpg`,
  gardenLights: `${W}/gardenLights.jpg`,
  wrappedPlants: `${W}/wrappedPlants.jpg`,
```

### Unit 3 — Winter data (`src/lib/winter.ts`, edit)

`import { IMG } from "@/lib/data";` and set `image` on each service (the `image?` field already exists):

- `odsniezanie` → `IMG.snowDrive`
- `swiateczne-oswietlenie` → `IMG.gardenLights`
- `zimowe-zabezpieczanie-roslin` → `IMG.wrappedPlants`

### Unit 4 — `hasBlurImage` guard (`src/components/BlurImage.tsx`, edit)

Export a type-guard so consumers can gate rendering:

```ts
export function hasBlurImage(src: string | undefined): src is string {
  return typeof src === "string" && src in BLUR_DATA;
}
```

Server-side (the map stays server-side; consumers are server components).

### Unit 5 — `/zima/[usluga]` hero image (`src/app/zima/[usluga]/page.tsx`, edit)

After the hero text/CTAs, when `hasBlurImage(svc.image)`, render a `BlurImage` banner identical in markup to the `/uslugi` hero:

```tsx
{hasBlurImage(svc.image) && (
  <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200">
    <div className="relative aspect-[16/9] w-full bg-neutral-100">
      <BlurImage
        src={svc.image}
        alt={svc.name}
        fill
        preload
        className="object-cover"
        sizes="(min-width: 1280px) 1280px, 100vw"
      />
    </div>
  </div>
)}
```

Imports: `BlurImage`, `hasBlurImage`. No other layout change; the existing eyebrow/h1/paragraphs/CTAs stay.

### Unit 6 — `WinterServiceCard` image (`src/components/WinterServiceCard.tsx`, edit)

When `hasBlurImage(service.image)`, render the photo on top of the card (rounded, `aspect-[4/3]`, `BlurImage fill`) with the existing lucide icon kept as a **small overlay badge** (preserves winter identity), then the name/tagline/CTA below. When absent, the current icon-block card is unchanged. Works for both `tone="light"` (hub + `/uslugi`-style) and `tone="dark"` (homepage winter section) — the image is tone-agnostic; the badge/overlay adapt. This is the only component change needed; `/zima` hub and the homepage winter section render `WinterServiceCard` and upgrade automatically.

## Data flow

`winter.ts` sets `image` (an `IMG` winter path) → `/zima/[usluga]` page and `WinterServiceCard` call `hasBlurImage(svc.image)` (checks `BLUR_DATA`) → render `BlurImage` (blur-up) when present, else the gradient/icon fallback.

## Error handling

- Missing image file → absent from `BLUR_DATA` → `hasBlurImage` false → gradient/icon fallback. No `next/image` 404 (it only receives paths with a blur entry).
- A file present but blur not regenerated → treated as absent (fallback) until `npm run blur` runs. Documented in the post-fetch step.

## Testing / verification

No test runner; gate is `npm run check` (tsc + eslint + mind). Verify:
- **Fallback path (default, files absent):** `npm run check` + `npx next build` pass; `/zima` and `/zima/[usluga]` render the gradient/icon (no winter image, no broken `<img>`/404). This is the shippable state.
- **Temporary populated-path smoke (run, then revert):** copy an existing jpg to `public/img/winter/snowDrive.jpg`, `npm run blur`, `next start`, confirm `/zima/odsniezanie` embeds a `data:image/webp;base64,…` blur on its hero and the hub card shows the image; then **delete the dummy file and re-run `npm run blur`** so no off-theme photo (or stray blur key) is committed.
- **Real photos (post-merge, by the user):** `PIXABAY_KEY=… bash scripts/fetch-stock.sh` → `npm run blur` → visual check → commit the 3 photos + regenerated `blur-data.ts`.

## Mind maintenance (per DEV RULE — same change as the code)

- Touch + re-stamp `verifiedAt`: `winter-services` (cards/hero now render images; `winter.ts` sets `image`), `brand-data` (new winter `IMG` keys + `public/img/winter`), `image-loading` (`hasBlurImage` guard added; winter pages are new consumers).
- Decision record `winter-image-blur-gating.md`: render winter images only when present in `BLUR_DATA` (file-exists proxy) so the wired-but-unfetched state degrades to the gradient instead of 404-ing; why (can't fetch in-environment; graceful auto-rollout post-fetch).
- Update the `source-winter-imagery` tech-debt: code/pipeline wired (slots + `IMG` keys + `image` fields + gated rendering); remaining operational step = run `fetch-stock.sh` with a key + `npm run blur`. Keep `status: open` (photos not yet on disk) but note the code is done.
- Run `npm run mind`; commit the regenerated `map/index.md`.

## Out of scope (YAGNI)

- A separate `/zima` hub hero banner (cards-only, per the decision).
- Populating the actual photos (needs the Pixabay key; user runs the fetch).
- Retrofitting `/uslugi` to use `hasBlurImage` (its garden images always exist — no gating needed).
- A 4th "hub banner" image or per-service multiple images.
