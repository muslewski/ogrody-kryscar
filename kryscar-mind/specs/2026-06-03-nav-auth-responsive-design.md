---
type: spec
summary: "Bring customer auth onto the public marketing site: a session-aware Zaloguj/Panel button in the header + footer, a responsive mobile nav (the header currently has none), and a small signup hardening (redirect logged-in users away from /sign-in /sign-up). Marketing pages stay static via client islands."
tags: [auth, frontend, ui]
status: draft
created: 2026-06-03
updated: 2026-06-03
related: ["[[auth-portal]]", "[[layout-chrome]]", "[[customer-auth]]"]
sources: []
origin: "User: ensure customers can sign up; add a Zaloguj entry to nav (left of the Kontakt CTA) + footer; make the navigation responsive."
---
# Nav auth + responsive navigation — Design

**Goal:** Expose the customer auth we built (`/sign-in`, `/sign-up`, `/panel`) on the public site so people can find and use it, and fix the missing mobile menu.

## Approved decisions
- **Session-aware auth button** (option B): logged out → "Zaloguj" → `/sign-in`; logged in → "Panel" → `/panel`. Implemented as a **client island** so the marketing pages stay statically generated.
- **Responsive nav**: the desktop nav is `hidden md:flex` with no mobile fallback — add a hamburger + dropdown panel for `< md`.
- **Signup already works** — only light hardening (redirect logged-in users away from the auth screens). No email verification / reset / OAuth / confirm-password (tracked in tech-debt).

## Components (client islands keep pages static)
1. **`src/components/HeaderAuth.tsx`** (`"use client"`) — uses `authClient.useSession()`. While `isPending` or unauthenticated → render "Zaloguj" → `/sign-in`; authenticated → "Panel" → `/panel` (gardeners are auto-routed to `/zespol` by the existing gate, so one link covers both roles). Accepts a `variant` prop (`header` pill vs `inline` link) so it can be reused in the header, the mobile menu, and the footer.
2. **`src/components/MobileNav.tsx`** (`"use client"`) — a hamburger button shown only `< md`. Opens a full-width panel that drops down under the sticky header: `NAV_LINKS` stacked → phone → `<HeaderAuth>` → "Zamów wycenę" CTA. Closes on link tap, outside click, and Escape; locks body scroll while open. `useState` for open; the trigger has `aria-expanded` / `aria-controls`.
3. **`NAV_LINKS`** in `src/lib/data.ts` — the 7 header links as `{ href, label }[]`, consumed by both the desktop nav (server) and `MobileNav` (client). Single source of truth.

## File touch list
- **Modify** `src/lib/data.ts` — add `NAV_LINKS`.
- **Create** `src/components/HeaderAuth.tsx`, `src/components/MobileNav.tsx`.
- **Modify** `src/components/SiteHeader.tsx` — desktop nav maps `NAV_LINKS`; right group adds `<HeaderAuth variant="header" />` left of the "Zamów wycenę" CTA; add `<MobileNav />` (hamburger) for `< md`.
- **Modify** `src/components/SiteFooter.tsx` — add a session-aware account link (`<HeaderAuth variant="inline" />`) in the Firma column.
- **Modify** `src/app/(app)/sign-in/page.tsx` + `sign-up/page.tsx` — server-side `auth.api.getSession`; if a session exists, `redirect("/panel")`.

## Layout
- Header desktop (≥md): `logo · [NAV_LINKS] · phone · Zaloguj/Panel · Zamów wycenę`.
- Header mobile (<md): `logo · Zaloguj/Panel · ☰` → dropdown panel.
- Footer: session-aware account link in the Firma column.

## Out of scope (tracked in tech-debt)
Email verification, password reset → `defer-email-verification`. OAuth/social → `defer-oauth-social-signin`. Public-signup rate-limit/bot protection → `harden-public-signup`. No "confirm password" field.

## Verification
- `npx tsc --noEmit` + `npm run lint` clean.
- `npm run build` green; marketing routes stay static (`○`), not dynamic — confirm the client islands didn't force `/` etc. to `ƒ`. (`/sign-in` + `/sign-up` become `ƒ` — expected, they now read the session.)
- Browser (port 1111): desktop header shows "Zaloguj" left of "Zamów wycenę"; resize to mobile → hamburger opens the panel with links + Zaloguj + CTA; logged-out `/panel` still redirects to `/sign-in`.
