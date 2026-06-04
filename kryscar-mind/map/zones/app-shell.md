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
verifiedAt: "28b334f49df012d0180c4fe6d3ce0e1e87390e06"
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
  longer a `ComingSoon` stub. The remaining non-dashboard routes are still `ComingSoon` stubs.
- Gardener `/zespol`: Pulpit `/zespol` · Zlecenia `/zespol/zlecenia` · Klienci
  `/zespol/klienci` · Ustawienia `/zespol/ustawienia`. Non-dashboard routes are stubs.
- Sign out: the sidebar footer `SignOutButton` ("Wyloguj się").
## Anchors
`AppShell`, `AppSidebar`, `NAV` (app-nav), `ComingSoon`.
## Lineage
sources → [[2026-06-04-app-shell-and-auth-placement-design]]; convention →
[[app-ui-convention]].
