# Winter-Service Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each of the 3 winter services a photo on its `/zima/[usluga]` hero (mirroring `/uslugi`) and its `/zima` hub card, reusing the `BlurImage` blur-up pipeline — gated on blur-map presence so the not-yet-fetched state degrades to today's gradient instead of 404-ing.

**Architecture:** Wire winter image sources (`fetch-stock.sh` slots + `IMG` keys + `WinterService.image`), add a `hasBlurImage(src)` type-guard to `BlurImage.tsx`, and conditionally render a `BlurImage` on the `/zima/[usluga]` hero and in `WinterServiceCard` only when `src` is present in the generated `BLUR_DATA` map. The actual photos are fetched by the user post-merge (no Pixabay key in this environment); until then everything compiles and renders the existing fallback.

**Tech Stack:** Next.js 16 (App Router), `next/image` via `BlurImage`, `sharp` (blur generator), Bash (`fetch-stock.sh`), TypeScript (strict), Tailwind, `lucide-react`.

**Verification note (read first):** No test runner. Gate = `npm run check` (`tsc --noEmit && eslint && node scripts/mind/generate.mjs`) + `npx next build`. The winter photos can't be downloaded here (no `PIXABAY_KEY`), so the default verification confirms the **fallback** path (no winter files → gradient, no broken images). Task 5 is a **temporary** populated-path smoke that is reverted, leaving the tree clean. Do NOT add a test framework.

**Setup (before Task 1):** On `main` (previous features merged). Branch first.

```bash
cd /Users/muslewski/Documents/Repozytoria/ogrody-kryscar
git switch -c feat/winter-service-images
```

**Source spec:** `kryscar-mind/specs/2026-06-03-winter-service-images-design.md`. Orient via `kryscar-mind/map/zones/{winter-services,image-loading,brand-data}.md`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `scripts/fetch-stock.sh` | Modify | Add `OUT_WINTER` + 3 winter fetch slots. |
| `src/lib/data.ts` | Modify | Add `const W` + 3 winter keys to `IMG`. |
| `src/lib/winter.ts` | Modify | Import `IMG`; set `image` on the 3 services. |
| `src/components/BlurImage.tsx` | Modify | Export `hasBlurImage(src)` type-guard. |
| `src/app/zima/[usluga]/page.tsx` | Modify | Conditional `BlurImage` hero banner. |
| `src/components/WinterServiceCard.tsx` | Modify | Conditional image-card variant. |
| `kryscar-mind/map/decisions/winter-image-blur-gating.md` | Create | Decision record. |
| `kryscar-mind/map/zones/{winter-services,brand-data,image-loading}.md` | Modify | Re-stamp + note. |
| `kryscar-mind/tech-debt/source-winter-imagery.md` | Modify | Note code wired; photos pending fetch. |
| `kryscar-mind/map/index.md` | Regenerate | `npm run mind`. |

---

## Task 1: Wire winter image sources + data

**Files:**
- Modify: `scripts/fetch-stock.sh`
- Modify: `src/lib/data.ts`
- Modify: `src/lib/winter.ts`

- [ ] **Step 1: Add the winter output dir + fetch slots to `scripts/fetch-stock.sh`**

Change the output-dir block. Find:

```bash
OUT_GARDEN="$ROOT/public/img/garden"
OUT_TEAM="$ROOT/public/img/team"
mkdir -p "$OUT_GARDEN" "$OUT_TEAM"
```

to:

```bash
OUT_GARDEN="$ROOT/public/img/garden"
OUT_TEAM="$ROOT/public/img/team"
OUT_WINTER="$ROOT/public/img/winter"
mkdir -p "$OUT_GARDEN" "$OUT_TEAM" "$OUT_WINTER"
```

Then, immediately after the **last team fetch line** (`fetch bartek …  "$OUT_TEAM" vertical`), add a blank line and the winter section:

```bash

echo "Winter imagery:"
fetch snowDrive     "snow clearing driveway shovel"          "$OUT_WINTER" horizontal
fetch gardenLights  "christmas lights garden outdoor"        "$OUT_WINTER" horizontal
fetch wrappedPlants "plants winter protection fleece burlap" "$OUT_WINTER" horizontal
```

- [ ] **Step 2: Add winter keys to `IMG` in `src/lib/data.ts`**

Find:

```ts
const G = "/img/garden";
export const IMG = {
```

and replace with:

```ts
const G = "/img/garden";
const W = "/img/winter";
export const IMG = {
  // Winter
  snowDrive: `${W}/snowDrive.jpg`,
  gardenLights: `${W}/gardenLights.jpg`,
  wrappedPlants: `${W}/wrappedPlants.jpg`,
```

(This inserts the `W` const and the three winter entries at the top of the `IMG` object literal; the existing `// Hero / wide landscape gardens` group follows unchanged.)

- [ ] **Step 3: Wire `image` into the 3 winter services in `src/lib/winter.ts`**

First add the import. Find:

```ts
export interface WinterServiceFaq {
```

and replace with:

```ts
import { IMG } from "@/lib/data";

export interface WinterServiceFaq {
```

Then set `image` on each service by anchoring on its unique `order` line.

Replace `    order: 1,` with:
```ts
    image: IMG.snowDrive,
    order: 1,
```

Replace `    order: 2,` with:
```ts
    image: IMG.gardenLights,
    order: 2,
```

Replace `    order: 3,` with:
```ts
    image: IMG.wrappedPlants,
    order: 3,
```

- [ ] **Step 4: Verify (compiles; script syntax OK; no files needed yet)**

Run:
```bash
bash -n scripts/fetch-stock.sh          # shell syntax check (we can't run it — no PIXABAY_KEY)
npx tsc --noEmit                        # winter.ts references IMG.snowDrive etc. — must resolve
npx eslint src/lib/data.ts src/lib/winter.ts
```
Expected: all clean. (No image files exist yet and nothing renders `image` — this is a safe wiring-only step.)

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-stock.sh src/lib/data.ts src/lib/winter.ts
git commit -m "$(cat <<'EOF'
feat(zima): wire winter image sources (fetch slots, IMG keys, image field)

Adds 3 winter slots to fetch-stock.sh (snowDrive, gardenLights,
wrappedPlants → public/img/winter), the matching IMG keys, and sets
WinterService.image per service. No rendering yet; photos are fetched
post-merge via fetch-stock.sh + npm run blur.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `hasBlurImage` guard

**Files:**
- Modify: `src/components/BlurImage.tsx`

- [ ] **Step 1: Add the exported type-guard**

In `src/components/BlurImage.tsx`, after the existing `BlurImage` function, append:

```tsx

/**
 * True when `src` is a string that has a generated blur entry — i.e. the
 * image file exists on disk (gen-blur only emits keys for real files). Lets
 * callers gate an optional image so a not-yet-present file falls back to a
 * placeholder instead of rendering a broken <img> (404).
 */
export function hasBlurImage(src: string | undefined): src is string {
  return typeof src === "string" && src in BLUR_DATA;
}
```

(`BLUR_DATA` is already imported at the top of the file.)

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx eslint src/components/BlurImage.tsx`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/BlurImage.tsx
git commit -m "$(cat <<'EOF'
feat(images): hasBlurImage type-guard for gating optional images

Returns true only when src has a generated blur entry (file exists), so
callers can render an optional image or fall back without 404s.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `/zima/[usluga]` hero image

**Files:**
- Modify: `src/app/zima/[usluga]/page.tsx`

- [ ] **Step 1: Import `BlurImage` + `hasBlurImage`**

Find:

```tsx
import { Reveal } from "@/components/motion";
```

and replace with:

```tsx
import { Reveal } from "@/components/motion";
import { BlurImage, hasBlurImage } from "@/components/BlurImage";
```

- [ ] **Step 2: Add the conditional hero banner**

Find the end of the hero section (the hero `</Reveal>` immediately followed by `</section>` and the `Co obejmuje` comment):

```tsx
        </Reveal>
      </section>

      {/* Co obejmuje */}
```

and replace with:

```tsx
        </Reveal>
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
      </section>

      {/* Co obejmuje */}
```

- [ ] **Step 3: Verify (compile, lint, build with fallback)**

Run:
```bash
npx tsc --noEmit
npx eslint 'src/app/zima/[usluga]/page.tsx'
npx next build 2>&1 | tail -15
```
Expected: clean; build succeeds; `/zima/[usluga]` still prerenders 3 paths. (Since no winter image files exist yet, `hasBlurImage(svc.image)` is `false` → no banner renders, no 404 — the fallback path.)

- [ ] **Step 4: Commit**

```bash
git add 'src/app/zima/[usluga]/page.tsx'
git commit -m "$(cat <<'EOF'
feat(zima): conditional blur-up hero image on /zima/[usluga]

Renders a BlurImage hero banner (like /uslugi) when the service image is
present in the blur map; otherwise unchanged. Safe before photos land.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `WinterServiceCard` image variant

**Files:**
- Modify: `src/components/WinterServiceCard.tsx`

- [ ] **Step 1: Replace `src/components/WinterServiceCard.tsx` with the image-aware version**

Overwrite the whole file with:

```tsx
// src/components/WinterServiceCard.tsx
import Link from "next/link";
import { Snowflake, Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";
import type { WinterService } from "@/lib/winter";
import { BlurImage, hasBlurImage } from "@/components/BlurImage";

const ICONS: Record<string, LucideIcon> = {
  snowflake: Snowflake,
  sparkles: Sparkles,
  shield: ShieldCheck,
};

export function WinterServiceIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = ICONS[icon] ?? Snowflake;
  return <Icon className={className} aria-hidden />;
}

export function WinterServiceCard({
  service,
  tone = "light",
}: {
  service: WinterService;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const shell = `group flex h-full flex-col rounded-3xl border transition-colors ${
    dark
      ? "border-emerald-700/40 bg-emerald-800/40 hover:bg-emerald-800/70"
      : "border-neutral-200 bg-white hover:border-emerald-700"
  }`;
  const tagline = dark ? "text-emerald-100/80" : "text-neutral-600";
  const cta = dark ? "text-emerald-200" : "text-emerald-700";

  if (hasBlurImage(service.image)) {
    return (
      <Link href={`/zima/${service.slug}`} className={`${shell} overflow-hidden`}>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          <BlurImage
            src={service.image}
            alt={service.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <span
            className={`absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl backdrop-blur ${
              dark ? "bg-emerald-900/60 text-emerald-100" : "bg-white/85 text-emerald-700"
            }`}
          >
            <WinterServiceIcon icon={service.icon} className="h-5 w-5" />
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <h3 className="text-lg font-semibold tracking-tight">{service.name}</h3>
          <p className={`mt-2 text-sm leading-relaxed ${tagline}`}>{service.tagline}</p>
          <span className={`mt-auto pt-5 text-sm font-medium ${cta}`}>
            Dowiedz się więcej →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/zima/${service.slug}`} className={`${shell} p-6 sm:p-7`}>
      <span
        className={`grid h-12 w-12 place-items-center rounded-2xl ${
          dark ? "bg-emerald-50/10 text-emerald-200" : "bg-emerald-50 text-emerald-700"
        }`}
      >
        <WinterServiceIcon icon={service.icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{service.name}</h3>
      <p className={`mt-2 text-sm leading-relaxed ${tagline}`}>{service.tagline}</p>
      <span className={`mt-auto pt-5 text-sm font-medium ${cta}`}>
        Dowiedz się więcej →
      </span>
    </Link>
  );
}
```

(The fallback branch is the original card verbatim — same classes, just with `tagline`/`cta` extracted to consts. `WinterServiceIcon` keeps its existing export and signature, so the `/zima/[usluga]` page's `import { WinterServiceIcon }` still works.)

- [ ] **Step 2: Verify**

Run:
```bash
npx tsc --noEmit
npx eslint src/components/WinterServiceCard.tsx
npx next build 2>&1 | tail -15
```
Expected: clean; build succeeds (`/zima` + `/zima/[usluga]` prerender). With no winter files, cards render the icon fallback (unchanged), no 404s.

- [ ] **Step 3: Commit**

```bash
git add src/components/WinterServiceCard.tsx
git commit -m "$(cat <<'EOF'
feat(zima): image-card variant for WinterServiceCard

When the service image is in the blur map, the card shows the photo (with
the lucide icon as an overlay badge); otherwise the current icon card.
Upgrades the /zima hub and the homepage winter section automatically.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Temporary populated-path smoke (verify, then revert)

Proves the hero + card actually render an image when one exists — without committing an off-theme photo. **This task makes NO commit and MUST leave the tree clean.**

**Files:** none committed (temporary file created and deleted)

- [ ] **Step 1: Drop a temporary winter image and regenerate the blur map**

```bash
mkdir -p public/img/winter
cp public/img/garden/snowdrop.jpg public/img/winter/snowDrive.jpg   # stand-in for odsniezanie
npm run blur                                                        # adds /img/winter/snowDrive.jpg to BLUR_DATA
grep -c "/img/winter/snowDrive.jpg" src/lib/blur-data.ts            # expect 1
```

- [ ] **Step 2: Build + smoke the populated path**

```bash
npx next build 2>&1 | tail -6
npx next start -p 3100 > /tmp/winter-smoke.log 2>&1 &
SRV=$!; for i in $(seq 1 40); do curl -s -o /dev/null localhost:3100/ && break; sleep 1; done
echo "=== /zima/odsniezanie hero blur present? (expect >= 1) ==="
curl -s localhost:3100/uslugi/koszenie >/dev/null  # warm
curl -s localhost:3100/zima/odsniezanie | grep -c "data:image/webp;base64,"
echo "=== /zima hub shows the odsniezanie card image? (expect >= 1) ==="
curl -s localhost:3100/zima | grep -c "/img/winter/snowDrive"
kill $SRV 2>/dev/null; wait $SRV 2>/dev/null
```
Expected: build OK; the `/zima/odsniezanie` blur count is `≥1` (hero image wired); the `/zima` hub references the winter image (`≥1`). (`/zima/swiateczne-oswietlenie` and `…-roslin` still fall back — their files weren't created — confirming the per-image gating.)

- [ ] **Step 3: Revert — remove the dummy and restore the blur map**

```bash
rm public/img/winter/snowDrive.jpg
rmdir public/img/winter 2>/dev/null || true
npm run blur                                          # removes the winter key again
git status --short                                    # expect: NO change to src/lib/blur-data.ts (back to committed)
git diff --stat src/lib/blur-data.ts                  # expect: empty
```
Expected: `git status --short` shows no tracked changes from this task (the dummy is gone, `blur-data.ts` is byte-identical to its committed state, `public/img/winter/` is empty/removed). If `blur-data.ts` shows a diff, the revert/regenerate didn't restore it — investigate before proceeding.

No commit.

---

## Task 6: Mind maintenance (the `docs(mind)` commit)

**Files:**
- Create: `kryscar-mind/map/decisions/winter-image-blur-gating.md`
- Modify: `kryscar-mind/map/zones/winter-services.md`, `brand-data.md`, `image-loading.md`
- Modify: `kryscar-mind/tech-debt/source-winter-imagery.md`
- Modify (regenerated): `kryscar-mind/map/index.md`
- Modify: `kryscar-mind/specs/2026-06-03-winter-service-images-design.md` (`status: draft` → `done`)

- [ ] **Step 1: Capture the last code commit SHA**

Run: `git rev-parse HEAD`
Use as `<SHA>` below (this is Task 4's commit — Task 5 made none).

- [ ] **Step 2: Create the decision record**

Create `kryscar-mind/map/decisions/winter-image-blur-gating.md`:

```markdown
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
```

- [ ] **Step 3: Re-stamp the three touched zone cards**

For each, read it first, then set `verifiedAt:` to `<SHA>` and `updated:` to `2026-06-03`, and make the noted change:

- `kryscar-mind/map/zones/winter-services.md` — add `"[[image-loading]]"` to `related:`; in prose note the `/zima/[usluga]` hero and `WinterServiceCard` now render service photos (gated on the blur map) and `winter.ts` sets `image` from `IMG`.
- `kryscar-mind/map/zones/brand-data.md` — in prose note the new winter `IMG` keys (`snowDrive`, `gardenLights`, `wrappedPlants`) under `public/img/winter`.
- `kryscar-mind/map/zones/image-loading.md` — add `"[[winter-services]]"` to `related:`; note the new `hasBlurImage` guard and that the winter hero/cards are consumers.

- [ ] **Step 4: Update the tech-debt note**

In `kryscar-mind/tech-debt/source-winter-imagery.md`: set `updated: 2026-06-03`; keep `status: open`; append to the `## Fix` section a line noting the **code is wired** (fetch-stock slots, `IMG` keys, `WinterService.image`, gated rendering via `hasBlurImage`); the remaining step is operational — run `PIXABAY_KEY=… bash scripts/fetch-stock.sh` then `npm run blur` and commit the photos + regenerated `blur-data.ts`.

- [ ] **Step 5: Flip the spec status**

In `kryscar-mind/specs/2026-06-03-winter-service-images-design.md`, change `status: draft` → `status: done`.

- [ ] **Step 6: Regenerate + gate**

```bash
npm run mind        # expect success, 14 zones (no new zone), no broken anchors
npm run check       # expect exit 0
```

- [ ] **Step 7: Commit (targeted — avoid unrelated `.obsidian/*` noise)**

```bash
git add \
  kryscar-mind/map/decisions/winter-image-blur-gating.md \
  kryscar-mind/map/zones/winter-services.md \
  kryscar-mind/map/zones/brand-data.md \
  kryscar-mind/map/zones/image-loading.md \
  kryscar-mind/tech-debt/source-winter-imagery.md \
  kryscar-mind/map/index.md \
  kryscar-mind/specs/2026-06-03-winter-service-images-design.md \
  kryscar-mind/plans/2026-06-03-winter-service-images-plan.md
git status --short   # confirm NO .obsidian file is staged
git commit -m "$(cat <<'EOF'
docs(mind): winter image gating decision; re-stamp zones; tech-debt update

Decision record for blur-map-gated winter images; re-stamp winter-services,
brand-data, image-loading; note source-winter-imagery is code-wired (photos
pending fetch); spec → done; regenerate index.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review (completed during planning)

**Spec coverage** — every spec section maps to a task:
- Unit 1 (fetch-stock winter slots) → Task 1 Step 1.
- Unit 2 (`IMG` winter keys) → Task 1 Step 2.
- Unit 3 (`winter.ts` image fields) → Task 1 Step 3.
- Unit 4 (`hasBlurImage`) → Task 2.
- Unit 5 (`/zima/[usluga]` hero) → Task 3.
- Unit 6 (`WinterServiceCard` image variant) → Task 4.
- Gating idea (no 404 pre-fetch) → Task 2 guard + Tasks 3/4 conditionals; proven in Task 5.
- Verification (fallback path + temporary populated smoke + revert) → Tasks 3/4 + Task 5.
- Mind (decision, re-stamps, tech-debt update) → Task 6.

**Placeholder scan** — no `TBD`/`TODO`/"add error handling"/"similar to Task N"; every code/command step is concrete.

**Type consistency** — `hasBlurImage(src): src is string` (Task 2) is used to narrow `svc.image`/`service.image` (`string | undefined` on `WinterService`) in Tasks 3 & 4 before passing to `BlurImage`'s `src` (string). `IMG.snowDrive`/`gardenLights`/`wrappedPlants` (Task 1 Step 2) match the values assigned in Task 1 Step 3 and the keys the generator will emit (`/img/winter/<name>.jpg`). `WinterServiceIcon` keeps its export/signature so the `/zima/[usluga]` page import is unaffected. `BlurImage` props used (`src`, `alt`, `fill`, `preload`, `className`, `sizes`) are all valid `ImageProps`.

**Out of scope (unchanged):** `/uslugi`, `/ogrodnik`, `/example-N`; a separate hub-hero banner; populating the actual photos (user runs the fetch).
