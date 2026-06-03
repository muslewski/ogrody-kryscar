# Image Blur-Up Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the gray-box-then-pop on the `/uslugi/[usluga]` hero (and make all garden images adoptable) with an instant blurred preview that sharpens in, via `next/image` `placeholder="blur"` backed by a build-time-generated `blurDataURL` map.

**Architecture:** A manual generator script (`scripts/gen-blur.mjs`, using the already-installed `sharp`) scans `public/img/**` and writes a committed `src/lib/blur-data.ts` map keyed by public path. A reusable **server-component** wrapper `BlurImage` looks up the blur for its `src` and forwards everything to `next/image`. The `/uslugi` hero swaps `next/image` → `BlurImage`.

**Tech Stack:** Next.js 16 (App Router, modified build — see `AGENTS.md`), `next/image`, `sharp@0.34.5`, Node ESM (`.mjs`), TypeScript (strict), Tailwind.

**Verification note (read first):** This repo has **no test runner**. The gate is `npm run check` (`tsc --noEmit && eslint && node scripts/mind/generate.mjs`) plus `npx next build` + a `next start` smoke. Wherever a generic plan would "write a failing test," this plan substitutes type-checking, lint, build, idempotency checks, and `grep` assertions. Do **not** add a test framework.

**Setup (before Task 1):** We are on `main` (the previous feature already merged). Branch first.

```bash
cd /Users/muslewski/Documents/Repozytoria/ogrody-kryscar
git switch -c feat/image-blur-loading
```

**Source spec:** `kryscar-mind/specs/2026-06-03-image-blur-loading-design.md`. Orient via `kryscar-mind/map/zones/{service-pages,brand-data,motion-and-3d}.md`.

**One intentional refinement vs. the spec:** the spec sketched `BlurImage` with a hand-listed prop set. This plan instead types it as a pass-through of `next/image`'s own `ImageProps` (Task 2). That is strictly a cleaner "thin wrapper" — it forwards `fill`/`width`/`height`/`sizes`/`priority`/`className`/`quality`/etc. without re-declaring them and sidesteps `next/image`'s discriminated-union (`fill` XOR `width`/`height`) typing friction. Same behavior, less surface.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `scripts/gen-blur.mjs` | Create | Scan `public/img/**`, emit tiny base64 blur placeholders, write the map. Manual step. |
| `package.json` | Modify | Add `"blur": "node scripts/gen-blur.mjs"` script. |
| `src/lib/blur-data.ts` | Create (generated, committed) | `BLUR_DATA: Record<path, dataURL>`. |
| `src/components/BlurImage.tsx` | Create | Server-component wrapper over `next/image` adding the blur placeholder. |
| `src/app/uslugi/[usluga]/page.tsx` | Modify | Hero uses `BlurImage` instead of `next/image`. |
| `kryscar-mind/map/zones/image-loading.md` | Create | New zone. |
| `kryscar-mind/map/decisions/image-blur-loading.md` | Create | Decision record. |
| `kryscar-mind/map/zones/service-pages.md` | Modify | Re-stamp; note hero uses `BlurImage`. |
| `kryscar-mind/map/index.md` | Regenerate | `npm run mind`. |

---

## Task 1: Blur generator + generated map

**Files:**
- Create: `scripts/gen-blur.mjs`
- Modify: `package.json` (scripts)
- Create (by running the script): `src/lib/blur-data.ts`

- [ ] **Step 1: Create `scripts/gen-blur.mjs`**

```js
// scripts/gen-blur.mjs
// Generates src/lib/blur-data.ts — tiny base64 blur placeholders for the
// site's self-hosted images, consumed by <BlurImage> for next/image's
// placeholder="blur". Manual step (like fetch-stock.sh): run `npm run blur`
// after adding or replacing an image. Output is committed.
import { readdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import sharp from "sharp";

// Resolved from file location (not cwd) so the script can be called from any directory.
const ROOT = join(import.meta.dirname, "..");
const PUBLIC_DIR = join(ROOT, "public");
const IMG_DIR = join(PUBLIC_DIR, "img");
const OUT = join(ROOT, "src", "lib", "blur-data.ts");
const EXT = /\.(jpe?g|png)$/i;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (EXT.test(entry.name)) files.push(full);
  }
  return files;
}

async function main() {
  const files = walk(IMG_DIR).sort();
  const entries = {};
  for (const file of files) {
    // POSIX-style public path key, e.g. "/img/garden/lawnTexture.jpg"
    const key = "/" + relative(PUBLIC_DIR, file).split(sep).join("/");
    try {
      const buf = await sharp(file).resize(16).webp({ quality: 40 }).toBuffer();
      entries[key] = "data:image/webp;base64," + buf.toString("base64");
    } catch (err) {
      console.warn(`blur: skipped ${key}: ${err.message}`);
    }
  }

  const body = Object.keys(entries)
    .sort()
    .map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(entries[k])},`)
    .join("\n");

  const output = `// GENERATED by scripts/gen-blur.mjs — run \`npm run blur\`. DO NOT EDIT.
// Tiny 16px base64 WebP blur placeholders keyed by public image path,
// consumed by <BlurImage> for next/image placeholder="blur".
export const BLUR_DATA: Record<string, string> = {
${body}
};
`;

  writeFileSync(OUT, output);
  console.log(`blur: wrote ${Object.keys(entries).length} entries to ${relative(ROOT, OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add the npm script**

In `package.json`, inside `"scripts"`, add a `"blur"` entry next to `"mind"`. Change:

```json
    "mind": "node scripts/mind/generate.mjs",
    "check": "tsc --noEmit && eslint && node scripts/mind/generate.mjs"
```

to:

```json
    "blur": "node scripts/gen-blur.mjs",
    "mind": "node scripts/mind/generate.mjs",
    "check": "tsc --noEmit && eslint && node scripts/mind/generate.mjs"
```

- [ ] **Step 3: Run the generator**

Run: `npm run blur`
Expected: prints `blur: wrote 24 entries to src/lib/blur-data.ts` (24 garden JPEGs today; the count may be higher if team/png images are present). Creates `src/lib/blur-data.ts` containing `export const BLUR_DATA: Record<string, string> = { … }` with `"/img/garden/…": "data:image/webp;base64,…"` entries.

- [ ] **Step 4: Verify the output (content + idempotency + lint/types)**

Run:
```bash
grep -c "data:image/webp;base64," src/lib/blur-data.ts   # expect >= 24
npm run blur                                              # run again
git diff --stat src/lib/blur-data.ts                      # expect: no diff (idempotent)
npx tsc --noEmit                                          # expect clean
npx eslint scripts/gen-blur.mjs src/lib/blur-data.ts      # expect clean (0 errors)
```
Expected: ≥24 entries; the second `npm run blur` produces no diff; tsc and eslint clean. (If eslint flags a stylistic issue in the generated file, fix the generator's emitted formatting and re-run — do NOT hand-edit `blur-data.ts`.)

- [ ] **Step 5: Commit**

```bash
git add scripts/gen-blur.mjs package.json src/lib/blur-data.ts
git commit -m "$(cat <<'EOF'
feat(images): blurDataURL generator + committed BLUR_DATA map

scripts/gen-blur.mjs scans public/img/** and writes src/lib/blur-data.ts
(16px base64 webp per image, keyed by public path) via sharp. Manual,
committed step (npm run blur), like fetch-stock.sh. Consumed next by
<BlurImage> for next/image placeholder="blur".

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `BlurImage` wrapper component

**Files:**
- Create: `src/components/BlurImage.tsx`

- [ ] **Step 1: Create `src/components/BlurImage.tsx`**

```tsx
// src/components/BlurImage.tsx
import Image, { type ImageProps } from "next/image";
import { BLUR_DATA } from "@/lib/blur-data";

/**
 * Thin server-component wrapper over next/image: if a generated blur
 * placeholder exists for `src` (a public path under /img), render it with
 * placeholder="blur" so a blurred preview paints instantly and sharpens in.
 * Otherwise behaves exactly like a plain next/image (placeholder="empty").
 *
 * Server component on purpose — the full BLUR_DATA map stays server-side and
 * only the chosen image's tiny dataURL is serialized into the HTML.
 */
export function BlurImage({ alt, ...props }: ImageProps) {
  const blur = typeof props.src === "string" ? BLUR_DATA[props.src] : undefined;
  if (blur) {
    return <Image alt={alt} {...props} placeholder="blur" blurDataURL={blur} />;
  }
  return <Image alt={alt} {...props} />;
}
```

`alt` is destructured and passed explicitly (not via the spread) so `jsx-a11y/alt-text` can statically see it — no `eslint-disable` needed. `alt` is required by `ImageProps`, so callers must still provide it.

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && npx eslint src/components/BlurImage.tsx`
Expected: exit 0, no errors. (`props.src` is narrowed to `string` before indexing `BLUR_DATA`; in the truthy branch `blur` is `string`, satisfying `blurDataURL`.)

- [ ] **Step 3: Commit**

```bash
git add src/components/BlurImage.tsx
git commit -m "$(cat <<'EOF'
feat(images): BlurImage server wrapper over next/image

Looks up the generated blur placeholder for a string src and renders
placeholder="blur" + blurDataURL; falls back to a plain next/image when no
blur entry exists. Map stays server-side (no client-bundle bloat).

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Use `BlurImage` for the `/uslugi` hero

**Files:**
- Modify: `src/app/uslugi/[usluga]/page.tsx`

- [ ] **Step 1: Swap the import**

In `src/app/uslugi/[usluga]/page.tsx`, replace the `next/image` import with the `BlurImage` import. Change:

```tsx
import Image from "next/image";
```

to:

```tsx
import { BlurImage } from "@/components/BlurImage";
```

(`Image` is used only by the hero in this file, so removing the import is correct — Step 3 verifies no other usage remains.)

- [ ] **Step 2: Swap the hero element**

In the same file, replace the hero `<Image …>` element. Change:

```tsx
            <Image
              src={svc.img}
              alt={svc.title}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
```

to:

```tsx
            <BlurImage
              src={svc.img}
              alt={svc.title}
              fill
              preload
              className="object-cover"
              sizes="(min-width: 1280px) 1280px, 100vw"
            />
```

Use `preload` (not `priority`): in **Next.js 16 the `priority` prop is deprecated in favor of `preload`** for exactly this case — an above-the-fold LCP hero (per `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`). `preload` flows through `BlurImage`'s `{...props}` to `next/image` unchanged. (The pre-existing `priority` on `src/app/example-9/page.tsx` is a separate page, left as-is here.)

- [ ] **Step 3: Type-check, lint, confirm no stray `Image` usage**

Run:
```bash
npx tsc --noEmit
npx eslint 'src/app/uslugi/[usluga]/page.tsx'
grep -n "next/image\|<Image" 'src/app/uslugi/[usluga]/page.tsx'   # expect: no matches
```
Expected: tsc + eslint clean; the grep returns nothing (no leftover `next/image` import or `<Image>` usage — a leftover unused import would fail eslint).

- [ ] **Step 4: Build + runtime smoke (the actual fix)**

```bash
npx next build 2>&1 | tail -20          # /uslugi/[usluga] still SSG with 8 paths
npx next start -p 3100 > /tmp/blur-start.log 2>&1 &
SRV=$!
for i in $(seq 1 40); do curl -s -o /dev/null localhost:3100/ && break; sleep 1; done
echo "=== hero embeds a base64 blur placeholder? (expect >= 1) ==="
curl -s localhost:3100/uslugi/koszenie | grep -c "data:image/webp;base64,"
echo "=== page still renders H1 (expect Koszenie trawników) ==="
curl -s localhost:3100/uslugi/koszenie | grep -o "Koszenie trawników" | head -1
kill $SRV 2>/dev/null; wait $SRV 2>/dev/null
```
Expected: build succeeds with `/uslugi/[usluga]` SSG (8 paths); the blur grep prints `≥1` (next/image renders the `blurDataURL` into the hero's inline style); the H1 still renders. (`data:image/webp;base64,` appearing in the served HTML is the proof the blur placeholder is wired.)

- [ ] **Step 5: Commit**

```bash
git add 'src/app/uslugi/[usluga]/page.tsx'
git commit -m "$(cat <<'EOF'
feat(uslugi): blur-up hero image via BlurImage

Replaces the raw next/image hero with <BlurImage> so a blurred preview
paints instantly and sharpens in — fixes the gray-box-then-pop on direct
load and on client navigation from a catalog card.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Mind maintenance (the `docs(mind)` commit)

The code is complete and green, so anchors resolve.

**Files:**
- Create: `kryscar-mind/map/zones/image-loading.md`
- Create: `kryscar-mind/map/decisions/image-blur-loading.md`
- Modify: `kryscar-mind/map/zones/service-pages.md`
- Modify (regenerated): `kryscar-mind/map/index.md`
- Modify: `kryscar-mind/specs/2026-06-03-image-blur-loading-design.md` (`status: draft` → `done`)

- [ ] **Step 1: Capture the last code commit SHA (for `verifiedAt`)**

Run: `git rev-parse HEAD`
Use this value as `<SHA>` below (matches the repo convention: zone `verifiedAt` points at the code commit; the Mind regen lands as the following commit).

- [ ] **Step 2: Create the decision record**

Create `kryscar-mind/map/decisions/image-blur-loading.md`:

```markdown
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
```

- [ ] **Step 3: Create the zone card**

Create `kryscar-mind/map/zones/image-loading.md` (replace `<SHA>`):

```markdown
---
type: zone
summary: "Blur-up image loading: a generated blurDataURL map + the BlurImage next/image wrapper that paints an instant blurred preview, used by the /uslugi hero."
tags: [perf, ui, images]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[brand-data]]", "[[service-pages]]", "[[motion-and-3d]]"]
sources: ["[[2026-06-03-image-blur-loading-design]]"]
owns:
  routes: []
  anchors: ["symbol:BlurImage", "symbol:BLUR_DATA"]
  globs: ["src/components/BlurImage.tsx", "src/lib/blur-data.ts", "scripts/gen-blur.mjs"]
depends: ["[[brand-data]]"]
invariants:
  - rule: "blur-data.ts is generated by scripts/gen-blur.mjs (npm run blur) — never hand-edited; regenerate when public/img changes"
    enforcedBy: []
verifiedAt: "<SHA>"
---
## Purpose
Instant blurred-preview image loading for self-hosted garden images: a committed, generated `blurDataURL` map keyed by public path + a server-side `BlurImage` wrapper over `next/image` (`placeholder="blur"`).
## Anchors
`BlurImage`, `BLUR_DATA`, `scripts/gen-blur.mjs`.
## Invariants
`blur-data.ts` is generated (DO NOT EDIT); graceful `placeholder="empty"` fallback for any image without an entry. `BlurImage` is a server component so the map stays server-side.
## Lineage
sources → [[2026-06-03-image-blur-loading-design]]; rationale → [[image-blur-loading]].
```

- [ ] **Step 4: Re-stamp `service-pages`**

Read `kryscar-mind/map/zones/service-pages.md`, then: set `verifiedAt:` to `<SHA>` and `updated:` to `2026-06-03`; add `"[[image-loading]]"` to its `related:` list; in the prose note the `/uslugi` hero now renders via `BlurImage` (blur-up).

- [ ] **Step 5: Flip the spec status**

In `kryscar-mind/specs/2026-06-03-image-blur-loading-design.md` frontmatter, change `status: draft` → `status: done`.

- [ ] **Step 6: Regenerate + validate**

Run: `npm run mind`
Expected: succeeds, no broken-anchor errors; `kryscar-mind/map/index.md` regenerated to list the new `image-loading` zone (14 zones). If a broken anchor is reported, fix the zone card's anchor (exported symbols are `BlurImage` in `src/components/BlurImage.tsx` and `BLUR_DATA` in `src/lib/blur-data.ts`) and re-run.

- [ ] **Step 7: Final gate**

Run: `npm run check`
Expected: exit 0 (tsc + eslint + mind clean; pre-existing `<img>` warnings in `example-10`/`CoverageMap` are acceptable — 0 errors).

- [ ] **Step 8: Commit (targeted — avoid unrelated `.obsidian/*` noise)**

Do NOT `git add kryscar-mind/` wholesale. Add only:
```bash
git add \
  kryscar-mind/map/zones/image-loading.md \
  kryscar-mind/map/decisions/image-blur-loading.md \
  kryscar-mind/map/zones/service-pages.md \
  kryscar-mind/map/index.md \
  kryscar-mind/specs/2026-06-03-image-blur-loading-design.md \
  kryscar-mind/plans/2026-06-03-image-blur-loading-plan.md
git status --short   # confirm NO .obsidian file is staged
git commit -m "$(cat <<'EOF'
docs(mind): image-loading zone, blur-up decision; regen index

New zone image-loading (BlurImage + blur-data.ts + gen-blur.mjs); decision
record for the generated-map blur-up approach; re-stamp service-pages; spec
→ done; regenerate map/index.md.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review (completed during planning)

**Spec coverage** — every spec section maps to a task:
- Unit 1 (generator `scripts/gen-blur.mjs` + npm script) → Task 1.
- Unit 2 (generated `src/lib/blur-data.ts`, committed, keyed by public path) → Task 1 (Steps 3–5).
- Unit 3 (`BlurImage` server component, blur-or-empty fallback) → Task 2.
- Unit 4 (apply to `/uslugi` hero, drop unused `next/image` import) → Task 3.
- Manual/committed-not-build-hot-path + idempotency → Task 1 Steps 4–5.
- Server-component / no client-bundle bloat → Task 2 (no `"use client"`; map imported server-side).
- Graceful fallback (missing entry → `placeholder="empty"`) → Task 2 conditional.
- Verification (blur present in HTML; 8 pages still SSG) → Task 3 Step 4.
- Mind (new `image-loading` zone, decision, re-stamp `service-pages`, regen) → Task 4.

**Placeholder scan** — no `TBD`/`TODO`/"add error handling"/"similar to Task N"; every code/command step is complete and concrete.

**Type consistency** — `BLUR_DATA` (exported `Record<string,string>`) is produced in Task 1 and consumed in Task 2; `BlurImage` (exported in Task 2) is imported and used in Task 3; the generator writes exactly the symbol name (`BLUR_DATA`) the zone card (Task 4) declares as an anchor. `BlurImage(props: ImageProps)` pass-through matches the call site in Task 3 (`src`, `alt`, `fill`, `priority`, `className`, `sizes` are all valid `ImageProps`).

**Out of scope (unchanged):** catalog `WarpedHoverImage` adoption; source-JPEG recompression; running the generator in `build`/`check`; wiring blur for non-`/uslugi` pages.
