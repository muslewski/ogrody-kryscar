# Nav Cleanup + Mobile Sheet Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the phone number from the desktop header, slim the collapsed mobile bar to logo + hamburger, and replace the hand-rolled mobile dropdown with a real shadcn `Sheet` drawer that slides in from the left (session-aware, carrying nav links + Zaloguj/Panel + the CTA + tap-to-call).

**Architecture:** Add the shadcn `Sheet` component (Radix Dialog via the `radix-ui` umbrella package, matching the existing `src/components/ui/*` convention) plus the `tw-animate-css` utility its slide animation needs. Rewrite `MobileNav` on top of `Sheet` (Radix gives focus-trap, scroll-lock, Escape, inert background for free). Trim `SiteHeader` so the phone link is gone and the bar's auth + CTA are desktop-only. `MobileNav`/`HeaderAuth` stay client islands, so marketing pages remain statically generated.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind v4, shadcn (new-york), `radix-ui` umbrella, `lucide-react`, Better Auth `useSession`.

**Verification model:** This repo has **no unit-test framework**. The verification gate is `npm run check` (`tsc --noEmit && eslint && payload generate:types && node scripts/mind/generate.mjs`) plus a Turbopack build and a manual browser pass at `http://localhost:1111`. Each task ends by running these and committing.

---

## File Structure

- **Create** `src/components/ui/sheet.tsx` — the shadcn Sheet primitives (Radix Dialog). One responsibility: the reusable drawer/dialog shell.
- **Modify** `src/app/globals.css` — add the `tw-animate-css` import (one line) so Sheet's `animate-in`/`slide-in-from-left` classes resolve.
- **Modify** `package.json` / lockfile — add `tw-animate-css` dev-dependency.
- **Rewrite** `src/components/MobileNav.tsx` — the `< md` hamburger now opens a left `Sheet`; contents = nav links + session-aware Zaloguj/Panel + CTA + tap-to-call.
- **Modify** `src/components/SiteHeader.tsx` — drop the desktop phone `tel:` block; make the bar's `HeaderAuth` + CTA desktop-only.
- **Modify** `kryscar-mind/map/zones/layout-chrome.md` + **create** `kryscar-mind/map/decisions/mobile-nav-sheet-drawer.md` — Mind maintenance.

`HeaderAuth.tsx` is **not** changed: `MobileNav` derives its own session-aware link inline from the same `useSession` hook (two lines), avoiding a new shared abstraction (YAGNI) while keeping one session source.

---

## Task 1: Add the shadcn Sheet component + animation utility

**Files:**
- Create: `src/components/ui/sheet.tsx`
- Modify: `src/app/globals.css:1` (add import after the tailwind import)
- Modify: `package.json` (dev-dependency, via npm)

- [ ] **Step 1: Install the animation utility**

Run:
```bash
npm install -D tw-animate-css
```
Expected: `tw-animate-css` is added under `devDependencies`; lockfile updates; no peer-dep errors.

- [ ] **Step 2: Import it in globals.css**

In `src/app/globals.css`, the first line is currently:
```css
@import "tailwindcss";
```
Change the top of the file to:
```css
@import "tailwindcss";
@import "tw-animate-css";
```
(Leave the rest of the file — `@theme { ... }` — untouched.)

- [ ] **Step 3: Create the Sheet component**

Create `src/components/ui/sheet.tsx` with exactly this content (matches the repo's `radix-ui` umbrella + `data-slot` + `cn` convention, e.g. `separator.tsx`):

```tsx
"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <X className="size-4" />
          <span className="sr-only">Zamknij</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```

- [ ] **Step 4: Type-check + lint**

Run:
```bash
npm run check
```
Expected: PASS — `tsc --noEmit` clean, `eslint` clean, payload types regenerate, mind generator runs without broken anchors. (The new file is not yet imported anywhere; this just proves it compiles.)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/sheet.tsx src/app/globals.css package.json package-lock.json
git commit -m "feat(ui): add shadcn Sheet component + tw-animate-css

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Rewrite MobileNav as a left Sheet drawer

**Files:**
- Rewrite: `src/components/MobileNav.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/components/MobileNav.tsx` with:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { COMPANY, NAV_LINKS } from "@/lib/data";
import { useSession } from "@/lib/auth-client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Responsive mobile navigation (`< md`). A hamburger that opens a shadcn Sheet
 * drawer sliding in from the left over a dimmed scrim — Radix Dialog provides
 * the focus-trap, scroll-lock, Escape, and inert background. The drawer carries
 * the nav links plus the actions the minimal mobile bar no longer shows: the
 * session-aware Zaloguj/Panel link, the "Zamów wycenę" CTA, and a tap-to-call.
 * A client island, so the marketing pages stay statically generated.
 */
export function MobileNav() {
  const { data, isPending } = useSession();
  const loggedIn = !isPending && Boolean(data);
  const authHref = loggedIn ? "/panel" : "/sign-in";
  const authLabel = loggedIn ? "Panel" : "Zaloguj";

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger
          aria-label="Otwórz menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </SheetTrigger>

        <SheetContent side="left" className="w-[84%] max-w-xs gap-0 p-0">
          <SheetHeader className="flex-row items-center gap-2.5 border-b border-neutral-200 p-4">
            <Image
              src="/logo.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-md"
            />
            <SheetTitle className="text-base tracking-tight">
              {COMPANY.name}
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 text-sm">
            {NAV_LINKS.map((l) => (
              <SheetClose asChild key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-lg px-3 py-2.5 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-emerald-700"
                >
                  {l.label}
                </Link>
              </SheetClose>
            ))}
          </nav>

          <div className="flex flex-col gap-3 border-t border-neutral-200 p-4">
            <SheetClose asChild>
              <Link
                href={authHref}
                className="text-sm font-medium text-neutral-700 transition-colors hover:text-emerald-700"
              >
                {authLabel} →
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/#kontakt"
                className="rounded-full bg-neutral-900 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Zamów wycenę
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="text-sm text-neutral-500 transition-colors hover:text-emerald-700"
              >
                {COMPANY.phone}
              </a>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + lint**

Run:
```bash
npm run check
```
Expected: PASS. (`MobileNav` already imported by `SiteHeader`, so this also proves the wiring compiles.)

- [ ] **Step 3: Commit**

```bash
git add src/components/MobileNav.tsx
git commit -m "feat(nav): mobile menu is now a left shadcn Sheet drawer

Carries nav links + session-aware Zaloguj/Panel + CTA + tap-to-call;
Radix Dialog replaces the hand-rolled escape/scroll-lock logic.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Trim SiteHeader (remove desktop phone; auth + CTA desktop-only)

**Files:**
- Modify: `src/components/SiteHeader.tsx` (the right-side action group, currently lines ~47-63)

- [ ] **Step 1: Replace the right-side action group**

In `src/components/SiteHeader.tsx`, find this block:

```tsx
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="hidden text-sm text-neutral-700 hover:text-emerald-700 md:block"
            >
              {COMPANY.phone}
            </a>
            <HeaderAuth variant="header" />
            <Link
              href="/#kontakt"
              className="rounded-full bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 sm:px-4 sm:text-sm"
            >
              <span className="sm:hidden">Wycena</span>
              <span className="hidden sm:inline">Zamów wycenę</span>
            </Link>
            <MobileNav />
          </div>
```

Replace it with (phone gone; auth + CTA wrapped `hidden md:flex`; CTA text simplified since it is now desktop-only):

```tsx
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:gap-3 md:flex">
              <HeaderAuth variant="header" />
              <Link
                href="/#kontakt"
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Zamów wycenę
              </Link>
            </div>
            <MobileNav />
          </div>
```

- [ ] **Step 2: Drop the now-unused phone import**

`COMPANY` is still used (logo `alt`, brand name), so keep the import line:
```tsx
import { COMPANY, NAV_LINKS } from "@/lib/data";
```
No import change is needed — `COMPANY.phone`/`COMPANY.phoneRaw` simply stop being referenced. (Confirm eslint does not flag anything in the next step.)

- [ ] **Step 3: Type-check + lint**

Run:
```bash
npm run check
```
Expected: PASS — no unused-var warnings (COMPANY still used; NAV_LINKS still used by the desktop nav map).

- [ ] **Step 4: Build (prove marketing pages stay static)**

Run:
```bash
npm run build
```
Expected: build succeeds; the route table still shows the marketing routes (`/`, `/realizacje`, etc.) as statically generated (`○`), not `ƒ`. (`/sign-in`, `/sign-up` remain `ƒ` as before — unchanged by this work.)

- [ ] **Step 5: Commit**

```bash
git add src/components/SiteHeader.tsx
git commit -m "feat(nav): drop desktop phone number; minimal mobile bar

Desktop bar keeps Zaloguj + CTA; on mobile they move into the drawer,
leaving logo + hamburger only.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Browser verification

**Files:** none (manual verification)

- [ ] **Step 1: Start the dev server**

Run (background):
```bash
npm run dev
```
Expected: ready on `http://localhost:1111`.

- [ ] **Step 2: Desktop checks (viewport ≥ md, e.g. 1280px)**

Verify at `http://localhost:1111/`:
- The header right group shows **Zaloguj** + **Zamów wycenę** only — **no phone number**.
- Nav links render as before; winter banner (if in season) unaffected.

- [ ] **Step 3: Mobile checks (viewport < md, e.g. 390px)**

Verify at `http://localhost:1111/`:
- The bar shows **only the logo + hamburger** (no Zaloguj, no CTA, no phone).
- Tapping the hamburger opens a sheet **sliding in from the left** over a dimmed scrim.
- Drawer shows: logo + "Kryscar Ogrody" header with an ✕; the 7 nav links; then **Zaloguj** (logged out) / **Panel** (logged in), a full-width **Zamów wycenę** button, and the tap-to-call number.
- Closing works via: ✕, scrim click/tap, Escape, and tapping any link. Body scroll is locked while open.
- Tapping a nav link closes the drawer and navigates.

- [ ] **Step 4: Logged-in check**

Sign in (existing customer), return to `/`, open the mobile drawer:
- The auth row reads **Panel** (→ `/panel`), not Zaloguj.

- [ ] **Step 5: Stop the dev server**

Stop the background `npm run dev`.

---

## Task 5: Mind maintenance (same change, not a follow-up)

**Files:**
- Modify: `kryscar-mind/map/zones/layout-chrome.md`
- Create: `kryscar-mind/map/decisions/mobile-nav-sheet-drawer.md`
- Modify (generated): `kryscar-mind/map/index.md`

- [ ] **Step 1: Update the layout-chrome zone**

In `kryscar-mind/map/zones/layout-chrome.md`:
- Add `src/components/ui/sheet.tsx` to `owns.globs`.
- In the **Auth + responsive** paragraph, replace the description of `MobileNav` as a "hamburger → dropdown menu" with: the mobile menu is now a **shadcn `Sheet` drawer (Radix Dialog) sliding from the left**, carrying the nav links + session-aware Zaloguj/Panel + the "Zamów wycenę" CTA + a tap-to-call; the **desktop header no longer shows the phone number**, and on mobile the bar is **logo + hamburger only** (auth + CTA live in the drawer).
- Re-stamp `verifiedAt` to current HEAD (see Step 4 for the value).

- [ ] **Step 2: Add the decision record**

Create `kryscar-mind/map/decisions/mobile-nav-sheet-drawer.md`:

```markdown
---
type: decision
summary: "The mobile nav is a real shadcn Sheet (Radix Dialog) sliding from the left, not a hand-rolled dropdown; it carries the mobile actions (Zaloguj/Panel + CTA + tap-to-call) so the collapsed mobile bar can be just logo + hamburger, and the desktop header drops the phone number."
tags: [ui, nav, auth, frontend]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[layout-chrome]]", "[[auth-portal]]", "[[nav-auth-client-islands]]"]
sources: ["[[2026-06-03-nav-cleanup-mobile-sheet-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
The desktop header carried a phone number we wanted gone, and the mobile menu was a
hand-rolled `absolute top-full` dropdown with hand-rolled Escape/scroll-lock and no
focus trap. The repo is already fully on shadcn + the `radix-ui` umbrella.
## Decision
Use the real shadcn `Sheet` (Radix Dialog) for the mobile menu — a left-side drawer over a
scrim — and add `tw-animate-css` for its slide animation. Move the mobile Zaloguj/Panel +
"Zamów wycenę" CTA into the drawer so the collapsed mobile bar is just logo + hamburger.
Remove the phone number from the desktop header (kept in the drawer as tap-to-call + in the footer).
## Why
Radix Dialog gives focus-trap, scroll-lock, Escape, and inert background for free — more
accessible than the hand-rolled version and faithful to "make it a shadcn slider". Consistent
with the existing `src/components/ui/` components. `MobileNav`/`HeaderAuth` stay client islands,
so the marketing pages remain statically generated.
## Consequences
One new dev-dependency (`tw-animate-css`) and a `Sheet` primitive now available repo-wide.
`MobileNav` derives its session-aware link inline from `useSession` (same source as `HeaderAuth`),
so no new shared abstraction. Desktop bar behaviour is otherwise unchanged.
```

- [ ] **Step 3: Regenerate the Mind index**

Run:
```bash
npm run mind
```
Expected: regenerates `kryscar-mind/map/index.md` with no broken-anchor errors.

- [ ] **Step 4: Re-stamp verifiedAt and commit**

Get HEAD and stamp the zone's `verifiedAt` to it:
```bash
git rev-parse HEAD
```
Set `verifiedAt: "<that hash>"` in `kryscar-mind/map/zones/layout-chrome.md`, re-run `npm run mind`, then:

```bash
git add kryscar-mind/
git commit -m "docs(mind): mobile nav Sheet drawer — update layout-chrome zone + decision

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Desktop phone removed → Task 3. ✅
- Minimal mobile bar (logo + hamburger) → Task 3 (auth + CTA `hidden md:flex`). ✅
- Left-side shadcn Sheet drawer → Tasks 1-2. ✅
- Drawer contents (nav + Zaloguj/Panel + CTA + tap-to-call) → Task 2. ✅
- Session-aware login in drawer → Task 2 (`useSession`). ✅
- `tw-animate-css` dependency + import → Task 1. ✅
- Static-generation invariant preserved → Task 3 Step 4 (build shows `○`). ✅
- a11y dialog name (`SheetTitle`) → Task 2 (visible title). ✅
- Mind maintenance (zone + decision + regen) → Task 5. ✅

**Placeholder scan:** No TBD/TODO; every code step shows full code; commands have expected output. ✅

**Type/name consistency:** `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetTitle` exported in Task 1 and exactly those imported in Task 2. `authHref`/`authLabel`/`loggedIn` consistent within Task 2. `COMPANY.phoneRaw`/`COMPANY.phone`/`NAV_LINKS` match `src/lib/data.ts`. lucide `Menu` + `X` and `radix-ui` `Dialog` confirmed exported. ✅
