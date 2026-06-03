---
type: decision
summary: "The mobile nav is a real shadcn Sheet (Radix Dialog) sliding from the left, not a hand-rolled dropdown; it carries the mobile actions (Zaloguj/Panel + CTA + tap-to-call) so the collapsed mobile bar can be just logo + hamburger, and the desktop header drops the phone number."
tags: [ui, nav, auth, frontend]
status: active
created: 2026-06-03
updated: 2026-06-04
related: ["[[layout-chrome]]", "[[auth-portal]]", "[[nav-auth-client-islands]]"]
sources: ["[[2026-06-03-nav-cleanup-mobile-sheet-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
The desktop header carried a phone number we wanted gone, and the mobile menu was a hand-rolled `absolute top-full` dropdown with hand-rolled Escape/scroll-lock and no focus trap. The repo is already fully on shadcn + the `radix-ui` umbrella.
## Decision
Use the real shadcn `Sheet` (Radix Dialog) for the mobile menu — a left-side drawer over a scrim — and add `tw-animate-css` for its slide animation. Move the mobile Zaloguj/Panel + "Zamów wycenę" CTA into the drawer so the collapsed mobile bar is just logo + hamburger. Remove the phone number from the desktop header (kept in the drawer as tap-to-call + in the footer).
## Why
Radix Dialog gives focus-trap, scroll-lock, Escape, and inert background for free — more accessible than the hand-rolled version and faithful to "make it a shadcn slider". Consistent with the existing `src/components/ui/` components. `MobileNav`/`HeaderAuth` stay client islands, so the marketing pages remain statically generated.
## Consequences
One new dev-dependency (`tw-animate-css`) and a `Sheet` primitive now available repo-wide. `MobileNav` derives its session-aware link inline from `useSession` (same source as `HeaderAuth`), so no new shared abstraction. A visually-hidden `SheetDescription` satisfies the Radix dialog-description a11y requirement. Desktop bar behaviour is otherwise unchanged.
