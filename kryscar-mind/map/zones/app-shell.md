---
type: zone
summary: "The authenticated app shell: a shared shadcn sidebar (AppShell + AppSidebar, role-driven nav) wrapping /panel (customer) and /zespol (gardener), plus the ComingSoon stub pages and the app-map."
tags: [ui, app-shell, auth]
status: active
created: 2026-06-04
updated: 2026-06-10
related: ["[[auth-portal]]", "[[layout-chrome]]", "[[ui-primitives]]", "[[tenancy-and-roles]]", "[[team-schedule]]"]
sources: ["[[2026-06-04-app-shell-and-auth-placement-design]]"]
owns:
  routes: ["/panel", "/panel/ogrody", "/panel/uslugi", "/panel/zamowienia", "/panel/historia", "/panel/ustawienia", "/zespol", "/zespol/zlecenia", "/zespol/grafik", "/zespol/klienci", "/zespol/ustawienia"]
  anchors: ["symbol:AppShell", "symbol:AppSidebar", "symbol:NAV", "symbol:ComingSoon"]
  globs: ["src/components/app-shell/**", "src/components/ui/sidebar.tsx"]
depends: ["[[auth-portal]]", "[[ui-primitives]]"]
invariants:
  - rule: "AppShell renders the single <main> landmark; pages (dashboards, ComingSoon) render plain bodies — never a nested <main>"
    enforcedBy: []
  - rule: "the sidebar nav is role-driven from app-nav NAV[role]; the gate layouts pass the Payload-verified role + user identity into AppShell"
    enforcedBy: []
verifiedAt: "7a99c4fe689b975026565e3d16b7bf98a6028ba5"
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
  Ustawienia `/panel/ustawienia`. **Moje ogrody** (`/panel/ogrody`, `/panel/ogrody/nowy`,
  `/panel/ogrody/[id]/edytuj`) is now REAL — owned by the [[customer-lawns]] zone, no
  longer a `ComingSoon` stub. **Zamówienia** (`/panel/zamowienia`) is now REAL too — owned by
  the [[service-requests]] zone (the customer request list; the configurator lives at
  `/panel/ogrody/[id]/zamow`). **Usługi** (`/panel/uslugi`) remains a `ComingSoon` stub. The
  remaining non-dashboard routes are still `ComingSoon` stubs.
- Gardener `/zespol`: Pulpit `/zespol` · Zlecenia `/zespol/zlecenia` · Grafik
  `/zespol/grafik` · Klienci `/zespol/klienci` · Ustawienia `/zespol/ustawienia`.
  **Zlecenia** + **Grafik** are now REAL — owned by the [[team-schedule]] zone (request
  triage + the team schedule); the dashboard shows live counts. **Klienci** and
  **Ustawienia** remain `ComingSoon` stubs.
- Sign out: the sidebar footer `SignOutButton` ("Wyloguj się").
## Anchors
`AppShell`, `AppSidebar`, `NAV` (app-nav), `ComingSoon`.
## Lineage
sources → [[2026-06-04-app-shell-and-auth-placement-design]]; convention →
[[app-ui-convention]].
