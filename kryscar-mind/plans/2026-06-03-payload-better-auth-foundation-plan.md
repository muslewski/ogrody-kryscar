---
type: plan
summary: "Step-by-step build of the Payload + Better Auth MVP foundation, porting delieta's verified wiring: Payload (admin/staff) + Better Auth (customers) over Neon Postgres, BA persisting through a custom BA→Payload Local-API adapter; tenancy seam (single Kryscar tenant) + live customer/gardener roles."
tags: [auth, payload, foundation, data, platform]
status: draft
created: 2026-06-03
updated: 2026-06-03
related: ["[[brand-data]]"]
sources: ["[[2026-06-03-payload-better-auth-foundation-design]]"]
---
# Payload + Better Auth Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up Payload (staff `/admin`) + Better Auth (customers) on top of the existing marketing site, with BA persisting through a custom BA→Payload Local-API adapter, a single-tenant seam, and live `customer`/`gardener` roles.

**Architecture:** Port `Repozytoria/delieta`'s verified auth wiring (same stack: `next@16.2.6`, `payload@^3.85`, `better-auth@^1.6.11`). Payload owns Postgres (Neon, uuid ids) and `/admin`; BA's `user/session/account/verification` are Payload collections written through the custom adapter. A plain `tenants` collection (seeded: Kryscar) + `role`/`tenant` on `users` provide the tenancy seam; no org/multi-tenant plugin yet.

**Tech Stack:** Payload 3.85 (`@payloadcms/db-postgres`, `@payloadcms/next`, `@payloadcms/richtext-lexical`), Better Auth 1.6.11, `pg`, Neon Postgres, Next.js 16 App Router.

**Reference (the oracle):** `Repozytoria/delieta` — port these files (read them during implementation):
- `src/lib/better-auth-payload-adapter.ts` (generic — copy verbatim, adjust `MODEL_TO_SLUG`)
- `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/env.ts`, `src/lib/base-url.ts`
- `src/payload.config.ts`, `src/collections/Admins.ts`, `src/collections/auth/{Users,Sessions,Accounts,Verifications}.ts`
- `src/app/api/auth/[...all]/route.ts`, `src/proxy.ts`

**Testing approach (read first):** This repo has **no test runner** and we are **not** adding one for the foundation (do NOT introduce vitest/jest). Per-task verification = `npx tsc --noEmit` + `npm run lint`, **run locally after Task 0 installs deps** (the sandbox cannot `npm install` Payload/BA or reach Neon). Runtime checks are consolidated in the final **Local Verification Runbook**. Spec/quality review of each task is static (code vs. spec vs. delieta).

**Spec:** [[2026-06-03-payload-better-auth-foundation-design]]. **Routes:** customer `/panel`, gardener `/zespol`. **Branch:** work continues on `claude/practical-easley-14978a` (already a worktree).

---

## Task 0 — Prerequisites (YOURS — local, not a subagent task)

Nothing below can be type-checked or run until this is done on your machine.

- [ ] **Provision Neon Postgres** (Vercel Marketplace → Neon). Capture the pooled connection string and the direct one.
- [ ] **Set env** in `.env` (and Vercel project env):
  - `DATABASE_URI=` (Neon pooled), `DATABASE_URI_DIRECT=` (Neon direct — for schema push/migrations)
  - `PAYLOAD_SECRET=` (`openssl rand -base64 32`)
  - `BETTER_AUTH_SECRET=` (`openssl rand -base64 32`)
  - `BETTER_AUTH_URL=http://localhost:3000` (dev) / prod URL; `NEXT_PUBLIC_APP_URL` if used by `base-url.ts`
- [ ] **Confirm dep install works locally** (`npm install` after Task 1 edits `package.json`).

---

## Task 1 — Dependencies, scripts, env helpers

**Files:**
- Modify: `package.json` (dependencies + scripts)
- Create: `src/lib/env.ts`, `src/lib/base-url.ts`

- [ ] **Step 1: Add dependencies to `package.json`** (versions tracked to delieta's working set)

```jsonc
// dependencies — add:
"payload": "^3.85.0",
"@payloadcms/db-postgres": "^3.85.0",
"@payloadcms/next": "^3.85.0",
"@payloadcms/richtext-lexical": "^3.85.0",
"better-auth": "^1.6.11",
"pg": "^8.21.0",
"sharp": "^0.34.5"
// devDependencies — add:
"@types/pg": "^8.20.0"
```

- [ ] **Step 2: Add scripts to `package.json`**

```jsonc
"generate:types": "payload generate:types",
// extend the existing check:
"check": "tsc --noEmit && eslint && payload generate:types && node scripts/mind/generate.mjs"
```

- [ ] **Step 3: Create `src/lib/env.ts`** — typed, validated env access (port delieta's `src/lib/env.ts`; it reads `DATABASE_URI`, `DATABASE_URI_DIRECT`, `PAYLOAD_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`/`NEXT_PUBLIC_APP_URL`). Copy its shape; keep only the vars this slice uses.

- [ ] **Step 4: Create `src/lib/base-url.ts`** — port delieta's `getServerBaseURL()` (resolves dev/prod/Vercel base URL).

- [ ] **Step 5: (local) Install + verify**

Run: `npm install` then `npx tsc --noEmit`
Expected: install succeeds; tsc has no errors from `env.ts`/`base-url.ts`.

- [ ] **Step 6: Commit** — `chore(deps): add payload + better-auth + pg; env helpers`

---

## Task 2 — Payload collections: Admins + Better Auth models

**Files:**
- Create: `src/collections/Admins.ts`
- Create: `src/collections/auth/Users.ts`, `Sessions.ts`, `Accounts.ts`, `Verifications.ts`

- [ ] **Step 1: `Admins.ts`** — Payload-native staff/dev login.

```ts
import type { CollectionConfig } from "payload";

export const Admins: CollectionConfig = {
  slug: "admins",
  auth: true,
  admin: { useAsTitle: "email" },
  fields: [], // email + password auto-added by `auth: true`
};
```

- [ ] **Step 2: `auth/Sessions.ts`, `auth/Accounts.ts`, `auth/Verifications.ts`** — copy delieta's three files **verbatim** (their fields mirror Better Auth's `session`/`account`/`verification` schema exactly; no `auth: true`). Read delieta's `src/collections/auth/` first.

- [ ] **Step 3: `auth/Users.ts`** — port delieta's `Users` (BA `user` as a plain collection, no `auth: true`) **plus the two seam fields**:

```ts
import type { CollectionConfig } from "payload";

const adminOnly = ({ req }: { req: { user?: { collection?: string } } }) =>
  req.user?.collection === "admins";

export const Users: CollectionConfig = {
  slug: "users",
  admin: { useAsTitle: "email", group: "Auth (Better Auth)" },
  // No `auth: true` — Better Auth owns credentials (hash lives on `accounts`).
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true, unique: true, index: true },
    { name: "emailVerified", type: "checkbox", required: true, defaultValue: false },
    { name: "image", type: "text" },
    // --- tenancy seam ---
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "customer",
      options: ["customer", "gardener"],
      // Self-elevation guard: BA signup never sends `role`; only /admin can set it.
      access: { create: adminOnly, update: adminOnly },
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      // assigned by the default-tenant hook (Task 5) when unset.
    },
  ],
  timestamps: true,
};
```

- [ ] **Step 4: (local) `npx tsc --noEmit`** — Expected: PASS (note: `tenants` relationship resolves once Task 3 lands; if running this task standalone, expect a transient unknown-collection type until Task 3).

- [ ] **Step 5: Commit** — `feat(auth): admins + better-auth model collections`

---

## Task 3 — Tenants collection (the seam)

**Files:** Create: `src/collections/Tenants.ts`

- [ ] **Step 1: `Tenants.ts`** — plain Payload collection (NOT the BA org plugin).

```ts
import type { CollectionConfig } from "payload";

/**
 * A gardening company = a tenant. Single-tenant MVP: exactly one row (Kryscar).
 * Plain collection now; shaped to become the BA `organization` / multi-tenant
 * tenant collection later (see spec — deferred machinery).
 */
export const Tenants: CollectionConfig = {
  slug: "tenants",
  admin: { useAsTitle: "name" },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "contactEmail", type: "email" },
  ],
  timestamps: true,
};
```

- [ ] **Step 2: (local) `npx tsc --noEmit`** — Expected: PASS (now `users.tenant` resolves).
- [ ] **Step 3: Commit** — `feat(tenancy): tenants collection (single-tenant seam)`

---

## Task 4 — Custom BA→Payload adapter

**Files:** Create: `src/lib/better-auth-payload-adapter.ts`

- [ ] **Step 1: Copy delieta's adapter verbatim**, then set `MODEL_TO_SLUG` to the four BA models only (no org models this slice):

```ts
const MODEL_TO_SLUG: Record<string, string> = {
  user: "users",
  session: "sessions",
  account: "accounts",
  verification: "verifications",
  // fallback `${model}s` covers future org models with no rewrite.
};
```

Keep the rest exactly as delieta has it: `createAdapterFactory`, `adapterId: "payload-local-api"`, `disableIdGeneration: true`, `transaction: false`, `depth: 0` reads, the `buildWhere`/`whereConditionFor`/`applySelect` helpers, and the CRUD methods via `getPayload({ config })` Local API.

- [ ] **Step 2: (local) `npx tsc --noEmit`** — Expected: PASS.
- [ ] **Step 3: Commit** — `feat(auth): custom better-auth → payload local-api adapter`

---

## Task 5 — payload.config.ts + default-tenant hook + seed

**Files:**
- Create: `src/payload.config.ts`
- Modify: `src/collections/auth/Users.ts` (add the hook)
- Create: `scripts/seed.ts`

- [ ] **Step 1: `payload.config.ts`** — port delieta's, minus `multiTenantPlugin`, with our collections:

```ts
import path from "path";
import { fileURLToPath } from "url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Admins } from "./collections/Admins";
import { Users } from "./collections/auth/Users";
import { Sessions } from "./collections/auth/Sessions";
import { Accounts } from "./collections/auth/Accounts";
import { Verifications } from "./collections/auth/Verifications";
import { Tenants } from "./collections/Tenants";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: { user: Admins.slug, importMap: { baseDir: path.resolve(dirname) } },
  collections: [Admins, Users, Sessions, Accounts, Verifications, Tenants],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
    idType: "uuid",
  }),
  sharp,
  // NO multiTenantPlugin (single-tenant MVP).
});
```

- [ ] **Step 2: Add the default-tenant hook to `Users.ts`** — assigns the singleton Kryscar tenant on create when unset. **This is the future home of customer→tenant routing.**

```ts
// in Users.ts, add to the collection config:
hooks: {
  beforeChange: [
    async ({ data, operation, req }) => {
      if (operation === "create" && !data.tenant) {
        const res = await req.payload.find({
          collection: "tenants",
          where: { slug: { equals: "kryscar" } },
          limit: 1,
          depth: 0,
        });
        if (res.docs[0]) data.tenant = res.docs[0].id;
      }
      return data;
    },
  ],
},
```

- [ ] **Step 3: `scripts/seed.ts`** — idempotently create the Kryscar tenant + (optionally) a first admin. Pattern: `getPayload({ config })`, `find` by slug, `create` if absent.

```ts
import { getPayload } from "payload";
import config from "../src/payload.config";

const payload = await getPayload({ config });
const existing = await payload.find({ collection: "tenants", where: { slug: { equals: "kryscar" } }, limit: 1 });
if (!existing.docs[0]) {
  await payload.create({ collection: "tenants", data: { name: "Ogrody Kryscar", slug: "kryscar" } });
  payload.logger.info("Seeded Kryscar tenant");
}
process.exit(0);
```

Add script: `"seed": "tsx scripts/seed.ts"` (add `tsx` to devDeps if absent).

- [ ] **Step 4: (local) `payload generate:types` + `npx tsc --noEmit`** — Expected: types generate; tsc PASS.
- [ ] **Step 5: Commit** — `feat(payload): config + default-tenant hook + seed script`

---

## Task 6 — Better Auth instance, client, route handler

**Files:**
- Create: `src/lib/auth.ts`, `src/lib/auth-client.ts`
- Create: `src/app/api/auth/[...all]/route.ts`

- [ ] **Step 1: `src/lib/auth.ts`** — port delieta minus the org plugin:

```ts
import { betterAuth } from "better-auth";
import { env } from "./env";
import { getServerBaseURL } from "./base-url";
import { payloadBetterAuthAdapter } from "./better-auth-payload-adapter";

const baseURL = getServerBaseURL();
const trustedOrigins = [
  ...new Set([baseURL, "http://localhost:3000", "https://*.vercel.app"]),
]; // add real prod domains (kryscar.pl, www.kryscar.pl) when known.

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  secret: env.BETTER_AUTH_SECRET,
  database: payloadBetterAuthAdapter,
  emailAndPassword: { enabled: true },
  // NO organization plugin; NO email verification (slice-1 parity).
});
```

- [ ] **Step 2: `src/lib/auth-client.ts`**

```ts
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();
export const { signIn, signUp, signOut, useSession } = authClient;
```

- [ ] **Step 3: `src/app/api/auth/[...all]/route.ts`**

```ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 4: (local) `npx tsc --noEmit`** — Expected: PASS.
- [ ] **Step 5: Commit** — `feat(auth): better-auth instance + client + /api/auth handler`

---

## Task 7 — Next.js integration: route groups + admin

**Files (verify exact layout against delieta's `src/app/` + `node_modules/next/dist/docs/` per AGENTS.md):**
- Move: existing marketing routes/layout into `src/app/(frontend)/` (content unchanged)
- Create: `src/app/(payload)/…` (admin `[[...segments]]` + Payload API) from `@payloadcms/next`
- Keep: `src/app/api/auth/[...all]/route.ts` top-level

- [ ] **Step 1: Generate/scaffold the `(payload)` group** following `@payloadcms/next` (admin layout + `admin/[[...segments]]/page.tsx` + `api/[...slug]` + `api/graphql`). Mirror delieta's `(payload)` tree exactly.
- [ ] **Step 2: Wrap existing marketing routes in `(frontend)`** — mechanical move of `layout.tsx`, `page.tsx`, `uslugi/`, `zima/`, `ogrodnik/`, `ogrodowe-abc/`, `example-*`, `sitemap.ts`, `robots.ts`. **Confirm no rendered output changes.**
- [ ] **Step 3: (local) `npx tsc --noEmit` + `npm run dev`** — Expected: existing pages render unchanged; `/admin` loads the Payload login.
- [ ] **Step 4: Commit** — `feat(payload): admin route group; wrap marketing site in (frontend)`

---

## Task 8 — Route protection + role-gated portal shells

**Files:**
- Create: `src/proxy.ts`
- Create: `src/app/(app)/panel/layout.tsx` + `page.tsx` (customer)
- Create: `src/app/(app)/zespol/layout.tsx` + `page.tsx` (gardener)
- Create: minimal `src/app/(app)/sign-in/page.tsx`, `sign-up/page.tsx`

- [ ] **Step 1: `src/proxy.ts`** — port delieta's optimistic gate; set matcher to our routes:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const hasSession = getSessionCookie(request);
  if (!hasSession) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}
export const config = { matcher: ["/panel/:path*", "/zespol/:path*"] };
```

- [ ] **Step 2: Authoritative session + role check in each layout.** `/panel/layout.tsx` requires a session and `role === "customer"` (else redirect); `/zespol/layout.tsx` requires `role === "gardener"`. Use `auth.api.getSession({ headers: await headers() })`, then look up the user's `role`/`tenant` via Payload Local API. (Confirm the exact `headers()` await + session shape against the Next 16 docs.)
- [ ] **Step 3: Minimal `page.tsx` stubs** — `/panel` greets the customer + sign-out; `/zespol` greets the gardener + sign-out. No domain content (that's the next slice).
- [ ] **Step 4: Minimal `sign-in` / `sign-up` pages** — call `authClient.signIn.email` / `signUp.email`, then redirect to `?next` or `/panel`.
- [ ] **Step 5: (local) `npx tsc --noEmit` + `npm run lint`** — Expected: PASS.
- [ ] **Step 6: Commit** — `feat(portal): proxy gate + role-gated /panel and /zespol shells`

---

## Local Verification Runbook (YOURS — after the build)

Run on your machine with Neon + env configured:

- [ ] `npm install` && `payload generate:types` && `npm run check` → clean.
- [ ] `npm run seed` → "Seeded Kryscar tenant".
- [ ] `npm run dev`; `GET /api/auth/ok` → `{ "status": "ok" }`.
- [ ] Sign up a customer at `/sign-up` → row appears in `/admin → users` with `role: customer`, `tenant: Ogrody Kryscar`.
- [ ] Sign in → reach `/panel`; sign out → bounced to `/sign-in`.
- [ ] Create an `admins` user (seed or first-run); log into `/admin`; promote the test user to `role: gardener` → they now reach `/zespol`, not `/panel`.
- [ ] Confirm `payload-token` and `better-auth.session_token` coexist (no collision).
- [ ] `npm run build` succeeds; existing marketing pages unchanged.

---

## On-finish (Mind discipline — after the build verifies)

- [ ] Add zone cards: `customer-auth` (BA + adapter), `payload-backend` (config + admins), `tenancy` (tenants + seam). Re-stamp `verifiedAt` to HEAD.
- [ ] Add decision records: `better-auth-via-payload-adapter` (why hand-rolled, not the deprecated package), `tenancy-seam-not-plugin`, `roles-customer-gardener`.
- [ ] File tech-debt: `defer-multitenant-plugin`, `defer-email-verification`.
- [ ] `npm run mind` (or `/map-sync`); commit the regenerated `index.md`.
