---
type: spec
summary: "Remove the desktop phone number from the header, slim the collapsed mobile bar to logo + hamburger, and replace the hand-rolled mobile dropdown with a real shadcn Sheet drawer sliding from the left (session-aware, holds nav + Zaloguj/Panel + CTA + tap-to-call)."
tags: [ui, nav, auth]
status: active
created: 2026-06-03
related: ["[[layout-chrome]]", "[[auth-portal]]"]
supersedes: []
---

# Nav cleanup + mobile sheet drawer — design

## Context

The site header (`SiteHeader.tsx`) currently shows, on the desktop right-side group:
the phone number (`tel:` link) · `HeaderAuth` (Zaloguj/Panel) · the "Zamów wycenę" CTA.
On mobile that same group is crowded (Zaloguj + CTA are always visible in the bar),
and the mobile menu (`MobileNav.tsx`) is a hand-rolled dropdown panel that drops down
*under* the sticky header (`absolute top-full`) — functional but visually weak, with
hand-rolled Escape/scroll-lock logic and no focus trap.

Two requests:
1. Remove the phone number from the **desktop** navigation.
2. Make the mobile menu look better — "more like a shadcn slider" (i.e. a sheet drawer).

The repo is already fully set up for shadcn (new-york style, `components.json`, the
`radix-ui` umbrella package incl. `react-dialog`, `cn` util, lucide icons, several
`src/components/ui/*` components). It does **not** yet have an animation utility
(no `tw-animate-css` / `tailwindcss-animate`; `globals.css` only `@import "tailwindcss"`).

## Goals

- Desktop header no longer renders the phone number.
- Collapsed mobile bar is minimal: **logo + hamburger only**.
- Mobile menu becomes a **shadcn Sheet** drawer that slides in from the **left** over a
  dimmed scrim, with accessible dialog semantics (focus-trap, scroll-lock, Escape, inert
  background) provided by Radix Dialog — not hand-rolled.
- The drawer is **session-aware** and consolidates the mobile actions (Zaloguj/Panel + CTA)
  plus a tap-to-call phone number.
- Marketing pages stay statically generated (the nav stays a client island).

## Non-goals

- No change to desktop nav links, the winter banner, the footer, or `HeaderAuth`'s desktop
  behaviour beyond hiding the bar's auth/CTA on mobile.
- No change to auth/session logic, routes, or the `/panel` · `/zespol` gates.
- No removal of the phone number from the site entirely — it stays in the footer and now
  in the mobile drawer; only the **desktop header** loses it.

## Decisions (from brainstorming)

- **Drawer side:** left (chosen over right).
- **Collapsed mobile bar:** minimal — logo + hamburger only (auth + CTA move into the drawer).
- **Phone number:** removed from the desktop bar; kept on mobile as a tap-to-call inside the drawer.
- **Build approach:** the real shadcn `Sheet` (Radix Dialog) + `tw-animate-css`, not a
  hand-rolled drawer — most faithful to "shadcn slider", more accessible, consistent with
  the existing `src/components/ui/` components.

## Design

### 1. `src/components/ui/sheet.tsx` (new)
Add the shadcn Sheet component (Radix Dialog primitives: `Sheet`, `SheetTrigger`,
`SheetContent`, `SheetHeader`, `SheetTitle`, `SheetClose`, overlay). `SheetContent` supports
a `side` prop; we use `side="left"`. It is a `"use client"` component.

### 2. Animation utility
shadcn Sheet relies on `data-[state=open]:animate-in` / `slide-in-from-left` style classes.
Add `tw-animate-css` (the Tailwind v4 successor to `tailwindcss-animate`) as a dev-dependency
and `@import "tw-animate-css";` in `src/app/globals.css` (right after the tailwind import).
This is the one new dependency.

### 3. `SiteHeader.tsx`
- **Remove** the desktop phone `tel:` block entirely.
- Wrap the bar's `HeaderAuth` and the "Zamów wycenę" CTA so they are **desktop-only**
  (`hidden md:flex` / `hidden md:inline-flex` as appropriate) — on mobile they no longer
  appear in the bar; the drawer carries them. The result: mobile bar = logo + `<MobileNav />`.
- `COMPANY.phone` / `COMPANY.phoneRaw` remain imported only if still used; otherwise drop the
  now-unused import.

### 4. `MobileNav.tsx` (rewrite on top of Sheet)
- Replace the hand-rolled open-state + `useEffect` (Escape/scroll-lock) and the
  `absolute top-full` panel with `<Sheet>` + `<SheetContent side="left">`. Radix provides the
  trigger wiring, focus trap, scroll lock, Escape, and inert background.
- Trigger: the hamburger button (`md:hidden`), `aria-label` "Otwórz menu" (lucide `Menu` icon).
- Drawer contents, top → bottom:
  - **Header:** logo + "Kryscar Ogrody" + a `SheetClose` (lucide `X`), via `SheetHeader`/`SheetTitle`
    (title can be visually present or `sr-only` for the dialog-name a11y requirement).
  - **Nav links:** map `NAV_LINKS` to tappable full-width rows; each closes the sheet on tap
    (wrap in `SheetClose asChild` or call the controlled `onOpenChange(false)`).
  - **Footer block:** session-aware **Zaloguj/Panel** (reuse the `useSession` truth — render
    `HeaderAuth` with a drawer-appropriate variant, or an inline `useSession` link), the
    **Zamów wycenę** CTA as a full-width button (→ `/#kontakt`), and a **tap-to-call**
    `tel:${COMPANY.phoneRaw}` showing `COMPANY.phone`. Each link closes the sheet on tap.
- Stays a `"use client"` island, so `/`, `/realizacje`, etc. remain statically generated.

### 5. Session-aware login inside the drawer
Keep a single source of session truth. Preferred: extend `HeaderAuth` with a `variant`
suited to the drawer footer (full-width button-ish link), or render its existing link and
style via a wrapper. Logged-in → "Panel" (→ `/panel`; the gate routes gardeners to `/zespol`),
logged-out → "Zaloguj" (→ `/sign-in`). No role needed in the session (same as today).

## Data flow / invariants preserved

- **Static generation:** `SiteHeader`/`SiteFooter` stay server components; `MobileNav` +
  `HeaderAuth` remain client islands. No page flips from `○` to `ƒ`. (Invariant from
  [[nav-auth-client-islands]].)
- **SiteHeader is the single canonical header** rendering the winter banner; pages that
  render it keep `revalidate = 86400`. Unchanged.
- **Section links stay root-relative** (`/#...`) so they work from any page. Unchanged.

## Edge cases

- **Logged-in user on mobile:** drawer footer shows "Panel", not "Zaloguj".
- **Session still resolving:** show the logged-out label (it's a link either way → no layout
  jump), same as `HeaderAuth` today.
- **Dialog a11y:** `SheetContent` must have an accessible name — provide a `SheetTitle`
  (visible or `sr-only`) to avoid the Radix missing-title warning.
- **Animation absent:** if `tw-animate-css` is not wired, the sheet would pop without sliding;
  the import in `globals.css` is required for the slide.

## Testing / verification

- `npm run check` (Mind generator + lint/build as configured) passes; no broken anchors.
- Build shows marketing routes still statically generated (`○`).
- Manual / browser check at `localhost:1111`:
  - Desktop ≥ md: no phone number in the header; Zaloguj + CTA present.
  - Mobile < md: bar = logo + hamburger only; tapping opens a left sheet over a scrim;
    Escape / scrim-click / link-tap close it; body scroll locks while open.
  - Drawer shows nav links + Zaloguj (or Panel when logged in) + full-width CTA + tap-to-call.

## Mind maintenance (on finish)

- Update zone [[layout-chrome]] (mobile nav is now a Sheet drawer; bar is minimal on mobile;
  desktop phone removed) and re-stamp `verifiedAt` to HEAD.
- Add a decision record for "mobile nav = shadcn Sheet (Radix Dialog), drawer carries the
  mobile actions" under `kryscar-mind/map/decisions/`.
- Note the new `tw-animate-css` dependency where dependencies are tracked.
- `npm run mind` and commit the regenerated `kryscar-mind/map/index.md`.
