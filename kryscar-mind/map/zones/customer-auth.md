---
type: zone
summary: "Better Auth as the customer/gardener auth surface, persisting through a custom BA→Payload Local-API adapter so its user/session/account/verification models are Payload collections."
tags: [feature, auth, data]
status: active
created: 2026-06-03
updated: 2026-06-10
related: ["[[payload-backend]]", "[[tenancy-and-roles]]", "[[auth-portal]]", "[[transactional-email]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
owns:
  routes: ["/api/auth"]
  anchors: ["symbol:auth", "symbol:authClient", "symbol:payloadBetterAuthAdapter", "symbol:Users"]
  globs: ["src/lib/auth.ts", "src/lib/auth-client.ts", "src/lib/better-auth-payload-adapter.ts", "src/app/api/auth/**", "src/collections/auth/**"]
depends: ["[[payload-backend]]"]
invariants:
  - rule: "Better Auth never touches Postgres directly — all reads/writes go through Payload's Local API via the custom adapter"
    enforcedBy: []
  - rule: "BA model collections (users/sessions/accounts/verifications) mirror Better Auth's exact camelCase field names so the adapter maps 1:1; they do NOT set auth:true (BA owns credentials, on accounts)"
    enforcedBy: []
  - rule: "trustedOrigins never includes a platform-wide wildcard — only our explicit domains + THIS deployment's own VERCEL_URL/VERCEL_BRANCH_URL (see [[scoped-trusted-origins]])"
    enforcedBy: []
verifiedAt: "5050826c95fe7a590270965e69d6e333da807665"
---
## Purpose
Customers (and gardeners) authenticate via Better Auth at `/api/auth/*` (email+password; **password reset + SOFT email verification** are now wired — `sendResetPassword` + `emailVerification.sendOnSignUp`, no `requireEmailVerification` so login is never blocked — through [[transactional-email]]). BA persists through `payloadBetterAuthAdapter` (built on `createAdapterFactory`, `disableIdGeneration`, `depth:0` reads, `transaction:false`), so `users/sessions/accounts/verifications` are Payload-managed collections — one database, customers visible in `/admin`. Cookies don't collide: Payload `payload-token` vs BA `better-auth.session_token`.
## Anchors
`auth` (BA instance), `authClient` (React client), `payloadBetterAuthAdapter` (the adapter), `Users` (BA user collection + the role/tenant seam fields).
## Lineage
sources → [[2026-06-03-payload-better-auth-foundation-design]]; why hand-rolled → [[better-auth-via-payload-adapter]].
