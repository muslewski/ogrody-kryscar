# App Shell & Auth Placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `/sign-in` + `/sign-up` into the marketing frontend (SiteHeader + SiteFooter + a split lawnSuburb hero, noindex), and give `/panel` + `/zespol` a real shadcn `sidebar` app shell (role-driven nav, collapsible rail, mobile Sheet, user menu) — plus the documented shadcn + a11y-first convention in the Mind.

**Architecture:** Auth pages move to a new `(public)/(auth)/` route group whose nested layout supplies the marketing chrome + split. `/panel` + `/zespol` stay in `(app)` but their gate layouts now render a shared `AppShell` client component built on the shadcn `sidebar` primitive, driven by a per-role nav config. Not-yet-built sections are clickable `ComingSoon` stub pages so the information architecture is real. Everything follows an a11y-first structure (real landmarks + accessible names) — the documented "AI-navigable" contract.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind v4, shadcn (new-york) on the `radix-ui` umbrella, lucide-react, Better Auth, PayloadCMS.

**Verification model:** No unit-test framework in this repo. The gate is `npm run check` (`tsc --noEmit && eslint && payload generate:types && node scripts/mind/generate.mjs`) + `npm run build` + a manual browser pass at `http://localhost:1111` using the demo accounts (`demo.klient@kryscar.pl` / `Klient-22e9d0-Kx9`, `demo.ogrodnik@kryscar.pl` / `Zespol-77b25e-Kx9`). Each task ends by running the relevant gate and committing. Expect 3 pre-existing `<img>` eslint warnings in unrelated files (`example-10/page.tsx`, `CoverageMap.tsx`) — ignore them.

---

## File Structure

**New:**
- `src/components/ui/sidebar.tsx` (+ `button.tsx`, `tooltip.tsx`, `skeleton.tsx`) — vendored by the shadcn CLI (Task 1).
- `src/hooks/use-mobile.ts` — added by the CLI (Task 1).
- `src/components/app-shell/app-nav.ts` — typed per-role nav config.
- `src/components/app-shell/ComingSoon.tsx` — shared "Wkrótce" placeholder body.
- `src/components/app-shell/AppSidebar.tsx` — the role-driven sidebar (client).
- `src/components/app-shell/AppShell.tsx` — provider + sidebar + inset/topbar + `<main>` (client).
- `src/app/(app)/panel/{ogrody,uslugi,zamowienia,historia,ustawienia}/page.tsx` — customer stubs.
- `src/app/(app)/zespol/{zlecenia,klienci,ustawienia}/page.tsx` — gardener stubs.
- `src/app/(public)/(auth)/layout.tsx` — marketing chrome + split hero (noindex).
- `kryscar-mind/map/decisions/app-ui-convention.md`, `kryscar-mind/map/zones/app-shell.md`.

**Modified:**
- `src/app/globals.css` — add `--color-sidebar*` tokens to `@theme`.
- `src/app/(app)/layout.tsx` — add brand UI fonts.
- `src/app/(app)/panel/layout.tsx`, `src/app/(app)/zespol/layout.tsx` — render `AppShell`.
- `src/app/(app)/panel/page.tsx`, `src/app/(app)/zespol/page.tsx` — dashboard bodies (no own `<main>`, no inline sign-out).
- `src/components/auth-form.tsx` — drop full-screen self-centering so it sits in the split column.
- `kryscar-mind/map/zones/auth-portal.md`, `kryscar-mind/map/zones/layout-chrome.md`, `kryscar-mind/map/index.md`.

**Moved:**
- `src/app/(app)/sign-in/` → `src/app/(public)/(auth)/sign-in/`
- `src/app/(app)/sign-up/` → `src/app/(public)/(auth)/sign-up/`

---

## Task 1: Vendor the shadcn sidebar primitive + wire its theme tokens

**Files:**
- Create (via CLI): `src/components/ui/sidebar.tsx`, `button.tsx`, `tooltip.tsx`, `skeleton.tsx`, `src/hooks/use-mobile.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the sidebar component via the shadcn CLI**

Run (non-interactive):
```bash
npx shadcn@latest add sidebar --yes --overwrite
```
Expected: creates `src/components/ui/sidebar.tsx` and its registry deps (`button`, `tooltip`, `skeleton`) plus `src/hooks/use-mobile.ts`. It reuses the existing `Sheet`/`Separator`. It may also try to edit `src/app/globals.css` — that's handled in Step 2.

- [ ] **Step 2: Take deterministic control of the CSS tokens**

The repo's `globals.css` uses a single custom `@theme { … }` block with concrete color values (NOT the standard shadcn `:root`/`@theme inline` two-layer setup). Discard whatever the CLI wrote to the stylesheet and add the sidebar tokens by hand in the repo's style:

```bash
git checkout -- src/app/globals.css
```

Then, in `src/app/globals.css`, inside the existing `@theme { … }` block (right after the `--color-accent-foreground: #1c1917;` line), add:

```css
  /* shadcn sidebar tokens (stone + emerald, matching the brand) */
  --color-sidebar: #fafaf9;
  --color-sidebar-foreground: #44403c;
  --color-sidebar-primary: #047857;
  --color-sidebar-primary-foreground: #ffffff;
  --color-sidebar-accent: #ecfdf5;
  --color-sidebar-accent-foreground: #047857;
  --color-sidebar-border: #ececeb;
  --color-sidebar-ring: #047857;
```

(These generate the `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-accent`, `border-sidebar-border`, `ring-sidebar-ring`, etc. utilities the component uses. The `--sidebar-width` / `--sidebar-width-icon` sizing vars are set inline by `SidebarProvider`, so globals only needs colors.)

- [ ] **Step 3: Note on import style (do NOT block on it)**

The CLI may generate primitive imports from individual `@radix-ui/react-*` packages rather than the repo's `radix-ui` umbrella. Those packages are installed (transitively under the umbrella), so it compiles and works. Leave the vendored files as the CLI generated them — reconciling vendored-primitive import style to the umbrella is an explicit non-goal of this sub-project.

- [ ] **Step 4: Type-check + lint + build**

Run:
```bash
npm run check && npm run build
```
Expected: PASS — 0 TS errors, 0 eslint errors (besides the 3 known `<img>` warnings); build succeeds. The new primitives aren't rendered anywhere yet; this proves they compile and the CSS tokens resolve.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ src/hooks/ src/app/globals.css package.json package-lock.json
git commit -m "feat(ui): vendor shadcn sidebar primitive + brand sidebar tokens

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Nav config + ComingSoon placeholder

**Files:**
- Create: `src/components/app-shell/app-nav.ts`
- Create: `src/components/app-shell/ComingSoon.tsx`

- [ ] **Step 1: Create the per-role nav config**

Create `src/components/app-shell/app-nav.ts`:

```ts
import {
  LayoutDashboard,
  MapPin,
  Leaf,
  ClipboardList,
  History,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Role = "customer" | "gardener";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Sidebar nav per role. Hrefs map to real routes (Pulpit = the dashboard) or
 *  to clickable ComingSoon stub pages — the IA is real even before the
 *  features exist. */
export const NAV: Record<Role, NavItem[]> = {
  customer: [
    { label: "Pulpit", href: "/panel", icon: LayoutDashboard },
    { label: "Moje ogrody", href: "/panel/ogrody", icon: MapPin },
    { label: "Usługi", href: "/panel/uslugi", icon: Leaf },
    { label: "Zamówienia", href: "/panel/zamowienia", icon: ClipboardList },
    { label: "Historia", href: "/panel/historia", icon: History },
    { label: "Ustawienia", href: "/panel/ustawienia", icon: Settings },
  ],
  gardener: [
    { label: "Pulpit", href: "/zespol", icon: LayoutDashboard },
    { label: "Zlecenia", href: "/zespol/zlecenia", icon: ClipboardList },
    { label: "Klienci", href: "/zespol/klienci", icon: Users },
    { label: "Ustawienia", href: "/zespol/ustawienia", icon: Settings },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  customer: "Panel klienta",
  gardener: "Panel zespołu",
};
```

- [ ] **Step 2: Create the ComingSoon placeholder**

This renders the BODY of a page (the `AppShell` already provides the `<main>` landmark — do NOT add a second `<main>`). Create `src/components/app-shell/ComingSoon.tsx`:

```tsx
/**
 * Shared placeholder body for app sections that exist in the nav (so the IA is
 * real) but aren't built yet. Rendered inside AppShell's <main>, so it is a
 * plain block — no <main> of its own.
 */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        {title}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Wkrótce — ta sekcja jest w przygotowaniu.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run:
```bash
npm run check
```
Expected: PASS (files not yet imported — proves they compile).

- [ ] **Step 4: Commit**

```bash
git add src/components/app-shell/app-nav.ts src/components/app-shell/ComingSoon.tsx
git commit -m "feat(app-shell): role nav config + ComingSoon placeholder

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: AppSidebar + AppShell components

**Files:**
- Create: `src/components/app-shell/AppSidebar.tsx`
- Create: `src/components/app-shell/AppShell.tsx`

- [ ] **Step 1: Create the AppSidebar**

Create `src/components/app-shell/AppSidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SignOutButton } from "@/components/sign-out-button";
import { NAV, ROLE_LABEL, type Role } from "./app-nav";

function initials(name?: string | null): string {
  if (!name) return "K";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppSidebar({
  role,
  user,
}: {
  role: Role;
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();
  const items = NAV[role];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href={role === "customer" ? "/panel" : "/zespol"}
          className="flex items-center gap-2.5 px-2 py-1.5"
        >
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              Ogrody Kryscar
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              {ROLE_LABEL[role]}
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/panel" &&
                    item.href !== "/zespol" &&
                    pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
            {initials(user.name)}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium">
              {user.name ?? "Konto"}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {user.email}
            </span>
          </span>
        </div>
        <div className="px-2 pb-1">
          <SignOutButton />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
```

- [ ] **Step 2: Create the AppShell**

Create `src/components/app-shell/AppShell.tsx`:

```tsx
"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./AppSidebar";
import { ROLE_LABEL, type Role } from "./app-nav";

/**
 * Authenticated app shell shared by /panel (customer) and /zespol (gardener).
 * Server gate layouts pass the verified role + user identity; the shell renders
 * the role-driven sidebar, a topbar (trigger + role label), and the page inside
 * the single <main> landmark (a11y-first — the AI-navigable contract).
 */
export function AppShell({
  role,
  user,
  children,
}: {
  role: Role;
  user: { name?: string | null; email?: string | null };
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} user={user} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-5" />
          <span className="text-sm font-medium text-neutral-600">
            {ROLE_LABEL[role]}
          </span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

- [ ] **Step 3: Type-check**

Run:
```bash
npm run check
```
Expected: PASS. (Confirms the shadcn sidebar exports used here — `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarHeader`, `SidebarMenu`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarRail`, `SidebarInset`, `SidebarProvider`, `SidebarTrigger` — all exist. If `tsc` reports a missing export, open `src/components/ui/sidebar.tsx` and use the actual exported name; the shadcn sidebar exports all of these in current versions.)

- [ ] **Step 4: Commit**

```bash
git add src/components/app-shell/AppSidebar.tsx src/components/app-shell/AppShell.tsx
git commit -m "feat(app-shell): AppSidebar + AppShell (role-driven sidebar + inset)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Wire panel/zespol layouts to AppShell + dashboards + app fonts

**Files:**
- Modify: `src/app/(app)/layout.tsx`
- Modify: `src/app/(app)/panel/layout.tsx`
- Modify: `src/app/(app)/zespol/layout.tsx`
- Modify: `src/app/(app)/panel/page.tsx`
- Modify: `src/app/(app)/zespol/page.tsx`

- [ ] **Step 1: Give the (app) root layout the brand UI fonts**

Replace the entire contents of `src/app/(app)/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import "../globals.css";

/**
 * Root layout for the authenticated app group: /panel, /zespol (the auth
 * SCREENS now live under (public)/(auth)). UNGATED on purpose — provides
 * <html>/<body> + the Tailwind stylesheet + brand UI fonts. The real gates live
 * in the nested panel/zespol layouts. noindex — private, never crawled.
 */
const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: { template: "%s · Ogrody Kryscar", default: "Ogrody Kryscar" },
  robots: { index: false, follow: false },
};

export default function AppRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className="h-full antialiased" suppressHydrationWarning>
      <body
        className={`${inter.className} ${manrope.variable} min-h-full bg-white text-neutral-900`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Render AppShell from the customer gate layout**

In `src/app/(app)/panel/layout.tsx`, keep the gate logic but render the shell around children. Replace the file with:

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getPayload } from "payload";
import config from "@payload-config";

import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell/AppShell";

/**
 * Authoritative gate for the CUSTOMER area. The proxy did an optimistic cookie
 * check; here we verify the real session + role against Payload, then render the
 * shared app shell. Loop-safe: missing user → /sign-in; wrong role → /zespol.
 */
export default async function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session) {
    const next = hdrs.get("x-pathname") ?? "/panel";
    redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  }

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "users",
    where: { id: { equals: session.user.id } },
    limit: 1,
    depth: 0,
  });
  const me = docs[0];
  if (!me?.role) redirect("/sign-in");
  if (me.role !== "customer") redirect("/zespol");

  return (
    <AppShell role="customer" user={{ name: me.name, email: me.email }}>
      {children}
    </AppShell>
  );
}
```

- [ ] **Step 3: Render AppShell from the gardener gate layout**

In `src/app/(app)/zespol/layout.tsx`, replace the file with:

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getPayload } from "payload";
import config from "@payload-config";

import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell/AppShell";

/**
 * Authoritative gate for the GARDENER area. Same shape as the customer gate but
 * requires role `gardener` (a customer → /panel; missing user → /sign-in), then
 * renders the shared app shell. Gardeners are promoted in /admin — no public
 * gardener signup.
 */
export default async function ZespolLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session) {
    const next = hdrs.get("x-pathname") ?? "/zespol";
    redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  }

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "users",
    where: { id: { equals: session.user.id } },
    limit: 1,
    depth: 0,
  });
  const me = docs[0];
  if (!me?.role) redirect("/sign-in");
  if (me.role !== "gardener") redirect("/panel");

  return (
    <AppShell role="gardener" user={{ name: me.name, email: me.email }}>
      {children}
    </AppShell>
  );
}
```

- [ ] **Step 4: Simplify the customer dashboard page**

The shell now provides the `<main>` + sign-out, so the page renders only its body. Replace `src/app/(app)/panel/page.tsx` with:

```tsx
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const metadata = { title: "Pulpit" };

export default async function PanelPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user?.name;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Witaj{name ? `, ${name}` : ""} 👋
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Tu zobaczysz swoje ogrody, najbliższe wizyty i zamówienia.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Simplify the gardener dashboard page**

Replace `src/app/(app)/zespol/page.tsx` with:

```tsx
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const metadata = { title: "Pulpit" };

export default async function ZespolPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user?.name;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Witaj{name ? `, ${name}` : ""} 👋
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Tu zobaczysz zlecenia klientów przypisane do Ogrody Kryscar i ich
        szczegóły.
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Type-check**

Run:
```bash
npm run check
```
Expected: PASS. (`me.name`/`me.email` come from the generated `users` payload type; `AppShell` accepts `{name,email}`.)

- [ ] **Step 7: Commit**

```bash
git add "src/app/(app)/layout.tsx" "src/app/(app)/panel/layout.tsx" "src/app/(app)/zespol/layout.tsx" "src/app/(app)/panel/page.tsx" "src/app/(app)/zespol/page.tsx"
git commit -m "feat(app-shell): render AppShell from panel/zespol gates + app fonts

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Stub pages for the not-yet-built sections

**Files:**
- Create: `src/app/(app)/panel/ogrody/page.tsx`, `…/uslugi/page.tsx`, `…/zamowienia/page.tsx`, `…/historia/page.tsx`, `…/ustawienia/page.tsx`
- Create: `src/app/(app)/zespol/zlecenia/page.tsx`, `…/klienci/page.tsx`, `…/ustawienia/page.tsx`

- [ ] **Step 1: Create the five customer stub pages**

Each file has the same shape — only `title` and the route differ. Create:

`src/app/(app)/panel/ogrody/page.tsx`:
```tsx
import { ComingSoon } from "@/components/app-shell/ComingSoon";
export const metadata = { title: "Moje ogrody" };
export default function Page() {
  return <ComingSoon title="Moje ogrody" />;
}
```

`src/app/(app)/panel/uslugi/page.tsx`:
```tsx
import { ComingSoon } from "@/components/app-shell/ComingSoon";
export const metadata = { title: "Usługi" };
export default function Page() {
  return <ComingSoon title="Usługi" />;
}
```

`src/app/(app)/panel/zamowienia/page.tsx`:
```tsx
import { ComingSoon } from "@/components/app-shell/ComingSoon";
export const metadata = { title: "Zamówienia" };
export default function Page() {
  return <ComingSoon title="Zamówienia" />;
}
```

`src/app/(app)/panel/historia/page.tsx`:
```tsx
import { ComingSoon } from "@/components/app-shell/ComingSoon";
export const metadata = { title: "Historia wizyt" };
export default function Page() {
  return <ComingSoon title="Historia wizyt" />;
}
```

`src/app/(app)/panel/ustawienia/page.tsx`:
```tsx
import { ComingSoon } from "@/components/app-shell/ComingSoon";
export const metadata = { title: "Ustawienia" };
export default function Page() {
  return <ComingSoon title="Ustawienia" />;
}
```

- [ ] **Step 2: Create the three gardener stub pages**

`src/app/(app)/zespol/zlecenia/page.tsx`:
```tsx
import { ComingSoon } from "@/components/app-shell/ComingSoon";
export const metadata = { title: "Zlecenia" };
export default function Page() {
  return <ComingSoon title="Zlecenia" />;
}
```

`src/app/(app)/zespol/klienci/page.tsx`:
```tsx
import { ComingSoon } from "@/components/app-shell/ComingSoon";
export const metadata = { title: "Klienci" };
export default function Page() {
  return <ComingSoon title="Klienci" />;
}
```

`src/app/(app)/zespol/ustawienia/page.tsx`:
```tsx
import { ComingSoon } from "@/components/app-shell/ComingSoon";
export const metadata = { title: "Ustawienia" };
export default function Page() {
  return <ComingSoon title="Ustawienia" />;
}
```

- [ ] **Step 3: Type-check**

Run:
```bash
npm run check
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/panel/ogrody" "src/app/(app)/panel/uslugi" "src/app/(app)/panel/zamowienia" "src/app/(app)/panel/historia" "src/app/(app)/panel/ustawienia" "src/app/(app)/zespol/zlecenia" "src/app/(app)/zespol/klienci" "src/app/(app)/zespol/ustawienia"
git commit -m "feat(app-shell): ComingSoon stub pages for nav sections

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Move auth pages into the marketing frontend (split hero)

**Files:**
- Move: `src/app/(app)/sign-in/` → `src/app/(public)/(auth)/sign-in/`
- Move: `src/app/(app)/sign-up/` → `src/app/(public)/(auth)/sign-up/`
- Create: `src/app/(public)/(auth)/layout.tsx`
- Modify: `src/components/auth-form.tsx`

- [ ] **Step 1: Move the sign-in and sign-up route folders**

Run:
```bash
mkdir -p "src/app/(public)/(auth)"
git mv "src/app/(app)/sign-in" "src/app/(public)/(auth)/sign-in"
git mv "src/app/(app)/sign-up" "src/app/(public)/(auth)/sign-up"
```
Expected: the two folders now live under `(public)/(auth)/`. URLs stay `/sign-in`, `/sign-up`. The page files are unchanged (they still `getSession` → redirect, and render `<AuthForm>`).

- [ ] **Step 2: Create the auth split layout**

Create `src/app/(public)/(auth)/layout.tsx`:

```tsx
import type { Metadata } from "next";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BlurImage } from "@/components/BlurImage";
import { IMG } from "@/lib/data";

/**
 * Chrome for the auth SCREENS. They now live in the (public) group so they get
 * the marketing root layout (brand fonts, legacy-browser check). This nested
 * layout wraps them with SiteHeader + a split hero (lawnSuburb photo + form) +
 * SiteFooter. noindex — auth pages must never be crawled.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="grid md:min-h-[78vh] md:grid-cols-2">
        <div className="relative hidden md:block">
          <BlurImage
            src={IMG.lawnSuburb}
            alt=""
            fill
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/25 to-emerald-950/80" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="text-3xl font-semibold leading-tight tracking-tight">
              Twój ogród,
              <br />
              pod kontrolą.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-emerald-50/90">
              Dodaj swój trawnik, wybierz usługi i śledź wizyty — wszystko w
              jednym panelu.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center px-6 py-14">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 3: Make AuthForm sit in the split column (drop full-screen centering)**

In `src/components/auth-form.tsx`, change ONLY the outer wrapper `<div>` (line 41). It currently is:

```tsx
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
```

Replace it with (the layout now provides the column, centering, and padding):

```tsx
    <div className="w-full max-w-sm">
```

Leave the rest of the component unchanged.

- [ ] **Step 4: Type-check + build**

Run:
```bash
npm run check && npm run build
```
Expected: PASS. In the build route table: `/sign-in` and `/sign-up` are still `ƒ` (they read the session); the marketing routes (`/`, `/realizacje`, …) are still `○`. The `(app)` group no longer lists sign-in/sign-up.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(public)/(auth)" src/components/auth-form.tsx
git commit -m "feat(auth): move sign-in/up into marketing frontend with split hero

Auth screens now live under (public)/(auth) — SiteHeader + lawnSuburb
split + SiteFooter, brand fonts, noindex. AuthForm no longer self-centers.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Browser verification (both roles, auth pages, mobile)

**Files:** none (manual verification with the dev server + demo accounts).

- [ ] **Step 1: Start the dev server**

Run (background): `npm run dev` — ready on `http://localhost:1111`.

- [ ] **Step 2: Auth pages**

At `http://localhost:1111/sign-up` (desktop ≥ md):
- SiteHeader on top, SiteFooter at the bottom, the **lawnSuburb** photo panel on the left with the white "Twój ogród, pod kontrolą." copy, the form on the right.
- View source / inspect `<head>`: `<meta name="robots" content="noindex, nofollow">` present.
- Brand fonts applied (not the default serif/sans fallback).
At `< md` width: the photo hides, the form is full-width.

- [ ] **Step 3: Customer shell**

Sign in at `/sign-in` as `demo.klient@kryscar.pl` / `Klient-22e9d0-Kx9`:
- Lands on `/panel` inside the sidebar shell: brand + "Panel klienta", nav (Pulpit · Moje ogrody · Usługi · Zamówienia · Historia · Ustawienia), user chip (initials + name + email) + "Wyloguj się".
- Click "Moje ogrody" → navigates to `/panel/ogrody` showing the "Moje ogrody / Wkrótce" ComingSoon; the active nav item highlights.
- Toggle the sidebar trigger → rail collapses; reload → stays collapsed (cookie persistence).
- Resize to `< md` → sidebar becomes a slide-in Sheet via the trigger.

- [ ] **Step 4: Gardener shell + role routing**

Sign out, sign in as `demo.ogrodnik@kryscar.pl` / `Zespol-77b25e-Kx9`:
- Lands on `/zespol` (or visiting `/panel` redirects here) with the gardener nav (Pulpit · Zlecenia · Klienci · Ustawienia) under "Panel zespołu".
- "Wyloguj się" signs out → `/sign-in`.

- [ ] **Step 5: a11y snapshot (the AI-navigable contract)**

With the Playwright MCP (or Claude-in-Chrome), capture an accessibility snapshot of `/panel`:
- A named navigation region, a `main` landmark, and labelled menu links are present (clean tree). Note any gap; if the sidebar `nav` lacks an accessible name, that's acceptable for this pass (shadcn labels it), but record it.

- [ ] **Step 6: Stop the dev server.**

---

## Task 8: Mind maintenance (same change, not a follow-up)

**Files:**
- Create: `kryscar-mind/map/decisions/app-ui-convention.md`, `kryscar-mind/map/zones/app-shell.md`
- Modify: `kryscar-mind/map/zones/auth-portal.md`, `kryscar-mind/map/zones/layout-chrome.md`
- Modify (generated): `kryscar-mind/map/index.md`

- [ ] **Step 1: Capture HEAD for verifiedAt**

Run: `git rev-parse HEAD` — record the full SHA as HEAD_SHA.

- [ ] **Step 2: Create the convention decision**

Create `kryscar-mind/map/decisions/app-ui-convention.md`:

```markdown
---
type: decision
summary: "The authenticated app UI is built with shadcn (new-york) on the radix-ui umbrella, with an a11y-first structure (real landmarks + accessible names) as the AI-navigability contract — the clean accessibility tree is what browser agents (Claude-in-Chrome) read. No bespoke agent tooling."
tags: [ui, convention, app-shell, a11y]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[app-shell]]", "[[ui-primitives]]", "[[auth-portal]]"]
sources: ["[[2026-06-04-app-shell-and-auth-placement-design]]"]
decided: 2026-06-04
supersededBy: ""
---
## Context
The customer/gardener portal is being built out. We want one UI system and a
structure that humans, screen readers, AND browser-driving AI agents can navigate.
## Decision
App UI = shadcn (new-york) components on the `radix-ui` umbrella. Every view uses
real landmarks (`main`, `nav` with an accessible name, headings) and accessible
names on interactive elements. The resulting accessibility tree IS the contract a
browser agent reads — no separate machine API. The Mind carries an app-map
([[app-shell]]) so an agent orients via the knowledge base before touching the browser.
## Why
shadcn/Radix already emit strong semantic + aria markup, so a11y-first costs little
and pays triple (humans, AT, agents). We verified Playwright/Claude-in-Chrome
accessibility snapshots of these pages are clean and readable.
## Consequences
New app surfaces follow this convention. Vendored shadcn primitives may keep the
CLI's import style; that is a tolerated exception, not the rule for app code.
```

- [ ] **Step 3: Create the app-shell zone (with the app-map)**

Create `kryscar-mind/map/zones/app-shell.md` (replace `__HEAD_SHA__` with HEAD_SHA from Step 1):

```markdown
---
type: zone
summary: "The authenticated app shell: a shared shadcn sidebar (AppShell + AppSidebar, role-driven nav) wrapping /panel (customer) and /zespol (gardener), plus the ComingSoon stub pages and the app-map."
tags: [ui, app-shell, auth]
status: active
created: 2026-06-04
updated: 2026-06-04
related: ["[[auth-portal]]", "[[layout-chrome]]", "[[ui-primitives]]", "[[tenancy-and-roles]]"]
sources: ["[[2026-06-04-app-shell-and-auth-placement-design]]"]
owns:
  routes: ["/panel", "/panel/ogrody", "/panel/uslugi", "/panel/zamowienia", "/panel/historia", "/panel/ustawienia", "/zespol", "/zespol/zlecenia", "/zespol/klienci", "/zespol/ustawienia"]
  anchors: ["symbol:AppShell", "symbol:AppSidebar", "symbol:NAV", "symbol:ComingSoon"]
  globs: ["src/components/app-shell/**", "src/components/ui/sidebar.tsx"]
depends: ["[[auth-portal]]", "[[ui-primitives]]"]
invariants:
  - rule: "AppShell renders the single <main> landmark; pages (dashboards, ComingSoon) render plain bodies — never a nested <main>"
    enforcedBy: []
  - rule: "the sidebar nav is role-driven from app-nav NAV[role]; the gate layouts pass the Payload-verified role + user identity into AppShell"
    enforcedBy: []
verifiedAt: "__HEAD_SHA__"
---
## Purpose
One shared shell for the authed app. `panel/layout.tsx` + `zespol/layout.tsx` run the
authoritative gate (getSession + Payload role lookup) and render
`<AppShell role user>`. `AppShell` (client) = `SidebarProvider` → `AppSidebar`
(role nav from `app-nav`) → `SidebarInset` (topbar trigger + role label) → `<main>`.
Collapsible rail (cookie-persisted), mobile → Sheet. The marketing chrome is NOT
here (that's [[layout-chrome]], used by the public site + the auth screens).
## App-map (for browser agents — orient here first)
- Customer `/panel`: Pulpit `/panel` · Moje ogrody `/panel/ogrody` · Usługi
  `/panel/uslugi` · Zamówienia `/panel/zamowienia` · Historia `/panel/historia` ·
  Ustawienia `/panel/ustawienia`. Non-dashboard routes are `ComingSoon` stubs.
- Gardener `/zespol`: Pulpit `/zespol` · Zlecenia `/zespol/zlecenia` · Klienci
  `/zespol/klienci` · Ustawienia `/zespol/ustawienia`. Non-dashboard routes are stubs.
- Sign out: the sidebar footer `SignOutButton` (“Wyloguj się”).
## Anchors
`AppShell`, `AppSidebar`, `NAV` (app-nav), `ComingSoon`.
## Lineage
sources → [[2026-06-04-app-shell-and-auth-placement-design]]; convention →
[[app-ui-convention]].
```

- [ ] **Step 4: Update the auth-portal zone**

In `kryscar-mind/map/zones/auth-portal.md`:
- Change the `owns.globs` for the auth screens from `src/app/(app)/**` to reflect the move: the screens now live at `src/app/(public)/(auth)/**`; `/panel` + `/zespol` belong to [[app-shell]]. Specifically set `globs` to `["src/proxy.ts", "src/app/(public)/(auth)/**", "src/components/auth-form.tsx", "src/components/sign-out-button.tsx"]`.
- Update the Purpose prose: sign-in/sign-up now live under `(public)/(auth)` with the marketing chrome + a split lawnSuburb hero (still noindex); the `(app)` group is now purely the role-gated **app shell** ([[app-shell]]); the gate logic is unchanged.
- Add `[[app-shell]]` to `related`. Re-stamp `verifiedAt` to HEAD_SHA.

- [ ] **Step 5: Update the layout-chrome zone**

In `kryscar-mind/map/zones/layout-chrome.md`:
- In the Purpose, add a sentence: `SiteHeader`/`SiteFooter` now also wrap the auth screens via the `(public)/(auth)` layout (see [[auth-portal]], [[app-shell]]).
- Add `[[app-shell]]` to `related`. Re-stamp `verifiedAt` to HEAD_SHA.

- [ ] **Step 6: Regenerate the Mind + commit**

Run:
```bash
npm run mind
```
Expected: regenerates `kryscar-mind/map/index.md`, NO broken-anchor errors (all wiki-links resolve: `app-shell`, `app-ui-convention`, `auth-portal`, `layout-chrome`, `ui-primitives`, `tenancy-and-roles`, and the spec `2026-06-04-app-shell-and-auth-placement-design` all exist). If a broken anchor is reported, fix the offending link — do not invent records.

Then:
```bash
git add kryscar-mind/
git commit -m "docs(mind): app-shell zone + app-ui-convention; update auth-portal/layout-chrome

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Auth pages → marketing frontend, split lawnSuburb hero, noindex → Task 6. ✅
- Brand fonts on auth pages (via (public) root) + (app) root → Task 6 (move) + Task 4 Step 1. ✅
- AuthForm fits the split column → Task 6 Step 3. ✅
- Shared shadcn sidebar shell for both panels, role nav → Tasks 1–4. ✅
- Collapsible rail + mobile Sheet + user menu sign-out → shadcn sidebar (Task 1) + AppSidebar/AppShell (Task 3). ✅
- Clickable ComingSoon stubs → Tasks 2 + 5. ✅
- Gate logic unchanged, passes role+user into shell → Task 4 Steps 2–3. ✅
- Convention decision + app-shell zone (app-map) + auth-portal/layout-chrome updates → Task 8. ✅
- Verification (both roles, mobile, noindex, a11y snapshot) → Task 7. ✅
- Scope boundary (no services/Maps/features) honored — stubs only. ✅

**Placeholder scan:** No TBD/TODO; every code step shows full code; commands have expected output. ✅

**Type/name consistency:** `Role` = `"customer" | "gardener"` (app-nav) used by `NAV`, `ROLE_LABEL`, `AppSidebar`, `AppShell`, and the gate layouts. `AppShell` props `{ role, user:{name,email}, children }` match the gate-layout call sites. Sidebar exports used in Task 3 (`Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarHeader`, `SidebarMenu`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarRail`, `SidebarInset`, `SidebarProvider`, `SidebarTrigger`) are standard shadcn sidebar exports (Task 3 Step 3 notes the fallback if a name differs). `IMG.lawnSuburb`, `BlurImage`, `SiteHeader`/`SiteFooter` (named exports), `SignOutButton`, lucide icons (LayoutDashboard, MapPin, Leaf, ClipboardList, History, Settings, Users) all verified to exist. ✅
