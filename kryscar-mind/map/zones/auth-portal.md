---
type: zone
summary: "The authenticated portal: the proxy cookie-gate, sign-in/sign-up screens under (public)/(auth), and the role-gated app shell entry points /panel (customer) + /zespol (gardener)."
tags: [feature, auth]
status: active
created: 2026-06-03
updated: 2026-06-10
related: ["[[customer-auth]]", "[[tenancy-and-roles]]", "[[app-shell]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]", "[[2026-06-03-nav-auth-responsive-design]]"]
owns:
  routes: ["/sign-in", "/sign-up"]
  anchors: ["symbol:proxy", "symbol:AuthForm", "symbol:SignOutButton", "symbol:safeInternalPath"]
  globs: ["src/proxy.ts", "src/app/(public)/(auth)/**", "src/components/auth-form.tsx", "src/components/sign-out-button.tsx", "src/lib/safe-internal-path.ts", "scripts/check-safe-next.ts"]
depends: ["[[customer-auth]]", "[[tenancy-and-roles]]"]
invariants:
  - rule: "proxy.ts is OPTIMISTIC (cookie presence only, no DB) — the authoritative session + role check lives in each segment layout (getSession + a Payload role lookup)"
    enforcedBy: []
  - rule: "role gates are loop-safe: missing user → /sign-in; wrong role → that role's own area (/panel ↔ /zespol)"
    enforcedBy: []
  - rule: "the ?next redirect target is sanitized via safeInternalPath (internal paths only — no absolute/protocol-relative URLs), so /sign-in can never open-redirect"
    enforcedBy: ["scripts/check-safe-next.ts (npm run check)"]
verifiedAt: "1e7004c83b4af24b9f0e27fe35a046607ccd20ee"
---
## Purpose
`src/proxy.ts` (Next 16 middleware) optimistically gates `/panel` + `/zespol` on the BA cookie. Sign-in/sign-up now live under `(public)/(auth)` with the marketing chrome + a split lawnSuburb hero (still noindex); the `(app)` group is now purely the role-gated **app shell** ([[app-shell]]). Each gated layout runs the authoritative `auth.api.getSession` + a Payload `users` role lookup; the gate logic itself is unchanged. Verified at runtime: unauthenticated→/sign-in; customer→/panel; gardener→/zespol.
## Anchors
`proxy` (the gate), `AuthForm` (shared sign-in/up), `SignOutButton`, `safeInternalPath` (the `?next=` sanitizer — open-redirect guard); gated layouts under `src/app/(app)/panel` and `/zespol`.
## Lineage
sources → [[2026-06-03-payload-better-auth-foundation-design]]; roles → [[roles-customer-gardener]].
