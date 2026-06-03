---
type: spec
summary: "Stand up Payload (admin/staff) + Better Auth (customers) as the MVP backend, mirroring the delieta repo: BA persists through a custom BA→Payload Local-API adapter, so its models are Payload collections. Tenancy wired as a structural seam (single Kryscar tenant); customer + gardener roles both live."
tags: [auth, payload, foundation, data, platform]
status: draft
created: 2026-06-03
updated: 2026-06-03
related: ["[[brand-data]]"]
sources: ["[[2026-06-03-customer-garden-portal]]"]
origin: "User: build Payload (admins/devs) + Better Auth (customers) as the MVP foundation, mirroring Repozytoria/delieta; skip pages/posts + skip marketing-site migration; tenancy as a structural seam (Kryscar = sole tenant now); gardener role minimally live for an ops panel."
---
# Payload + Better Auth foundation — Design

**Date:** 2026-06-03
**Phase:** MVP phase 1 ("Foundation A" in [[2026-06-03-customer-garden-portal]]).
**Reference implementation:** `Repozytoria/delieta` — same stack (`next@16.2.6`, `react@19.2.4`, `payload@^3.85`, `better-auth@^1.6.11`). We copy its auth wiring and adapt names/domain; we do **not** copy its full multi-tenant plugin stack (see §Tenancy).

## Goal

Give Ogrody Kryscar a real backend with two authenticated audiences, on top of the existing marketing site, **without migrating that site**:

- **Staff / devs** → Payload's own admin panel at `/admin` (Payload-native auth, `admins` collection).
- **Customers** → Better Auth (`/api/auth/*`), email + password. BA never touches Postgres directly; it persists through a **custom BA→Payload Local-API adapter**, so its `user / session / account / verification` models are first-class Payload collections (one database, customers visible/editable in `/admin`).

Done = a customer can sign up → sign in → reach a protected route; a staff member logs into `/admin` and sees that customer; a `gardener`-role user reaches a (stub) gated area distinct from the customer area. No portal/panel content, no domain collections yet — those are downstream slices.

## Approved decisions

- **Payload now, for staff/devs.** Postgres (Neon), `idType: 'uuid'`, Payload owns the DB connection and `/admin`. **No `pages`/`posts` collections. No migration** of the existing `/uslugi`, `/zima`, `/ogrodnik`, `/ogrodowe-abc`, `/example-*` routes — Payload is added alongside.
- **Better Auth for customers, via a hand-rolled adapter.** Reject the off-the-shelf `@payload-auth/better-auth-db-adapter`: it is **deprecated**, pins `payload@3.28`/`BA@1.2`, and its sign-in path **silently fails** on `payload@3.85`/`BA@1.6.11` (documented in delieta). We port delieta's ~270-line `better-auth-payload-adapter.ts` instead.
- **Tenancy = structural seam, not a usable layer.** A plain `tenants` Payload collection seeded with **one** row (Kryscar). `users` carry `role` + `tenant`. Domain rows (next spec) carry `tenant` from birth. Access control is written tenant-aware even with one tenant. **Defer** the BA `organization` plugin, `@payloadcms/plugin-multi-tenant`, members/invitations, and any partner-onboarding UI (the cheap-to-add-later machinery — delieta proves the seam holds with "no adapter rewrite").
- **Both `customer` and `gardener` roles are live.** Customers + gardeners are both BA users distinguished by `role`. Public signup is **always** `role: customer`. A `gardener` is made by a Payload superadmin **promoting** an existing user's `role` in `/admin` — no invitation machinery, and it sidesteps credential-provisioning (the user already has a BA password from signup). The gardener's actual ops panel is a **downstream slice**; this spec only makes the role real and route-gatable.
- **Lean deferrals:** no Redis/Upstash (sessions live in Postgres via the adapter), no email verification / Resend (signups land `emailVerified: false`, no verify flow — exactly delieta slice 1), no payments, no domain collections, no portal/panel UI.

## Architecture — coexistence

Three non-colliding surfaces over one Postgres database (verified in delieta):

| Surface | Route | Auth | Cookie |
|---|---|---|---|
| Payload admin (staff/devs) | `/admin` | Payload-native (`admins`) | `payload-token` |
| Payload REST/GraphQL | `/api/[...slug]`, `/api/graphql` | Payload | `payload-token` |
| Better Auth (customers + gardeners) | `/api/auth/*` | Better Auth | `better-auth.session_token` |

Distinct cookie namespaces → no collision. Marketing routes are untouched.

## The custom BA→Payload adapter — `src/lib/better-auth-payload-adapter.ts`

Port delieta's adapter verbatim (it is generic). Key contract:

- Built on `createAdapterFactory` from `better-auth/adapters`; BA normalizes where-clauses (`CleanedWhere`), sort, select before they reach us. We implement only raw CRUD against Payload's **Local API** (`getPayload({ config })`).
- `MODEL_TO_SLUG`: `user→users`, `session→sessions`, `account→accounts`, `verification→verifications`; fallback `${model}s`. (No org models — we don't run the org plugin. When partners arrive, add collections + map entries here, no rewrite.)
- `disableIdGeneration: true` + Postgres `idType: 'uuid'` → Payload mints ids; BA reads the uuid back (incl. relation fields like `account.userId`).
- `depth: 0` on every read → relationships come back as plain string ids (what BA expects).
- `transaction: false` — declared honestly (Local API exposes no nestable transaction primitive); BA runs ops sequentially.

## Collections

All under `src/collections/`. Field names on the BA collections **mirror Better Auth's exact camelCase** (`emailVerified`, `createdAt`, …) so the adapter maps 1:1 — source of truth is `@better-auth/core` `getAuthTables()`.

- **`Admins.ts`** — Payload-native staff/dev login. `auth: true`, `useAsTitle: 'email'`. This is `admin.user` in the config. Customer auth is intentionally NOT here.
- **`auth/Users.ts`** — BA `user`, **as a plain Payload collection** (no `auth: true`; BA owns credentials, the hash lives on `accounts`). Fields: `name` (text, req), `email` (email, req, unique, indexed), `emailVerified` (checkbox, default false), `image` (text), **plus our two seam fields**:
  - `role` — `select`, options `['customer','gardener']`, `defaultValue: 'customer'`, required. **Field access: update/create restricted to Payload admins.** BA signup never sends `role` (so new users default to `customer`); only `/admin` can set `gardener`. This is the self-elevation guard.
  - `tenant` — `relationship` → `tenants`, required. Assigned on create by a hook (below); not set by self-service.
  - `timestamps: true`. Admin `group: 'Auth (Better Auth)'`.
- **`auth/Sessions.ts`**, **`auth/Accounts.ts`**, **`auth/Verifications.ts`** — BA `session` / `account` / `verification`, field names per BA schema (port delieta's). No `auth: true`.
- **`Tenants.ts`** *(our seam — not in delieta's slice 1)* — a gardening company. Fields: `name` (text, req), `slug` (text, unique, indexed), `contactEmail` (email, optional). `useAsTitle: 'name'`. **Plain Payload collection — NOT the BA org plugin.** Shaped so it can later become the BA `organization` / multi-tenant tenant collection. Seeded with exactly one row (Kryscar) by a seed script.

Registered in `payload.config.ts` `collections: [Admins, Users, Sessions, Accounts, Verifications, Tenants]`, `db: postgresAdapter({ pool: { connectionString: DATABASE_URI }, idType: 'uuid' })`, `admin.user: Admins.slug`. **No `multiTenantPlugin`** (delieta has it; we omit it).

## Tenancy & roles — the seam

- **Single tenant now.** Seed one `tenants` row: Kryscar. Every `users` row gets `tenant = Kryscar`.
- **Default-tenant assignment hook** — a `beforeChange` (create) hook on `users` (or BA `databaseHooks.user.create.before`) sets `tenant` to the singleton Kryscar tenant when unset. **This hook is the designated home of the future "assign customer → tenant" routing logic** — today it is a one-liner; when partners onboard it becomes the assignment system. (Mirrors how delieta uses `databaseHooks.session.create.before` for active-org selection.)
- **Tenant-aware access control, exercised today.** Write domain access rules (next spec) as *"row visible where `tenant == req.user.tenant`"*. With one tenant it's trivially all-Kryscar, but the rule is real and the `gardener` panel will actually use it ("a gardener sees requests for their tenant"). Isolation is a habit from row #1, not a retrofit.
- **Roles:** `customer` (self-signup default) and `gardener` (admin-promoted). Route groups are role-gated (below). The gardener's ops panel content is downstream.

## Better Auth config — `src/lib/auth.ts`

Mirror delieta minus the org plugin:

```ts
export const auth = betterAuth({
  baseURL,                       // resolved; see lib/base-url.ts
  trustedOrigins,                // own prod domains + localhost + *.vercel.app (don't rely on a single env var)
  secret: env.BETTER_AUTH_SECRET,
  database: payloadBetterAuthAdapter,
  emailAndPassword: { enabled: true },
  // NO organization plugin (single-tenant MVP). NO email verification (slice-1 parity).
});
```

- **`src/lib/auth-client.ts`** — `createAuthClient` (react) for sign-in/up/out + `useSession`.
- **`src/lib/env.ts`** — typed env access (port delieta's pattern). **`src/lib/base-url.ts`** — server base-URL resolution.

## Route handler & protection

- **`src/app/api/auth/[...all]/route.ts`** — `export const { GET, POST } = toNextJsHandler(auth)`. Top-level, **not** inside the `(payload)` group.
- **`src/proxy.ts`** — Next 16's renamed middleware as an **optimistic** gate. Checks only for the *presence* of the BA session cookie (`getSessionCookie`, no DB round-trip); redirects to the sign-in route with a `?next=`. It is **not** the security boundary.
- **Authoritative check** lives in the gated route group's layout: `auth.api.getSession()` → if no session, redirect; then branch on `role` to authorize customer vs gardener areas. Stale/expired cookies that slip past the proxy are caught here.

## Next.js 16 integration (the one real "touch")

Adding Payload introduces route groups. The existing marketing routes keep their **content**, but the root `app/layout.tsx` is reorganized so Payload's admin can own its own layout:

- `src/app/(payload)/…` — Payload admin (`admin/[[...segments]]`) + Payload API, from `@payloadcms/next`.
- `src/app/(frontend)/…` — the existing marketing site, moved into a group (mechanical move, **content unchanged**).
- `src/app/api/auth/[...all]/route.ts` — Better Auth (top-level).
- Gated portal route groups for the authenticated areas: **customer → `/panel`, gardener → `/zespol`** (decided). `/ogrodnik` stays the public city-page route, so the gardener area deliberately avoids it.

> ⚠️ Per `AGENTS.md`, this is a modified Next.js 16 — the exact route-group/layout wiring, async `params`, and `proxy` conventions must be verified against `node_modules/next/dist/docs/` **and** delieta's actual `src/app/` tree before coding. This spec fixes intent, not the final file moves.

## Stack & env

Add deps: `payload@^3.85`, `@payloadcms/db-postgres`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, `better-auth@^1.6.11`, `pg`, `sharp`. DB: **Neon Postgres** (Vercel Marketplace).

Env: `PAYLOAD_SECRET`, `DATABASE_URI` (+ `DATABASE_URI_DIRECT` for migrations/push if the pooler errors), `BETTER_AUTH_SECRET` (≥32 chars; `openssl rand -base64 32`), `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL`.

Scripts to add (mirror delieta): `generate:types` (`payload generate:types`), a `seed` (creates the Kryscar tenant + a first admin), optionally `reset:db`. Fold `payload generate:types` + `tsc` into the existing `npm run check`.

## Out of scope (downstream slices — named so they're not forgotten)

1. **Domain collections** — `Properties`, `Gardens`, `ServiceRequests`/orders, `Visits`, all tenant-scoped (their own spec).
2. **Customer portal UI** — add property, pick services (reuse [[service-catalog]] + [[pricing-calculator]]), request a date, history.
3. **Gardener ops panel** — role-gated list of assigned requests + act on them. Minimal.
4. **GardenCanvas** — the map module seam (idea phase 2).
5. **Deferred machinery** — BA `organization` plugin + `@payloadcms/plugin-multi-tenant` + invitations/members + partner onboarding; Redis; email verification + Resend; Stripe.

## Open questions (resolve in the plan)

- Exact `(frontend)`/`(payload)` layout split for this repo's existing `src/app/` — confirm against delieta's tree.
- Whether the default-tenant assignment is a Payload `beforeChange` hook vs a BA `databaseHooks.user.create.before` (both work; pick the one that keeps the rule in one obvious place).
- Seed strategy for the first `admins` user (CLI/script vs first-run).

## Verification

- `npx tsc --noEmit` + `npm run lint`; `payload generate:types` clean.
- `GET /api/auth/ok` → `{ status: "ok" }`.
- Manual (user runs locally — sandbox can't start the dev server or reach Neon):
  - Sign up a customer → row appears in `/admin → users` with `role: customer`, `tenant: Kryscar`.
  - Sign in → reach `/panel` (customer); sign out → bounced to sign-in.
  - In `/admin`, promote that user to `role: gardener` → they now reach `/zespol`, not `/panel`.
  - Staff log into `/admin` with an `admins` account; `payload-token` and `better-auth.session_token` coexist (no collision).
- `npm run build` succeeds with Payload + the existing marketing routes intact.
