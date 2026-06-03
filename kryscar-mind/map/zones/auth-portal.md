---
type: zone
summary: "The authenticated portal: the proxy cookie-gate, the (app) route group, role-gated /panel (customer) + /zespol (gardener), and the sign-in/sign-up screens."
tags: [feature, auth]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[customer-auth]]", "[[tenancy-and-roles]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
owns:
  routes: ["/panel", "/zespol", "/sign-in", "/sign-up"]
  anchors: ["symbol:proxy", "symbol:AuthForm", "symbol:SignOutButton"]
  globs: ["src/proxy.ts", "src/app/(app)/**", "src/components/auth-form.tsx", "src/components/sign-out-button.tsx"]
depends: ["[[customer-auth]]", "[[tenancy-and-roles]]"]
invariants:
  - rule: "proxy.ts is OPTIMISTIC (cookie presence only, no DB) — the authoritative session + role check lives in each segment layout (getSession + a Payload role lookup)"
    enforcedBy: []
  - rule: "role gates are loop-safe: missing user → /sign-in; wrong role → that role's own area (/panel ↔ /zespol)"
    enforcedBy: []
verifiedAt: "f51a2305c2c1052a667a67ee2c10e0458843d733"
---
## Purpose
`src/proxy.ts` (Next 16 middleware) optimistically gates `/panel` + `/zespol` on the BA cookie. The `(app)` route group is a separate root layout (ungated, noindex) holding `/sign-in` + `/sign-up` (shared `AuthForm` client → `authClient`) and the role-gated `/panel` (customer) + `/zespol` (gardener). Each gated layout runs the authoritative `auth.api.getSession` + a Payload `users` role lookup. Verified at runtime: unauthenticated→/sign-in; customer→/panel; gardener→/zespol.
## Anchors
`proxy` (the gate), `AuthForm` (shared sign-in/up), `SignOutButton`; gated layouts under `src/app/(app)/panel` and `/zespol`.
## Lineage
sources → [[2026-06-03-payload-better-auth-foundation-design]]; roles → [[roles-customer-gardener]].
