---
type: decision
summary: "Better Auth persists through a hand-rolled BA→Payload Local-API adapter (not the deprecated off-the-shelf one), so its models are Payload collections."
tags: [auth, data]
status: active
created: 2026-06-03
updated: 2026-06-03
related: ["[[customer-auth]]", "[[payload-backend]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
decided: 2026-06-03
supersededBy: ""
---
## Context
We want Payload (admins) + Better Auth (customers) over ONE database, with BA's user/session/account/verification visible/managed in Payload (needed so tenancy + access control can build on them). The off-the-shelf `@payload-auth/better-auth-db-adapter` is deprecated, pins payload@3.28 / better-auth@1.2, and its sign-IN path silently fails on our stack (payload 3.85 / BA 1.6.x).
## Decision
Port delieta's custom `payloadBetterAuthAdapter` (built on BA's `createAdapterFactory`): route all BA CRUD through Payload's Local API; `MODEL_TO_SLUG` maps BA models → Payload slugs; `disableIdGeneration:true` + Postgres `idType:'uuid'`; `depth:0` reads; `transaction:false`.
## Why
Dead/incompatible package; we own a ~270-line generic mapping instead. Making BA models real Payload collections is what unlocks the tenancy seam (and a future org plugin maps in with no adapter rewrite).
## Consequences
BA never touches Postgres directly. New BA plugin models become a new collection + a MODEL_TO_SLUG entry. Verified at runtime: HTTP sign-up creates user+account+session with role/tenant correct.
