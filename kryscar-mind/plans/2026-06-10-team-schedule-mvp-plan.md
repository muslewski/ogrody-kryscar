# Team Schedule MVP (3b.2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the order loop — gardeners triage customer `service-requests` (accept→schedule / decline / done), run a shared team schedule built on a new `visits` collection, customers see their order status + next visit, and the Payload MCP plugin exposes the ops collections at `/api/mcp`.

**Architecture:** One new access-closed `visits` collection (security in the data layer, mirroring `lawns`/`service-requests` — [[lawns-ownership-in-data-layer]]). The customer boundary stays `owner == userId`; a new **team boundary** (`role == "gardener"`, via `requireGardener()`) guards every `/zespol` server action. Two data-layer modules (`lib/team.ts` for request transitions, `lib/visits.ts` for visit CRUD + a pure `suggestNextVisitDate`). Two new gardener pages (`/zespol/zlecenia`, `/zespol/grafik`) using existing shadcn primitives — no new UI deps. The `@payloadcms/plugin-mcp` plugin exposes `services/service-requests/lawns/visits/tenants` with full CRUD behind Bearer API keys.

**Tech Stack:** Next.js 16 (App Router, server actions), React 19, PayloadCMS 3.85 (`@payloadcms/db-postgres`, `@payloadcms/plugin-mcp`), Neon Postgres, Better Auth 1.6, Tailwind v4, shadcn (alert-dialog, sheet), zod 4.

**Verification model:** No unit-test framework (matches the house style). The gate is `npm run check` (`tsc --noEmit && eslint && payload generate:types && node scripts/mind/generate.mjs && npm run check:logic`) + `npm run build` + a manual browser pass at `http://localhost:1111` with the demo accounts (`npx tsx --env-file=.env scripts/seed-demo-users.ts`). Pure logic is covered by a `node:assert` check script (`scripts/check-visits.ts`) wired into `check:logic`. Each task ends by running the gate + committing. Expect 3 pre-existing `<img>` eslint warnings (`example-10/page.tsx`, `CoverageMap.tsx`) — ignore; 0 errors is the bar. Run `tsc`/`payload`/`build` with `NODE_OPTIONS="--max-old-space-size=1536"` if the sandbox OOM-kills them.

**⚠ INFRA DEPENDENCY (manual, by the user):** Tasks 1–10 compile/build against the existing Neon DB. Collection changes require `payload generate:types` (in `npm run check`) and a **dev schema push** (Payload pushes on first `getPayload` in dev — i.e. `npm run dev` or the seed script). Production migrations remain a known pre-launch tech-debt ([[prod-migrations-needed]]); this slice does NOT add a migration. **Task 11 (MCP) needs `payload@3.85`-compatible `@payloadcms/plugin-mcp`** — if `npm install` can't resolve a compatible version, STOP and surface it; do not pin a mismatched major.

---

## File Structure

**Create:**
- `src/collections/Visits.ts` — the visits collection (access-closed, tenant hook)
- `src/lib/team-auth.ts` — `requireGardener()` server-side role gate
- `src/lib/team.ts` — tenant-scoped request reads + transitions (accept/decline/complete)
- `src/lib/visits.ts` — visit CRUD, customer-scoped reads, pure `suggestNextVisitDate`
- `src/app/(app)/zespol/zlecenia/actions.ts` — gardener request-triage server actions
- `src/app/(app)/zespol/grafik/page.tsx` — the schedule (agenda) page
- `src/app/(app)/zespol/grafik/actions.ts` — visit server actions
- `src/components/team/RequestTriageCard.tsx` — request card + accept/decline dialogs
- `src/components/team/VisitCard.tsx` — visit row + done/cancel/next-visit dialogs
- `scripts/check-visits.ts` — pure-logic assertions
- `kryscar-mind/map/zones/team-schedule.md` — new zone card
- `kryscar-mind/map/decisions/visit-per-row-schedule.md` — decision record

**Modify:**
- `src/collections/ServiceRequests.ts` — extend `status` options + add `declineReason`
- `src/payload.config.ts` — register `Visits`; add `mcpPlugin`
- `src/components/app-shell/app-nav.ts` — add Grafik nav item
- `src/lib/requests.ts` — widen `RequestView.status` union; extend `cancelRequest` to `accepted`
- `src/components/requests/RequestCard.tsx` — new status badges + declineReason
- `src/components/requests/RequestActions.tsx` — show cancel for `accepted` too
- `src/app/(app)/zespol/zlecenia/page.tsx` — replace ComingSoon with the triage list
- `src/app/(app)/zespol/page.tsx` — live dashboard counts
- `src/app/(app)/panel/page.tsx` — "Najbliższa wizyta" line
- `package.json` — `check:logic` adds `check-visits.ts`
- closed-collection access fns (`Lawns`, `ServiceRequests`, `Visits`) — MCP carve-out (Task 11)

---

## Task 1: Extend the `service-requests` status model

**Files:**
- Modify: `src/collections/ServiceRequests.ts`
- Modify: `src/lib/requests.ts`

- [ ] **Step 1: Add the new statuses + declineReason to the collection**

In `src/collections/ServiceRequests.ts`, replace the `status` field and add `declineReason` after `note`:

```ts
    { name: "note", type: "textarea" },
    { name: "declineReason", type: "text" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: ["draft", "new", "accepted", "declined", "cancelled", "done"],
    },
```

- [ ] **Step 2: Widen the projected status union in the data layer**

In `src/lib/requests.ts`, update the `RequestView` interface status field:

```ts
  status: "draft" | "new" | "accepted" | "declined" | "cancelled" | "done";
```

The `project()` function already passes `doc.status` through — no change there.

- [ ] **Step 3: Generate types + check**

Run: `NODE_OPTIONS="--max-old-space-size=1536" npx payload generate:types && NODE_OPTIONS="--max-old-space-size=1536" npx tsc --noEmit`
Expected: PASS (the `ServiceRequest['status']` union in `payload-types.ts` now includes the new values; `requests.ts` compiles).

- [ ] **Step 4: Commit**

```bash
git add src/collections/ServiceRequests.ts src/lib/requests.ts src/payload-types.ts
git commit -m "feat(requests): extend status model (accepted/declined/done) + declineReason"
```

---

## Task 2: Create the `visits` collection

**Files:**
- Create: `src/collections/Visits.ts`
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Write the collection**

Create `src/collections/Visits.ts`:

```ts
import type { CollectionConfig } from "payload";

import { assignDefaultTenant } from "./hooks/assign-default-tenant";

/**
 * A scheduled visit fulfilling a service-request. Single dated appointment
 * (recurrence is manual — the gardener schedules the next one). Owner-scoped
 * reads + team writes are enforced in src/lib/visits.ts / src/lib/team.ts
 * (the Local API runs as admin via the Better Auth adapter), NOT here — access
 * is fully closed. `customer`/`lawn` are denormalized from the request so the
 * agenda and the customer's "najbliższe wizyty" query cheaply.
 */
export const Visits: CollectionConfig = {
  slug: "visits",
  admin: {
    useAsTitle: "scheduledAt",
    group: "Klienci",
    defaultColumns: ["scheduledAt", "status", "lawn", "customer", "assignee"],
  },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "request", type: "relationship", relationTo: "service-requests", required: true, index: true },
    { name: "lawn", type: "relationship", relationTo: "lawns", required: true },
    { name: "customer", type: "relationship", relationTo: "users", required: true, index: true },
    { name: "scheduledAt", type: "date", required: true, index: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "assignee", type: "relationship", relationTo: "users" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "planned",
      options: ["planned", "done", "cancelled"],
    },
    { name: "note", type: "textarea" },
    { name: "tenant", type: "relationship", relationTo: "tenants", required: true },
  ],
  hooks: { beforeChange: [assignDefaultTenant] },
  timestamps: true,
};
```

- [ ] **Step 2: Register it in payload.config.ts**

In `src/payload.config.ts`, add the import alongside the others and append to the `collections` array:

```ts
import { Visits } from "./collections/Visits";
```

```ts
  collections: [Admins, Users, Sessions, Accounts, Verifications, Tenants, Media, Services, Lawns, ServiceRequests, Visits],
```

- [ ] **Step 3: Generate types + check**

Run: `NODE_OPTIONS="--max-old-space-size=1536" npx payload generate:types && NODE_OPTIONS="--max-old-space-size=1536" npx tsc --noEmit`
Expected: PASS; `payload-types.ts` now has `interface Visit` and `'visits': Visit` in the Config.

- [ ] **Step 4: Commit**

```bash
git add src/collections/Visits.ts src/payload.config.ts src/payload-types.ts
git commit -m "feat(visits): visits collection (owner/team-scoped, closed) + register"
```

---

## Task 3: Pure scheduling logic + check script

**Files:**
- Create: `src/lib/visits.ts` (partial — the pure helper + types only this task)
- Create: `scripts/check-visits.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the pure helper + shared types**

Create `src/lib/visits.ts` with ONLY the pure parts for now (CRUD added in Task 4):

```ts
import type { Frequency } from "./pricing";

export interface VisitView {
  id: string;
  requestId: string;
  lawnId: string;
  lawnName: string;
  customerId: string;
  customerName: string;
  scheduledAt: string;
  assigneeName: string | null;
  status: "planned" | "done" | "cancelled";
  note: string | null;
  serviceTitles: string[];
}

/** Days added to the last visit date to pre-fill "schedule next". Pure. */
const FREQUENCY_GAP_DAYS: Record<Frequency, number> = {
  jednorazowo: 7,
  co_tydzien: 7,
  co_2_tyg: 14,
  raz_w_miesiacu: 30,
  sezonowy: 7,
};

/**
 * Suggest the next visit date from the last one + a service frequency. Returns
 * an ISO string. Unknown/undefined frequency defaults to +7 days. Pure — no
 * Date.now(); the caller passes the anchor date.
 */
export function suggestNextVisitDate(
  lastDate: Date,
  frequency: Frequency | null | undefined,
): string {
  const gap = frequency ? FREQUENCY_GAP_DAYS[frequency] : 7;
  const next = new Date(lastDate.getTime());
  next.setDate(next.getDate() + gap);
  return next.toISOString();
}

/**
 * Whether a service-request status transition is allowed. The team UI never
 * offers an illegal transition, but the actions assert it server-side too.
 */
const ALLOWED_REQUEST_TRANSITIONS: Record<string, string[]> = {
  new: ["accepted", "declined", "cancelled"],
  accepted: ["done", "cancelled"],
  declined: [],
  cancelled: [],
  done: [],
  draft: ["new", "cancelled"],
};

export function canTransitionRequest(from: string, to: string): boolean {
  return ALLOWED_REQUEST_TRANSITIONS[from]?.includes(to) ?? false;
}
```

- [ ] **Step 2: Write the check script**

Create `scripts/check-visits.ts`:

```ts
/** Runnable sanity checks for visit scheduling logic. Run: npx tsx scripts/check-visits.ts */
import assert from "node:assert/strict";

import { suggestNextVisitDate, canTransitionRequest } from "../src/lib/visits";

// +7 for weekly, from a fixed anchor (no Date.now — deterministic).
const anchor = new Date("2026-06-10T09:00:00.000Z");
assert.equal(
  suggestNextVisitDate(anchor, "co_tydzien").slice(0, 10),
  "2026-06-17",
  "co_tydzien → +7d",
);
assert.equal(
  suggestNextVisitDate(anchor, "co_2_tyg").slice(0, 10),
  "2026-06-24",
  "co_2_tyg → +14d",
);
assert.equal(
  suggestNextVisitDate(anchor, "raz_w_miesiacu").slice(0, 10),
  "2026-07-10",
  "raz_w_miesiacu → +30d",
);
assert.equal(
  suggestNextVisitDate(anchor, null).slice(0, 10),
  "2026-06-17",
  "unknown freq → +7d default",
);

// Transition guard.
assert.ok(canTransitionRequest("new", "accepted"), "new→accepted allowed");
assert.ok(canTransitionRequest("new", "declined"), "new→declined allowed");
assert.ok(canTransitionRequest("accepted", "done"), "accepted→done allowed");
assert.ok(!canTransitionRequest("done", "accepted"), "done→accepted rejected");
assert.ok(!canTransitionRequest("declined", "accepted"), "declined→accepted rejected");
assert.ok(!canTransitionRequest("new", "done"), "new→done (skipping accept) rejected");

console.log("visits OK — suggestNextVisitDate + transition guard");
```

- [ ] **Step 3: Wire into check:logic**

In `package.json`, extend the `check:logic` script:

```json
    "check:logic": "tsx scripts/check-pricing.ts && tsx scripts/check-lawns.ts && tsx scripts/check-safe-next.ts && tsx scripts/check-visits.ts",
```

- [ ] **Step 4: Run the check script**

Run: `npx tsx scripts/check-visits.ts`
Expected: `visits OK — suggestNextVisitDate + transition guard`

- [ ] **Step 5: Commit**

```bash
git add src/lib/visits.ts scripts/check-visits.ts package.json
git commit -m "feat(visits): pure scheduling logic (suggestNextVisitDate, transition guard) + checks"
```

---

## Task 4: Visit data layer (CRUD + customer reads)

**Files:**
- Modify: `src/lib/visits.ts`

- [ ] **Step 1: Append the data-access functions**

Add to `src/lib/visits.ts` (keep the pure exports from Task 3 at the top; add imports at the top of the file and the functions below):

```ts
import { getPayload } from "payload";
import config from "@payload-config";
import type { RequiredDataFromCollectionSlug } from "payload";

import type { Visit, Lawn, User, ServiceRequest } from "@/payload-types";
```

```ts
function project(doc: Visit): VisitView {
  const lawn = (typeof doc.lawn === "object" && doc.lawn ? doc.lawn : null) as Lawn | null;
  const customer = (typeof doc.customer === "object" && doc.customer ? doc.customer : null) as User | null;
  const assignee = (typeof doc.assignee === "object" && doc.assignee ? doc.assignee : null) as User | null;
  const request = (typeof doc.request === "object" && doc.request ? doc.request : null) as ServiceRequest | null;
  return {
    id: String(doc.id),
    requestId: request ? String(request.id) : String(doc.request),
    lawnId: lawn ? String(lawn.id) : String(doc.lawn),
    lawnName: lawn?.name ?? "Ogród",
    customerId: customer ? String(customer.id) : String(doc.customer),
    customerName: customer?.name ?? "Klient",
    scheduledAt: doc.scheduledAt,
    assigneeName: assignee?.name ?? null,
    status: doc.status,
    note: doc.note ?? null,
    serviceTitles: (request?.items ?? []).map((it) => it.serviceTitle),
  };
}

/** Owner-scoped: the customer's upcoming planned visits, soonest first. */
export async function getUpcomingVisitsForCustomer(
  userId: string,
  limit = 3,
): Promise<VisitView[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "visits",
    where: {
      and: [
        { customer: { equals: userId } },
        { status: { equals: "planned" } },
      ],
    },
    sort: "scheduledAt",
    depth: 1,
    limit,
  });
  return docs.map(project);
}

/** Create a visit (called by team.acceptRequest and the schedule-next action). */
export async function createVisit(input: {
  requestId: string;
  lawnId: string;
  customerId: string;
  scheduledAt: string;
  note?: string;
}): Promise<VisitView> {
  const payload = await getPayload({ config });
  const doc = await payload.create({
    collection: "visits",
    data: {
      request: input.requestId,
      lawn: input.lawnId,
      customer: input.customerId,
      scheduledAt: input.scheduledAt,
      status: "planned",
      note: input.note ?? undefined,
    } as unknown as RequiredDataFromCollectionSlug<"visits">,
    depth: 1,
  });
  return project(doc as Visit);
}

/** Set a visit's status (done/cancelled). Tenant-checked by the caller. */
export async function setVisitStatus(
  id: string,
  status: "done" | "cancelled",
): Promise<void> {
  const payload = await getPayload({ config });
  await payload.update({ collection: "visits", id, data: { status } });
}

/** Cancel every planned visit of a request (used when a customer cancels). */
export async function cancelVisitsForRequest(requestId: string): Promise<void> {
  const payload = await getPayload({ config });
  await payload.update({
    collection: "visits",
    where: { and: [{ request: { equals: requestId } }, { status: { equals: "planned" } }] },
    data: { status: "cancelled" },
  });
}
```

- [ ] **Step 2: Check**

Run: `NODE_OPTIONS="--max-old-space-size=1536" npx tsc --noEmit`
Expected: PASS. (Note: `ServiceRequest['items']` is an array of objects with `serviceTitle` — confirmed in `payload-types.ts` from Task 1's regen.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/visits.ts
git commit -m "feat(visits): owner-scoped reads + create/setStatus/cancel data layer"
```

---

## Task 5: Team auth gate + team data layer

**Files:**
- Create: `src/lib/team-auth.ts`
- Create: `src/lib/team.ts`

- [ ] **Step 1: Write requireGardener()**

Create `src/lib/team-auth.ts`:

```ts
/**
 * Server-side team boundary. Every /zespol server action calls this — the layout
 * gate can't be trusted by directly-callable actions. Resolves the Better Auth
 * session, looks up the Payload role + tenant, and returns them only for a
 * gardener. Returns null otherwise (the action surfaces a Polish error).
 */
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";

import { auth } from "./auth";

export interface GardenerCtx {
  userId: string;
  tenantId: string;
}

export async function requireGardener(): Promise<GardenerCtx | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "users",
    where: { id: { equals: session.user.id } },
    limit: 1,
    depth: 0,
  });
  const me = docs[0];
  if (!me || me.role !== "gardener") return null;
  const tenantId = typeof me.tenant === "object" && me.tenant ? String(me.tenant.id) : String(me.tenant);
  return { userId: session.user.id, tenantId };
}
```

- [ ] **Step 2: Write the team data layer**

Create `src/lib/team.ts`:

```ts
/**
 * Team-side (gardener) reads + request transitions. The team boundary is
 * role == gardener (verified in the action via requireGardener); here every
 * query is tenant-scoped. Transitions assert canTransitionRequest server-side.
 */
import { getPayload } from "payload";
import config from "@payload-config";

import type { ServiceRequest, Lawn, User } from "@/payload-types";
import type { RequestView } from "./requests";
import { canTransitionRequest } from "./visits";
import { createVisit } from "./visits";

export interface TeamRequestView extends RequestView {
  customerName: string;
  address: string;
  polygon: Lawn["polygon"];
  buildings: Lawn["buildings"];
}

function projectTeam(doc: ServiceRequest): TeamRequestView {
  const lawn = (typeof doc.lawn === "object" && doc.lawn ? doc.lawn : null) as Lawn | null;
  const customer = (typeof doc.owner === "object" && doc.owner ? doc.owner : null) as User | null;
  return {
    id: String(doc.id),
    lawnId: lawn ? String(lawn.id) : String(doc.lawn),
    lawnName: lawn?.name ?? "Ogród",
    customerName: customer?.name ?? "Klient",
    address: lawn?.address ?? "",
    polygon: lawn?.polygon ?? [],
    buildings: lawn?.buildings ?? [],
    items: (doc.items ?? []).map((it) => ({
      serviceSlug: it.serviceSlug,
      serviceTitle: it.serviceTitle,
      frequency: (it.frequency ?? null) as TeamRequestView["items"][number]["frequency"],
      quantity: it.quantity ?? null,
      estMin: it.estMin,
      estMax: it.estMax,
      custom: Boolean(it.custom),
    })),
    estMin: doc.estMin,
    estMax: doc.estMax,
    note: doc.note ?? null,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

/** All requests for the gardener's tenant, newest first. */
export async function getTenantRequests(tenantId: string): Promise<TeamRequestView[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "service-requests",
    where: { tenant: { equals: tenantId } },
    sort: "-createdAt",
    depth: 1,
    limit: 200,
  });
  return docs.map(projectTeam);
}

async function getTenantRequest(tenantId: string, id: string): Promise<ServiceRequest | null> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "service-requests",
    where: { and: [{ id: { equals: id } }, { tenant: { equals: tenantId } }] },
    depth: 1,
    limit: 1,
  });
  return (docs[0] as ServiceRequest) ?? null;
}

/** Accept a request: status → accepted + create the first planned visit. */
export async function acceptRequest(
  tenantId: string,
  id: string,
  scheduledAt: string,
): Promise<void> {
  const req = await getTenantRequest(tenantId, id);
  if (!req) throw new Error("Request not found");
  if (!canTransitionRequest(req.status, "accepted")) throw new Error("Illegal transition");
  const lawnId = typeof req.lawn === "object" && req.lawn ? String(req.lawn.id) : String(req.lawn);
  const customerId = typeof req.owner === "object" && req.owner ? String(req.owner.id) : String(req.owner);
  await createVisit({ requestId: String(req.id), lawnId, customerId, scheduledAt });
  const payload = await getPayload({ config });
  await payload.update({ collection: "service-requests", id, data: { status: "accepted" } });
}

export async function declineRequest(tenantId: string, id: string, reason: string): Promise<void> {
  const req = await getTenantRequest(tenantId, id);
  if (!req) throw new Error("Request not found");
  if (!canTransitionRequest(req.status, "declined")) throw new Error("Illegal transition");
  const payload = await getPayload({ config });
  await payload.update({
    collection: "service-requests",
    id,
    data: { status: "declined", declineReason: reason || undefined },
  });
}

export async function completeRequest(tenantId: string, id: string): Promise<void> {
  const req = await getTenantRequest(tenantId, id);
  if (!req) throw new Error("Request not found");
  if (!canTransitionRequest(req.status, "done")) throw new Error("Illegal transition");
  const payload = await getPayload({ config });
  await payload.update({ collection: "service-requests", id, data: { status: "done" } });
}
```

NOTE: `RequestView['items'][number]['frequency']` is the `Frequency | null` union from `requests.ts`. If tsc complains about the indexed access in `projectTeam`, replace the cast with `as import("./pricing").Frequency | null`.

- [ ] **Step 3: Check**

Run: `NODE_OPTIONS="--max-old-space-size=1536" npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/team-auth.ts src/lib/team.ts
git commit -m "feat(team): requireGardener gate + tenant-scoped request transitions"
```

---

## Task 6: Team server actions

**Files:**
- Create: `src/app/(app)/zespol/zlecenia/actions.ts`
- Create: `src/app/(app)/zespol/grafik/actions.ts`

- [ ] **Step 1: Write the zlecenia actions**

Create `src/app/(app)/zespol/zlecenia/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";

import { requireGardener } from "@/lib/team-auth";
import { acceptRequest, declineRequest, completeRequest } from "@/lib/team";

type Result = { ok: true } | { ok: false; error: string };

export async function acceptRequestAction(id: string, scheduledAt: string): Promise<Result> {
  const ctx = await requireGardener();
  if (!ctx) return { ok: false, error: "Brak uprawnień." };
  if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt)))
    return { ok: false, error: "Wybierz poprawną datę wizyty." };
  try {
    await acceptRequest(ctx.tenantId, id, scheduledAt);
  } catch (err) {
    console.error("acceptRequestAction failed:", err);
    return { ok: false, error: "Nie udało się przyjąć zlecenia." };
  }
  revalidatePath("/zespol/zlecenia");
  revalidatePath("/zespol/grafik");
  revalidatePath("/zespol");
  return { ok: true };
}

export async function declineRequestAction(id: string, reason: string): Promise<Result> {
  const ctx = await requireGardener();
  if (!ctx) return { ok: false, error: "Brak uprawnień." };
  try {
    await declineRequest(ctx.tenantId, id, reason);
  } catch (err) {
    console.error("declineRequestAction failed:", err);
    return { ok: false, error: "Nie udało się odrzucić zlecenia." };
  }
  revalidatePath("/zespol/zlecenia");
  revalidatePath("/zespol");
  return { ok: true };
}

export async function completeRequestAction(id: string): Promise<Result> {
  const ctx = await requireGardener();
  if (!ctx) return { ok: false, error: "Brak uprawnień." };
  try {
    await completeRequest(ctx.tenantId, id);
  } catch (err) {
    console.error("completeRequestAction failed:", err);
    return { ok: false, error: "Nie udało się zakończyć zlecenia." };
  }
  revalidatePath("/zespol/zlecenia");
  revalidatePath("/zespol");
  return { ok: true };
}
```

- [ ] **Step 2: Write the grafik actions**

Create `src/app/(app)/zespol/grafik/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";

import { requireGardener } from "@/lib/team-auth";
import { setVisitStatus, createVisit } from "@/lib/visits";

type Result = { ok: true } | { ok: false; error: string };

export async function setVisitStatusAction(
  id: string,
  status: "done" | "cancelled",
): Promise<Result> {
  const ctx = await requireGardener();
  if (!ctx) return { ok: false, error: "Brak uprawnień." };
  try {
    await setVisitStatus(id, status);
  } catch (err) {
    console.error("setVisitStatusAction failed:", err);
    return { ok: false, error: "Nie udało się zaktualizować wizyty." };
  }
  revalidatePath("/zespol/grafik");
  revalidatePath("/zespol");
  return { ok: true };
}

export async function scheduleNextVisitAction(input: {
  requestId: string;
  lawnId: string;
  customerId: string;
  scheduledAt: string;
}): Promise<Result> {
  const ctx = await requireGardener();
  if (!ctx) return { ok: false, error: "Brak uprawnień." };
  if (!input.scheduledAt || Number.isNaN(Date.parse(input.scheduledAt)))
    return { ok: false, error: "Wybierz poprawną datę wizyty." };
  try {
    await createVisit(input);
  } catch (err) {
    console.error("scheduleNextVisitAction failed:", err);
    return { ok: false, error: "Nie udało się zaplanować wizyty." };
  }
  revalidatePath("/zespol/grafik");
  return { ok: true };
}
```

- [ ] **Step 3: Check**

Run: `NODE_OPTIONS="--max-old-space-size=1536" npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/zespol/zlecenia/actions.ts" "src/app/(app)/zespol/grafik/actions.ts"
git commit -m "feat(team): gardener server actions (accept/decline/complete, visit status/next)"
```

---

## Task 7: Request-triage UI (zlecenia page + card)

**Files:**
- Create: `src/components/team/RequestTriageCard.tsx`
- Modify: `src/app/(app)/zespol/zlecenia/page.tsx`

- [ ] **Step 1: Write the triage card (client island with the two dialogs)**

Create `src/components/team/RequestTriageCard.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { formatRange } from "@/lib/pricing";
import type { TeamRequestView } from "@/lib/team";
import { LawnSnapshot } from "@/components/lawns/LawnSnapshot";
import {
  acceptRequestAction,
  declineRequestAction,
  completeRequestAction,
} from "@/app/(app)/zespol/zlecenia/actions";

/** Tomorrow 09:00 local, formatted for <input type="datetime-local">. */
function defaultSlot(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RequestTriageCard({ request }: { request: TeamRequestView }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [mode, setMode] = useState<"none" | "accept" | "decline">("none");
  const [slot, setSlot] = useState(defaultSlot);
  const [reason, setReason] = useState("");

  function refresh(msg: string) {
    toast.success(msg);
    setMode("none");
    router.refresh();
  }

  function onAccept() {
    start(async () => {
      const res = await acceptRequestAction(request.id, new Date(slot).toISOString());
      if (!res.ok) toast.error(res.error);
      else refresh("Zlecenie przyjęte — wizyta zaplanowana.");
    });
  }
  function onDecline() {
    start(async () => {
      const res = await declineRequestAction(request.id, reason.trim());
      if (!res.ok) toast.error(res.error);
      else refresh("Zlecenie odrzucone.");
    });
  }
  function onComplete() {
    start(async () => {
      const res = await completeRequestAction(request.id);
      if (!res.ok) toast.error(res.error);
      else refresh("Zlecenie zakończone.");
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 overflow-hidden rounded-xl border border-neutral-100">
        <div className="relative aspect-[16/6] bg-emerald-900/10">
          <LawnSnapshot
            polygon={request.polygon as never}
            buildings={request.buildings as never}
            alt={`Mapa — ${request.lawnName}`}
            width={720}
            height={270}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <h3 className="font-semibold tracking-tight text-neutral-900">{request.lawnName}</h3>
      <p className="text-xs text-neutral-500">
        {request.customerName}
        {request.address ? ` · ${request.address}` : ""}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {request.items.map((it, i) => (
          <li key={i} className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600">
            {it.serviceTitle}
            {it.custom ? " · wycena" : ""}
          </li>
        ))}
      </ul>
      {request.note && <p className="mt-2 text-sm text-neutral-600">„{request.note}”</p>}
      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-sm font-bold text-emerald-700">
          {request.estMin > 0 ? formatRange(request.estMin, request.estMax) : "Wycena indywidualna"}
        </span>
        {request.status === "new" && mode === "none" && (
          <div className="flex gap-2">
            <button
              onClick={() => setMode("decline")}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
            >
              Odrzuć
            </button>
            <button
              onClick={() => setMode("accept")}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Przyjmij
            </button>
          </div>
        )}
        {request.status === "accepted" && (
          <button
            onClick={onComplete}
            disabled={pending}
            className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
          >
            {pending ? "…" : "Zakończ zlecenie"}
          </button>
        )}
      </div>

      {mode === "accept" && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
          <label className="block text-xs font-medium text-neutral-700">Termin wizyty</label>
          <input
            type="datetime-local"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setMode("none")} disabled={pending} className="rounded-lg px-3 py-1.5 text-xs text-neutral-500">
              Anuluj
            </button>
            <button onClick={onAccept} disabled={pending} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {pending ? "…" : "Przyjmij i zaplanuj"}
            </button>
          </div>
        </div>
      )}
      {mode === "decline" && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50/50 p-3">
          <label className="block text-xs font-medium text-neutral-700">Powód (widoczny dla klienta)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            placeholder="np. poza obszarem działania"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setMode("none")} disabled={pending} className="rounded-lg px-3 py-1.5 text-xs text-neutral-500">
              Wróć
            </button>
            <button onClick={onDecline} disabled={pending} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {pending ? "…" : "Odrzuć zlecenie"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace the zlecenia ComingSoon page**

Replace `src/app/(app)/zespol/zlecenia/page.tsx`:

```tsx
import { headers } from "next/headers";

import { requireGardener } from "@/lib/team-auth";
import { getTenantRequests } from "@/lib/team";
import { RequestTriageCard } from "@/components/team/RequestTriageCard";

export const metadata = { title: "Zlecenia" };

const GROUPS = [
  { key: "new", label: "Nowe", match: (s: string) => s === "new" },
  { key: "active", label: "W realizacji", match: (s: string) => s === "accepted" },
  { key: "archive", label: "Archiwum", match: (s: string) => ["done", "declined", "cancelled"].includes(s) },
] as const;

export default async function ZleceniaPage() {
  // headers() keeps this dynamic; the gate also runs in the layout.
  await headers();
  const ctx = await requireGardener();
  const requests = ctx ? await getTenantRequests(ctx.tenantId) : [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Zlecenia</h1>
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
          <div className="text-3xl">🌿</div>
          <h2 className="mt-3 font-semibold text-neutral-900">Brak zleceń</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Gdy klient zamówi usługi, zlecenie pojawi się tutaj do przyjęcia.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {GROUPS.map((g) => {
            const items = requests.filter((r) => g.match(r.status));
            if (items.length === 0) return null;
            return (
              <section key={g.key}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  {g.label} · {items.length}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((r) => (
                    <RequestTriageCard key={r.id} request={r} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Check**

Run: `NODE_OPTIONS="--max-old-space-size=1536" npx tsc --noEmit && NODE_OPTIONS="--max-old-space-size=1536" npx eslint`
Expected: PASS (0 errors; the 3 known `<img>` warnings only).

- [ ] **Step 4: Commit**

```bash
git add "src/components/team/RequestTriageCard.tsx" "src/app/(app)/zespol/zlecenia/page.tsx"
git commit -m "feat(team): /zespol/zlecenia triage list (accept/decline/complete)"
```

---

## Task 8: Schedule UI (grafik page + visit card)

**Files:**
- Create: `src/components/team/VisitCard.tsx`
- Create: `src/app/(app)/zespol/grafik/page.tsx`
- Modify: `src/lib/visits.ts` (add `getTeamVisits`)
- Modify: `src/lib/team.ts` (no change) — see note

- [ ] **Step 1: Add the team agenda read to visits.ts**

Append to `src/lib/visits.ts`:

```ts
/** All non-cancelled visits for a tenant, soonest first (the team agenda). */
export async function getTeamVisits(tenantId: string): Promise<VisitView[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "visits",
    where: { and: [{ tenant: { equals: tenantId } }, { status: { not_equals: "cancelled" } }] },
    sort: "scheduledAt",
    depth: 1,
    limit: 300,
  });
  return docs.map(project);
}
```

- [ ] **Step 2: Write the visit card**

Create `src/components/team/VisitCard.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { VisitView } from "@/lib/visits";
import {
  setVisitStatusAction,
  scheduleNextVisitAction,
} from "@/app/(app)/zespol/grafik/actions";

function plusDaysSlot(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function VisitCard({ visit, overdue }: { visit: VisitView; overdue?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [planning, setPlanning] = useState(false);
  const [slot, setSlot] = useState(() => plusDaysSlot(visit.scheduledAt, 7));

  const time = new Date(visit.scheduledAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

  function act(fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) {
    start(async () => {
      const res = await fn();
      if (!res.ok) toast.error(res.error ?? "Błąd.");
      else {
        toast.success(msg);
        setPlanning(false);
        router.refresh();
      }
    });
  }

  return (
    <div className={`rounded-xl border bg-white p-3 ${overdue ? "border-amber-300" : "border-neutral-200"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {time} · {visit.lawnName}
          </p>
          <p className="text-xs text-neutral-500">{visit.customerName}</p>
          {visit.serviceTitles.length > 0 && (
            <p className="mt-1 text-xs text-neutral-400">{visit.serviceTitles.join(" · ")}</p>
          )}
        </div>
        {visit.assigneeName && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{visit.assigneeName}</span>
        )}
      </div>
      {visit.status === "planned" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => act(() => setVisitStatusAction(visit.id, "done"), "Wizyta wykonana.")}
            disabled={pending}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Wykonana
          </button>
          <button
            onClick={() => act(() => setVisitStatusAction(visit.id, "cancelled"), "Wizyta odwołana.")}
            disabled={pending}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 disabled:opacity-60"
          >
            Odwołaj
          </button>
          <button
            onClick={() => setPlanning((v) => !v)}
            disabled={pending}
            className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
          >
            Zaplanuj kolejną
          </button>
        </div>
      ) : (
        <p className="mt-2 text-xs font-medium text-emerald-600">✓ Wykonana</p>
      )}
      {planning && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
          <label className="block text-xs font-medium text-neutral-700">Termin kolejnej wizyty</label>
          <input
            type="datetime-local"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setPlanning(false)} disabled={pending} className="rounded-lg px-3 py-1.5 text-xs text-neutral-500">
              Anuluj
            </button>
            <button
              onClick={() =>
                act(
                  () =>
                    scheduleNextVisitAction({
                      requestId: visit.requestId,
                      lawnId: visit.lawnId,
                      customerId: visit.customerId,
                      scheduledAt: new Date(slot).toISOString(),
                    }),
                  "Kolejna wizyta zaplanowana.",
                )
              }
              disabled={pending}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {pending ? "…" : "Zaplanuj"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

NOTE: `suggestNextVisitDate` is the pure source of truth for the gap, but the card needs a `datetime-local` string (local, no seconds/Z), so it uses the small `plusDaysSlot` formatter with a +7 default. If you want the per-frequency gap reflected in the prefill, thread the request's dominant frequency into `VisitView` and map it; for MVP the +7 default is acceptable and `suggestNextVisitDate` stays covered by the check script for the server/data path.

- [ ] **Step 3: Write the grafik page (day-grouped agenda)**

Create `src/app/(app)/zespol/grafik/page.tsx`:

```tsx
import { headers } from "next/headers";

import { requireGardener } from "@/lib/team-auth";
import { getTeamVisits, type VisitView } from "@/lib/visits";
import { VisitCard } from "@/components/team/VisitCard";

export const metadata = { title: "Grafik" };

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
}

export default async function GrafikPage() {
  await headers();
  const ctx = await requireGardener();
  const visits = ctx ? await getTeamVisits(ctx.tenantId) : [];

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const overdue = visits.filter((v) => v.status === "planned" && new Date(v.scheduledAt) < startOfToday);
  const upcoming = visits.filter((v) => !(v.status === "planned" && new Date(v.scheduledAt) < startOfToday));

  // Group upcoming by day (already sorted soonest-first).
  const byDay = new Map<string, VisitView[]>();
  for (const v of upcoming) {
    const k = dayKey(v.scheduledAt);
    (byDay.get(k) ?? byDay.set(k, []).get(k)!).push(v);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Grafik</h1>
      {visits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
          <div className="text-3xl">📅</div>
          <h2 className="mt-3 font-semibold text-neutral-900">Brak zaplanowanych wizyt</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Przyjmij zlecenie z zakładki „Zlecenia”, aby zaplanować pierwszą wizytę.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {overdue.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-600">Zaległe · {overdue.length}</h2>
              <div className="space-y-2">
                {overdue.map((v) => (
                  <VisitCard key={v.id} visit={v} overdue />
                ))}
              </div>
            </section>
          )}
          {[...byDay.entries()].map(([day, items]) => (
            <section key={day}>
              <h2 className="mb-3 text-sm font-semibold capitalize text-neutral-700">{day}</h2>
              <div className="space-y-2">
                {items.map((v) => (
                  <VisitCard key={v.id} visit={v} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Check**

Run: `NODE_OPTIONS="--max-old-space-size=1536" npx tsc --noEmit && NODE_OPTIONS="--max-old-space-size=1536" npx eslint`
Expected: PASS (0 errors). If the `byDay.set(...).get(k)!` line trips eslint/tsc, replace with an explicit:
```ts
  for (const v of upcoming) {
    const k = dayKey(v.scheduledAt);
    const arr = byDay.get(k);
    if (arr) arr.push(v); else byDay.set(k, [v]);
  }
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/visits.ts "src/components/team/VisitCard.tsx" "src/app/(app)/zespol/grafik/page.tsx"
git commit -m "feat(team): /zespol/grafik agenda (done/cancel/schedule-next, overdue)"
```

---

## Task 9: Nav + gardener dashboard + customer wiring

**Files:**
- Modify: `src/components/app-shell/app-nav.ts`
- Modify: `src/app/(app)/zespol/page.tsx`
- Modify: `src/app/(app)/panel/page.tsx`
- Modify: `src/components/requests/RequestCard.tsx`
- Modify: `src/components/requests/RequestActions.tsx`
- Modify: `src/lib/requests.ts`

- [ ] **Step 1: Add the Grafik nav item**

In `src/components/app-shell/app-nav.ts`, add `CalendarDays` to the lucide import and insert the item in the `gardener` array after Zlecenia:

```ts
import {
  LayoutDashboard,
  MapPin,
  Leaf,
  ClipboardList,
  History,
  Settings,
  Users,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
```

```ts
  gardener: [
    { label: "Pulpit", href: "/zespol", icon: LayoutDashboard },
    { label: "Zlecenia", href: "/zespol/zlecenia", icon: ClipboardList },
    { label: "Grafik", href: "/zespol/grafik", icon: CalendarDays },
    { label: "Klienci", href: "/zespol/klienci", icon: Users },
    { label: "Ustawienia", href: "/zespol/ustawienia", icon: Settings },
  ],
```

- [ ] **Step 2: Gardener dashboard counts**

Replace `src/app/(app)/zespol/page.tsx`:

```tsx
import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { requireGardener } from "@/lib/team-auth";
import { getTenantRequests } from "@/lib/team";
import { getTeamVisits } from "@/lib/visits";

export const metadata = { title: "Pulpit" };

export default async function ZespolPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user?.name;
  const ctx = await requireGardener();
  const [requests, visits] = ctx
    ? await Promise.all([getTenantRequests(ctx.tenantId), getTeamVisits(ctx.tenantId)])
    : [[], []];

  const newCount = requests.filter((r) => r.status === "new").length;
  const weekAhead = new Date();
  weekAhead.setDate(weekAhead.getDate() + 7);
  const upcoming = visits.filter(
    (v) => v.status === "planned" && new Date(v.scheduledAt) <= weekAhead,
  ).length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Witaj{name ? `, ${name}` : ""} 👋</h1>
      <p className="mt-2 text-sm text-neutral-500">Zlecenia klientów i grafik zespołu Ogrody Kryscar.</p>

      <Link href="/zespol/zlecenia" className="mt-6 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-emerald-300">
        <div>
          <p className="text-sm text-neutral-500">Nowe zlecenia</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {newCount === 0 ? "Brak nowych" : `${newCount} do przyjęcia`}
          </p>
        </div>
        <span aria-hidden className="text-emerald-700">→</span>
      </Link>

      <Link href="/zespol/grafik" className="mt-3 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-emerald-300">
        <div>
          <p className="text-sm text-neutral-500">Wizyty (najbliższe 7 dni)</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {upcoming === 0 ? "Brak wizyt" : `${upcoming} zaplanowane`}
          </p>
        </div>
        <span aria-hidden className="text-emerald-700">→</span>
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Customer "Najbliższa wizyta" line**

In `src/app/(app)/panel/page.tsx`, add the import and fetch, then render a line. Add near the other imports:

```ts
import { getUpcomingVisitsForCustomer } from "@/lib/visits";
```

After the `requests` fetch (inside the `session ?` block) add:

```ts
  const upcomingVisits = session ? await getUpcomingVisitsForCustomer(session.user.id, 1) : [];
  const nextVisit = upcomingVisits[0] ?? null;
```

Then, after the "Zamówienia" `<Link>` block, insert:

```tsx
      {nextVisit && (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
          <p className="text-sm text-neutral-500">Najbliższa wizyta</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">
            {nextVisit.lawnName} ·{" "}
            {new Date(nextVisit.scheduledAt).toLocaleDateString("pl-PL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      )}
```

- [ ] **Step 4: Customer status badges + declineReason**

Replace the `STATUS_LABEL` map in `src/components/requests/RequestCard.tsx` and surface the reason. New map:

```ts
const STATUS_LABEL: Record<RequestView["status"], { label: string; cls: string }> = {
  draft: { label: "Szkic", cls: "bg-neutral-100 text-neutral-600" },
  new: { label: "Nowe", cls: "bg-emerald-100 text-emerald-700" },
  accepted: { label: "Przyjęte", cls: "bg-sky-100 text-sky-700" },
  declined: { label: "Odrzucone", cls: "bg-red-100 text-red-700" },
  cancelled: { label: "Anulowane", cls: "bg-red-100 text-red-700" },
  done: { label: "Zakończone", cls: "bg-neutral-200 text-neutral-700" },
};
```

Change the actions condition near the bottom from `request.status === "new"` to also allow `accepted`:

```tsx
        {(request.status === "new" || request.status === "accepted") && <RequestActions id={request.id} />}
```

`RequestView` has no `declineReason` yet — add it. In `src/lib/requests.ts` add to `RequestView`:

```ts
  declineReason: string | null;
```

and in `project()`:

```ts
    declineReason: doc.declineReason ?? null,
```

Then in `RequestCard.tsx`, after the items `<ul>`, add:

```tsx
      {request.status === "declined" && request.declineReason && (
        <p className="mt-2 text-xs text-red-600">Powód: {request.declineReason}</p>
      )}
```

- [ ] **Step 5: Full check + build**

Run: `npm run check && NODE_OPTIONS="--max-old-space-size=1536" npm run build`
Expected: check PASS (incl. `visits OK`); build PASS. (If `npm run check`'s `tsc` OOM-kills, run the steps individually with the `NODE_OPTIONS` cap as noted in the Verification model.)

- [ ] **Step 6: Commit**

```bash
git add src/components/app-shell/app-nav.ts "src/app/(app)/zespol/page.tsx" "src/app/(app)/panel/page.tsx" src/components/requests/RequestCard.tsx src/components/requests/RequestActions.tsx src/lib/requests.ts
git commit -m "feat(team): Grafik nav + gardener dashboard counts + customer status/visit wiring"
```

---

## Task 10: Wire the customer cancel to cancel planned visits

**Files:**
- Modify: `src/lib/requests.ts`

- [ ] **Step 1: Extend cancelRequest to also cancel visits**

In `src/lib/requests.ts`, add the import:

```ts
import { cancelVisitsForRequest } from "./visits";
```

Replace `cancelRequest`:

```ts
export async function cancelRequest(userId: string, id: string): Promise<void> {
  const existing = await getRequest(userId, id);
  if (!existing) return; // no-op for non-owners / missing
  // Only new/accepted are cancellable; declined/done/cancelled are terminal.
  if (existing.status !== "new" && existing.status !== "accepted") return;
  const payload = await getPayload({ config });
  await payload.update({ collection: "service-requests", id, data: { status: "cancelled" } });
  await cancelVisitsForRequest(id);
}
```

- [ ] **Step 2: Check**

Run: `NODE_OPTIONS="--max-old-space-size=1536" npx tsc --noEmit`
Expected: PASS. (Watch for an import cycle: `requests.ts` → `visits.ts`. `visits.ts` does NOT import `requests.ts`, and `team.ts` imports both, so there's no cycle. If tsc reports one, move `cancelVisitsForRequest` consumption behind a dynamic `await import("./visits")`.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/requests.ts
git commit -m "feat(requests): cancelling a request cancels its planned visits"
```

---

## Task 11: Payload MCP plugin

**Files:**
- Modify: `src/payload.config.ts`
- Modify: `src/collections/Lawns.ts`, `src/collections/ServiceRequests.ts`, `src/collections/Visits.ts` (access carve-out)
- Modify: `README.md` (dev wiring note)

- [ ] **Step 1: Install the plugin**

Run: `npm install @payloadcms/plugin-mcp`
Expected: resolves a version compatible with `payload@3.85`. **If it forces a mismatched payload major or fails to resolve, STOP and surface to the user — do not pin a mismatched version.**

- [ ] **Step 2: Identify the API-key principal (investigation step — required, not optional)**

Read the installed plugin to learn how an MCP request authenticates and what `req.user` looks like for a valid API key:

Run: `sed -n '1,80p' node_modules/@payloadcms/plugin-mcp/dist/index.js` and grep for the api-keys collection slug and how it sets the request user:
Run: `grep -rn "collection\|apiKey\|api-key\|slug" node_modules/@payloadcms/plugin-mcp/dist/*.js | head -40`

Record the exact principal discriminator (expected: the plugin registers an auth-enabled collection — e.g. slug `mcp-api-keys` or similar — and authenticated MCP requests arrive with `req.user.collection === "<that slug>"`). Use that exact slug in Step 4. If the plugin instead runs with `overrideAccess` (admin) for MCP calls, the carve-out in Step 4 is unnecessary — note that and skip it.

- [ ] **Step 3: Register the plugin**

In `src/payload.config.ts`, add the import and append to `plugins` (after `vercelBlobStorage`):

```ts
import { mcpPlugin } from "@payloadcms/plugin-mcp";
```

```ts
    mcpPlugin({
      collections: {
        services: { enabled: true },
        "service-requests": { enabled: true },
        lawns: { enabled: true },
        visits: { enabled: true },
        tenants: { enabled: true },
      },
    }),
```

(Exact option shape per the plugin docs — `collections: { <slug>: { enabled: true } }` enables full CRUD; if the installed version uses `enabled: { find, create, update, delete }`, set all four true.)

- [ ] **Step 4: Access carve-out for the closed collections (only if Step 2 found a principal)**

The MCP plugin inherits the API key's user access; `lawns`/`service-requests`/`visits` are `() => false`, so MCP CRUD would be denied. Add a single carve-out. Create a tiny shared helper `src/collections/access/mcp.ts`:

```ts
import type { Access } from "payload";

/** Allow ONLY the MCP plugin's API-key principal; everyone else denied. The
 * data-layer ownership boundary is unaffected (BA customers never reach here). */
const MCP_KEYS_SLUG = "<slug-from-Task-11-Step-2>";
export const mcpOnly: Access = ({ req }) => req.user?.collection === MCP_KEYS_SLUG;
```

Then in each of `Lawns.ts`, `ServiceRequests.ts`, `Visits.ts`, change access from `() => false` to `mcpOnly` for all four operations, e.g.:

```ts
import { mcpOnly } from "./access/mcp";
// ...
  access: { read: mcpOnly, create: mcpOnly, update: mcpOnly, delete: mcpOnly },
```

(If Step 2 found the plugin uses admin override, skip this step entirely and leave the collections closed.)

- [ ] **Step 5: README dev note**

Append to the README a short "Payload MCP" subsection:

```markdown
### Payload MCP (data tooling)

Ops collections (`services`, `service-requests`, `lawns`, `visits`, `tenants`) are
exposed at `/api/mcp` for agent tooling. Mint a key in `/admin` → **MCP → API Keys**
(treat it like an admin password — it reaches customer data), then:

    claude mcp add --transport http payload http://localhost:1111/api/mcp \
      --header "Authorization: Bearer <YOUR_KEY>"
```

- [ ] **Step 6: Generate types + full check + build**

Run: `NODE_OPTIONS="--max-old-space-size=1536" npx payload generate:types && npm run check && NODE_OPTIONS="--max-old-space-size=1536" npm run build`
Expected: PASS. The plugin may add its own collection(s) to `payload-types.ts` (the api-keys store) — that's expected; do not register them on the MCP surface.

- [ ] **Step 7: Commit**

```bash
git add src/payload.config.ts src/collections/ README.md package.json package-lock.json src/payload-types.ts
git commit -m "feat(mcp): expose ops collections at /api/mcp via @payloadcms/plugin-mcp"
```

---

## Task 12: Manual smoke test (demo accounts)

**Files:** none (verification only)

- [ ] **Step 1: Seed demo accounts + start dev**

Run: `npx tsx --env-file=.env scripts/seed-demo-users.ts` then `npm run dev`
Expected: prints klient + ogrodnik credentials; dev server on `http://localhost:1111` (pushes the new `visits` schema + the `service-requests` status change on first load).

- [ ] **Step 2: Customer creates a request**

As `demo.klient@kryscar.pl`: add a lawn (or use an existing one) → `/panel/ogrody/[id]/zamow` → pick services → submit. Confirm it appears at `/panel/zamowienia` with status **Nowe**.

- [ ] **Step 3: Gardener triages + schedules**

As `demo.ogrodnik@kryscar.pl`: `/zespol/zlecenia` shows the request under **Nowe** → **Przyjmij** → pick a date → confirm it moves to **W realizacji** and a visit appears at `/zespol/grafik`. Mark it **Wykonana**. Try **Zaplanuj kolejną** → confirm a new visit row.

- [ ] **Step 4: Customer sees status + visit**

Back as the customer: `/panel/zamowienia` shows **Przyjęte**; `/panel` shows the "Najbliższa wizyta" line (if the visit is still planned/future). Decline another request as the gardener → customer sees **Odrzucone** + reason.

- [ ] **Step 5: MCP smoke (optional, if Task 11 landed)**

Mint a key in `/admin` → MCP → API Keys. Run the `claude mcp add` line from the README, then in a fresh Claude session confirm `findVisits` / `findServiceRequests` return data. Remove the key after.

- [ ] **Step 6: Record results**

No commit. Note any defects as follow-up tasks. If all green, proceed to Mind upkeep (Task 13).

---

## Task 13: Mind upkeep

**Files:**
- Create: `kryscar-mind/map/zones/team-schedule.md`
- Create: `kryscar-mind/map/decisions/visit-per-row-schedule.md`
- Modify: `kryscar-mind/map/zones/service-requests.md`, `app-shell.md` (re-stamp + note)
- Regenerate: `kryscar-mind/map/index.md`

- [ ] **Step 1: Write the team-schedule zone card**

Create `kryscar-mind/map/zones/team-schedule.md` with frontmatter (`type: zone`, summary, `sources: ["[[2026-06-10-team-schedule-mvp-design]]"]`, `owns` listing the visits collection + `src/lib/visits.ts`/`team.ts`/`team-auth.ts` + the two `/zespol` routes + their components, `invariants` with `enforcedBy: ["scripts/check-visits.ts (npm run check)"]` for the transition guard and the gardener-boundary rule, `verifiedAt: <HEAD sha>`). Body: purpose, the lifecycle diagram, the team-boundary explanation, the MCP surface note.

- [ ] **Step 2: Write the decision record**

Create `kryscar-mind/map/decisions/visit-per-row-schedule.md` (`type: decision`): why a `visits` collection (one dated row per appointment) over schedule-fields-on-request — supports recurrence-by-next-visit + cheap customer/team queries without a series engine; links `[[team-schedule]]`, `[[service-requests]]`.

- [ ] **Step 3: Re-stamp touched cards**

Update `service-requests.md` (note the extended status model + that visits/team own the gardener side; bump `updated` + `verifiedAt` to HEAD) and `app-shell.md` (Grafik nav item; bump `verifiedAt`). Add the MCP invariant to a relevant card if appropriate.

- [ ] **Step 4: Regenerate + verify fresh**

Run: `node scripts/mind/generate.mjs`
Expected: `✓ Mind: 24 zones, …`. Confirm `team-schedule`, `service-requests`, `app-shell` show ✓ fresh in `kryscar-mind/map/index.md`.

- [ ] **Step 5: Commit**

```bash
git add kryscar-mind/
git commit -m "docs(mind): team-schedule zone + visit-per-row decision; re-stamp service-requests/app-shell"
```

---

## Self-review notes (author)

- **Spec coverage:** visits collection (T2), status model (T1), requireGardener boundary (T5), zlecenia triage (T6,T7), grafik schedule (T6,T8), suggestNextVisitDate (T3), customer status + najbliższe wizyty (T9), cancel→visits (T10), MCP full-CRUD + carve-out (T11), check-visits (T3), smoke (T12), Mind (T13). All spec sections map to a task.
- **Known risk (flagged, not a placeholder):** the MCP access principal (T11 S2) is a genuine read-the-source investigation, not a guess — the plan branches on what's found rather than asserting a slug.
- **Type consistency:** `VisitView`, `TeamRequestView`, `GardenerCtx`, `canTransitionRequest`, `suggestNextVisitDate`, `getTeamVisits`, `getUpcomingVisitsForCustomer` names are used identically across tasks. `RequestView.status`/`declineReason` widened in T1/T9 before consumers read them.
- **Datetime nuance (flagged):** server stores ISO/UTC; client dialogs use `datetime-local` (local) and convert via `new Date(slot).toISOString()`. `suggestNextVisitDate` stays the pure/server source of truth; the card prefill uses a local +7 formatter — noted in T8 S2.
