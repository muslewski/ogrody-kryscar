# Order-Page Header Garden Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the lawn's Static-Maps snapshot as a full-width banner in the `/panel/ogrody/[id]/zamow` header, via a shared `LawnSnapshot` component reused by the lawn card.

**Architecture:** Extract the card's inline snapshot `<img>`/fallback into one server component `LawnSnapshot`; the card and the new order-header banner both render it (DRY). Presentational only — no data/schema change.

**Tech Stack:** Next.js 16 (RSC), Tailwind v4, Google Static Maps (via existing `buildStaticMapUrl`).

---

## Conventions
- Gate = `npm run check`. The 3 pre-existing `<img>` warnings are expected. The suppressed `<img>` moves from `LawnCard` into `LawnSnapshot` — net count stays 3 (no new warning).
- Pages render inside AppShell `<main>` — plain `<div>`.

---

### Task 1: Shared `LawnSnapshot` + refactor `LawnCard`

**Files:** Create `src/components/lawns/LawnSnapshot.tsx`; Modify `src/components/lawns/LawnCard.tsx`

- [ ] **Step 1: Create `src/components/lawns/LawnSnapshot.tsx`**
```tsx
import { buildStaticMapUrl } from "@/lib/maps";
import type { LawnPoint } from "@/lib/lawn-types";

/**
 * Shared Static-Maps snapshot of a lawn: the emerald outline + red building
 * overlays over hybrid imagery. Rendered by the lawn card and the order-page
 * header so they never drift. Falls back to a neutral note when there's no
 * snapshot URL (missing key / fewer than 3 vertices).
 */
export function LawnSnapshot({
  polygon,
  buildings,
  alt,
  width = 480,
  height = 220,
  className,
}: {
  polygon: LawnPoint[];
  buildings: LawnPoint[][];
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const url = buildStaticMapUrl(polygon, { width, height, buildings });
  if (!url) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        Podgląd mapy niedostępny
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className={className} />
  );
}
```

- [ ] **Step 2: Refactor `src/components/lawns/LawnCard.tsx` to use it**
Replace the imports block at the top:
```tsx
import Link from "next/link";

import type { LawnView } from "@/lib/lawn-types";
import { LawnActionsMenu } from "./LawnActionsMenu";
import { LawnSnapshot } from "./LawnSnapshot";
```
Remove the `const snapshot = buildStaticMapUrl(...)` block entirely (the function body now starts straight at `return (`), and replace the image `<div className="relative aspect-[16/8] ...">` inner `{snapshot ? (...) : (...)}` block with the component. The image area becomes:
```tsx
      <div className="relative aspect-[16/8] bg-emerald-900/10">
        <LawnSnapshot
          polygon={lawn.polygon}
          buildings={lawn.buildings}
          alt={`Mapa — ${lawn.name}`}
          width={480}
          height={220}
          className="h-full w-full object-cover"
        />
        <span className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 shadow">
          {lawn.areaM2.toLocaleString("pl-PL")} m²
        </span>
      </div>
```
(Everything below the image area — the `p-4` body with name/address/buttons — stays exactly as-is.)

- [ ] **Step 3: Verify**
Run: `npm run check`
Expected: 0 errors, exactly the 3 known `<img>` warnings (the suppressed `<img>` now lives in `LawnSnapshot.tsx` instead of `LawnCard.tsx` — count unchanged). Confirm `buildStaticMapUrl` is no longer imported in `LawnCard.tsx` (would be an unused-import error otherwise).

- [ ] **Step 4: Commit**
```bash
git add src/components/lawns/LawnSnapshot.tsx src/components/lawns/LawnCard.tsx
git commit -m "refactor(lawns): extract shared LawnSnapshot from LawnCard"
```

---

### Task 2: Order-page header banner

**Files:** Modify `src/app/(app)/panel/ogrody/[id]/zamow/page.tsx`

- [ ] **Step 1: Add the import**
Add with the other imports:
```tsx
import { LawnSnapshot } from "@/components/lawns/LawnSnapshot";
```

- [ ] **Step 2: Replace the header block**
Replace the existing header `<div className="mb-4 flex items-center justify-between"> … </div>` (the label + h1 + Wróć row) with a bordered card whose top is the banner and whose body is the title row:
```tsx
      <div className="mb-4 overflow-hidden rounded-2xl border border-neutral-200">
        <div className="relative aspect-[16/6] bg-emerald-900/10">
          <LawnSnapshot
            polygon={lawn.polygon}
            buildings={lawn.buildings}
            alt={`Mapa — ${lawn.name}`}
            width={960}
            height={360}
            className="h-full w-full object-cover"
          />
          <span className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 shadow">
            {lawn.areaM2.toLocaleString("pl-PL")} m²
          </span>
        </div>
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">Zamów usługi</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {lawn.name} · {lawn.areaM2.toLocaleString("pl-PL")} m²
            </h1>
          </div>
          <Link href="/panel/ogrody" className="text-sm text-neutral-500 hover:text-emerald-700">
            ← Wróć
          </Link>
        </div>
      </div>
```
(The `<ServiceConfigurator ... />` below it stays unchanged.)

- [ ] **Step 3: Verify**
Run: `npm run check`
Expected: 0 errors, 3 known warnings.

- [ ] **Step 4: Commit**
```bash
git add src/app/\(app\)/panel/ogrody/\[id\]/zamow/page.tsx
git commit -m "feat(requests): garden preview banner in order-page header"
```

---

### Task 3: Mind (light)

**Files:** Modify `kryscar-mind/map/zones/customer-lawns.md`

- [ ] **Step 1:** Add `"symbol:LawnSnapshot"` to the zone's `owns.anchors` and a one-line note in the body that `LawnSnapshot` is the shared snapshot used by the card AND the order-page header. Re-stamp `verifiedAt` to HEAD (`git rev-parse HEAD`).
- [ ] **Step 2:** Run `npm run check` — Mind clean, the new `symbol:LawnSnapshot` anchor resolves, 0 errors + 3 known warnings.
- [ ] **Step 3:** Commit:
```bash
git add kryscar-mind/
git commit -m "docs(mind): note shared LawnSnapshot anchor on customer-lawns"
```

---

## Final verification
- [ ] `npm run check` passes (3 known warnings).
- [ ] Visual (controller-noted): the order header shows the banner snapshot + area chip; the lawn card looks identical to before.

## Self-review
- **Spec coverage:** shared `LawnSnapshot` (T1), card refactor (T1), order-header banner (T2), fallback handled in the component (T1), Mind anchor (T3). All spec points mapped.
- **Type consistency:** `LawnSnapshot({polygon, buildings, alt, width?, height?, className?})` used identically in card + header; `buildStaticMapUrl` signature unchanged.
- **No-new-warning:** the suppressed `<img>` relocates card→component; net warning count stays 3.
