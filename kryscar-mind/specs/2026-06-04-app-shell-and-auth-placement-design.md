---
type: spec
summary: "Sub-project 1 of the customer-portal arc: move /sign-in + /sign-up into the marketing frontend (SiteHeader + SiteFooter, split lawnSuburb hero, noindex), and give /panel + /zespol a real shadcn `sidebar` app shell (role-driven nav, collapsible rail, mobile Sheet, user menu). Establishes the shadcn + a11y-first 'AI-navigable' convention, documented in the Mind."
tags: [ui, auth, app-shell, convention]
status: active
created: 2026-06-04
related: ["[[auth-portal]]", "[[layout-chrome]]", "[[customer-auth]]", "[[tenancy-and-roles]]", "[[ui-primitives]]"]
supersedes: []
---

# App shell & auth placement — design

## Context

This is **sub-project 1** of a larger customer-portal vision (decomposed into: 1 app
shell & auth placement → 2 services-as-Payload-collection → 3 customer "lawn" MVP →
4 Payload page-builder). It is the foundation the later sub-projects sit on.

Two problems today:
1. `/sign-up` (and `/sign-in`) have **no site chrome** — no nav, no footer, and not even
   the brand fonts. They live in the `(app)` route group under a minimal root layout
   (`src/app/(app)/layout.tsx`: just `<html>/<body>` + globals + noindex). They feel
   detached from the marketing site.
2. `/panel` (customer) and `/zespol` (gardener) are bare placeholder pages
   (`<main>` + a greeting + a `SignOutButton`). They need a real authenticated **app shell**.

Route-group facts (current):
- `(public)/layout.tsx` — marketing root layout: brand fonts, legacy-browser check,
  noscript, `metadataBase`. Pages render `SiteHeader`/`SiteFooter` themselves (there is no
  shared marketing chrome layout — each public page composes the header/footer).
- `(app)/layout.tsx` — minimal root layout (no fonts), `robots: noindex`. Holds
  `/sign-in`, `/sign-up`, `/panel`, `/zespol`.
- `panel/layout.tsx` + `zespol/layout.tsx` — authoritative gates: `auth.api.getSession`
  + a Payload `users` role lookup; loop-safe redirects (missing → /sign-in; wrong role →
  the other area).

Confirmed assets: `lawnSuburb` (`/img/garden/lawnSuburb.jpg`) is in `blur-data.ts`;
`BlurImage` exists (`src/components/BlurImage.tsx`); `SignOutButton` exists
(label "Wyloguj się", calls `authClient.signOut()`); the `Sheet` primitive exists
(`src/components/ui/sheet.tsx`); shadcn is configured (`components.json`, new-york,
`radix-ui` umbrella). No `use-mobile` hook yet (the sidebar CLI adds it).

## Decisions (from brainstorming)

- **Wrap both** `/panel` and `/zespol` in one shared shadcn-sidebar shell, role-driven nav.
- **Auth pages** join the marketing frontend with a **split** layout (photo panel + form);
  photo = **lawnSuburb**; full SiteHeader + SiteFooter; noindex.
- **Convention depth:** *documented + applied* — a Mind decision (shadcn UI + a11y-first
  structure as the AI-navigability contract) + a Mind app-map; no extra runtime tooling.
- Customer nav: Pulpit · Moje ogrody · Usługi · Zamówienia · Historia · Ustawienia.
  Gardener nav: Pulpit · Zlecenia · Klienci · Ustawienia.
- Not-yet-built sections are **clickable stub pages** rendering a shared `ComingSoon`
  ("Wkrótce") inside the shell, so the information architecture is real.

## Goals

- `/sign-in` + `/sign-up` render inside the marketing site (header, footer, brand fonts),
  with a polished split hero, and stay **noindex**.
- `/panel` + `/zespol` render inside a real shadcn-sidebar app shell with role-appropriate
  nav, a collapsible rail, a mobile Sheet drawer, and a user menu (sign out).
- The shell + auth pages follow an **a11y-first** structure (real landmarks, accessible
  names) — the documented "AI-navigable" contract — and the convention + app structure are
  captured in the Mind.

## Non-goals (explicit scope boundary)

- No services-as-Payload-collection work (sub-project 2).
- No Google Maps / lawn capture / real panel features (sub-project 3).
- No page-builder / blocks (sub-project 4).
- Stub sections are intentionally empty `ComingSoon` pages — no real content.
- No change to the gate/redirect logic, session model, or roles beyond passing user
  identity into the shell.

## Architecture

### A. Route restructure

**Auth pages → `(public)/(auth)/`** (route group, URLs unchanged):
- Move `src/app/(app)/sign-in/` → `src/app/(public)/(auth)/sign-in/`.
- Move `src/app/(app)/sign-up/` → `src/app/(public)/(auth)/sign-up/`.
- New `src/app/(public)/(auth)/layout.tsx` — a nested (non-root) layout providing the
  marketing chrome + split shell: `<SiteHeader/>` → split section → `<SiteFooter/>`.
  Sets `export const metadata = { robots: { index: false, follow: false } }` (auth stays
  uncrawled even though it now lives under the indexable `(public)` root).
- The pages keep their existing logic (`getSession` → if logged in `redirect("/panel")`,
  `Suspense` + `<AuthForm mode=… />`). They render ONLY the form; chrome comes from the
  `(auth)` layout. They remain dynamic (`ƒ`) — unchanged.

**Panel/zespol → app shell** (stay in `(app)`):
- `src/app/(app)/layout.tsx` — add the brand UI font variables (at minimum `inter` +
  `manrope`, matching the marketing root's `next/font` setup) to `<html>`, so the shell
  uses brand typography. Keep `robots: noindex`.
- `panel/layout.tsx` + `zespol/layout.tsx` — keep the authoritative gate, then render the
  shell: after the role check, fetch the user's `name`/`email` from the same Payload
  `users` lookup and render `<AppShell role="customer" user={…}>{children}</AppShell>`
  (zespol: `role="gardener"`).

### B. The shadcn sidebar + app shell

- **Install** `sidebar` via `npx shadcn@latest add sidebar` — resolves its deps
  (`button`, `tooltip`, `skeleton`, the `use-mobile` hook) and injects the `--sidebar-*`
  CSS tokens into `globals.css`; it reuses the existing `Sheet`. Verify the generated
  files import from the `radix-ui` umbrella (matching repo convention); reconcile any
  per-package `@radix-ui/*` imports to the umbrella if the CLI emits them.
- New **`src/components/app-shell/AppShell.tsx`** (`"use client"`): wraps
  `SidebarProvider` → `<AppSidebar role user/>` → `SidebarInset` (a topbar with
  `SidebarTrigger` + breadcrumb/page label + a "Zamów usługę" action) → `<main>{children}</main>`.
  The `<main>` landmark is the page region; the sidebar is a `<nav aria-label="Panel …">`
  (a11y-first contract).
- New **`src/components/app-shell/AppSidebar.tsx`** (`"use client"`): brand header (logo +
  role label e.g. "Panel klienta" / "Panel zespołu"), a `SidebarMenu` mapping the role's
  nav config, and a `SidebarFooter` user chip (`avatar` initials + name + email) whose menu
  contains `<SignOutButton/>` ("Wyloguj się").
- New **`src/components/app-shell/app-nav.ts`**: typed nav config keyed by role —
  `{ label, href, icon, comingSoon?: boolean }[]`. Icons from `lucide-react`.
  - customer: Pulpit (`/panel`), Moje ogrody (`/panel/ogrody`), Usługi (`/panel/uslugi`),
    Zamówienia (`/panel/zamowienia`), Historia (`/panel/historia`), Ustawienia
    (`/panel/ustawienia`).
  - gardener: Pulpit (`/zespol`), Zlecenia (`/zespol/zlecenia`), Klienci
    (`/zespol/klienci`), Ustawienia (`/zespol/ustawienia`).
- New **`src/components/app-shell/ComingSoon.tsx`**: a tiny shared placeholder
  (`<main>` with an `<h1>` title + "Wkrótce" line) used by every stub route.
- **Stub pages** (each ~5 lines, render `<ComingSoon title=… />`):
  `(app)/panel/{ogrody,uslugi,zamowienia,historia,ustawienia}/page.tsx` and
  `(app)/zespol/{zlecenia,klienci,ustawienia}/page.tsx`.
- **Dashboards**: `panel/page.tsx` + `zespol/page.tsx` lose the standalone `<main>` wrapper
  and their inline `SignOutButton` (the shell provides chrome + sign-out); they keep a
  greeting + a placeholder dashboard body, rendered inside the shell's `<main>`.

### C. The auth split layout

`(public)/(auth)/layout.tsx`:
- Renders `<SiteHeader/>`, then a split section, then `<SiteFooter/>`.
- Split section: left column (hidden below `md`) = `BlurImage` of `lawnSuburb` (`fill`,
  `object-cover`) under a dark emerald gradient overlay, with a logo top-left and the
  brand copy bottom-left ("Twój ogród, pod kontrolą." + a one-line subtitle). Right column =
  centered `{children}` (the auth form). Below `md`: single column, form full-width, photo
  hidden.
- `metadata.robots` = noindex/nofollow.

### D. Convention + Mind

- **Decision** `kryscar-mind/map/decisions/app-ui-convention.md`: authenticated-app UI is
  built with shadcn (new-york) on the `radix-ui` umbrella; structure is a11y-first (real
  landmarks — `main`, `nav[aria-label]`, headings — and accessible names on every
  interactive element); this clean accessibility tree is the contract that makes the app
  navigable by browser agents (Claude-in-Chrome). No bespoke agent tooling.
- **New zone** `kryscar-mind/map/zones/app-shell.md`: owns `AppShell`, `AppSidebar`,
  `app-nav`, `ComingSoon`, `ui/sidebar`, and the `(app)/panel/**`, `(app)/zespol/**`
  routes; carries the **app-map** (the route + nav inventory) so an agent orients via the
  Mind first.
- **Update** `auth-portal` (sign-in/up now live under `(public)/(auth)`, split hero, still
  noindex; the `(app)` group is now purely the role-gated shell) and `layout-chrome`
  (`SiteHeader`/`SiteFooter` now also wrap the auth pages).

## Data flow

1. Request to `/panel/*` → `proxy.ts` optimistic cookie gate → `panel/layout.tsx`
   (server): `getSession` + Payload `users` lookup → on pass, reads `name`/`email`/`role`
   → renders `<AppShell role="customer" user={{name,email}}>`.
2. `AppShell` (client) reads the role's nav config, renders the sidebar (collapse state
   persisted by shadcn's cookie) and the page in `<main>`. Mobile → Sheet.
3. Sign-out: the sidebar user menu's `SignOutButton` → `authClient.signOut()` → redirect.
4. Auth: `/sign-in` under `(public)/(auth)` → marketing root layout (fonts) + `(auth)`
   layout (chrome + split) → page reads session (logged-in → `/panel`) → renders `AuthForm`.

## Edge cases

- **Collapsed-rail persistence:** shadcn stores it in the `sidebar_state` cookie — works
  across reloads; no extra code.
- **Mobile:** the sidebar becomes a slide-in Sheet (native to the component); the topbar
  `SidebarTrigger` opens it.
- **Wrong-role / no session:** still handled in the gate layout BEFORE `AppShell` renders
  (unchanged behavior).
- **Logged-in visiting auth pages:** still redirected to `/panel` (unchanged).
- **noindex preserved:** both the `(auth)` layout and the `(app)` root set
  `robots: noindex`; verify the rendered `<meta name="robots">` on `/sign-up`, `/panel`.
- **Active nav item:** highlighted via `usePathname()` exact/prefix match.
- **Stub routes** exist so nav never 404s; they render `ComingSoon`, not real features.

## Testing / verification

- `npm run check` passes (tsc + eslint + payload types + mind, no broken anchors).
- `npm run build`: marketing routes stay `○` (static); `/sign-in`, `/sign-up`, `/panel`,
  `/zespol` and the stub routes are `ƒ` (dynamic — they read the session) — expected.
- Browser (localhost:1111) + the demo accounts:
  - `/sign-up` shows SiteHeader + the lawnSuburb split + SiteFooter; `<meta robots>` =
    noindex; brand fonts applied.
  - Sign in as **demo.klient** → `/panel` shows the sidebar shell (customer nav); rail
    collapses + persists; mobile → Sheet; "Wyloguj się" works; stub nav items navigate to
    `ComingSoon` pages.
  - Sign in as **demo.ogrodnik** → `/zespol` shows the gardener nav.
  - The Playwright/Claude-in-Chrome accessibility snapshot of `/panel` is clean: a named
    `nav`, a `main`, labelled menu items (the AI-navigability contract).

## Mind maintenance (on finish)

- Create zone `app-shell` (+ app-map) and decision `app-ui-convention`.
- Update zones `auth-portal` and `layout-chrome`; re-stamp their `verifiedAt` to HEAD.
- File tech-debt notes for any deferrals (e.g. stub pages to be filled by sub-projects 2/3).
- `npm run mind` and commit the regenerated `kryscar-mind/map/index.md`.
