# Service Selection & Pricing (3b.1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a customer pick "what should be done" to a lawn from a smart catalog with live "od X do Y zł" pricing, saved as a `serviceRequest` — driven entirely by pricing metadata on the `services` collection.

**Architecture:** Pricing moves onto the `services` collection (a `pricing` group); a pure, data-driven `src/lib/pricing.ts` `estimate()` reads it and is shared by the client configurator (live) and the server (`createRequest` recompute, authoritative). A new owner-scoped `service-requests` collection (via `src/lib/requests.ts`, same security seam as lawns) stores a basket of configured line items per lawn. The configurator is a smart-catalog client island at `/panel/ogrody/[id]/zamow`; `/panel/zamowienia` lists the history.

**Tech Stack:** Next.js 16 (RSC + server actions), React 19, PayloadCMS 3.85 (dev-push), Better Auth, Tailwind v4, shadcn.

---

## Conventions for every task

- **Gate = `npm run check`** (tsc + eslint + payload generate:types + mind). The repo has no unit-test runner; pure logic is checked by `npx tsx scripts/check-pricing.ts`.
- Three pre-existing `<img>` eslint warnings are expected — NOT failures.
- Payload config alias `@payload-config`; generated types `@/payload-types`. ESM, strict TS.
- **Schema = dev-push, NOT migrations.** New columns/tables (the `pricing` group on `services`, the `service-requests` table) are created by a **controller-authorized dev-push** — batched into ONE step before runtime verification (see Final verification). Implementer subagents add the fields/collection + regenerate types only; they must NOT run any dev-push/seed.
- **Client/server boundary:** `src/lib/pricing.ts` is PURE (no payload/server imports) so the client configurator AND the server both call the same `estimate()`. Client components import only `@/lib/pricing`, `@/lib/calculator` (also pure), the server actions, and types — never `@/lib/requests`, `@/lib/catalog`, or `@/lib/lawns` (server-only).
- Ownership: like lawns, the BA→Payload Local API runs as admin, so ownership lives in `src/lib/requests.ts`; the server recomputes `estMin`/`estMax` (client values are display-only).
- This builds on merged 3a + smart-map. Work proceeds on the current branch.

---

## File Structure

**Create:**
- `src/lib/pricing.ts` — pure: `Frequency`, `PricingKind`, `ServicePricing`, `PricedService`, `RequestLineInput`, `LineEstimate`, `Estimate`, `estimate()`, `FREQUENCY_MULT`, `FREQUENCY_LABEL`, `formatPLN`, `formatRange`.
- `scripts/check-pricing.ts` — runnable sanity checks for `estimate()`.
- `src/collections/ServiceRequests.ts` — the `service-requests` collection.
- `src/lib/requests.ts` — owner-scoped data layer + `createRequest` (server recompute).
- `src/app/(app)/panel/zamowienia/actions.ts` — `createRequestAction`, `cancelRequestAction`.
- `src/components/requests/ServiceConfigurator.tsx` — the smart-catalog client island.
- `src/components/requests/RequestCard.tsx` + `RequestActions.tsx` — list card + cancel.
- `src/app/(app)/panel/ogrody/[id]/zamow/page.tsx` — configurator route.

**Modify:**
- `src/collections/Services.ts` — add the `pricing` group.
- `src/lib/services-seed-data.ts` — add `SERVICE_PRICING` map.
- `scripts/seed-services.ts` — write `pricing` on upsert.
- `src/lib/catalog.ts` — add `getConfiguratorServices()` (+ `ConfiguratorService` type).
- `src/payload.config.ts` — register `ServiceRequests`.
- `src/components/lawns/LawnCard.tsx` — "Zamów usługi" → `/panel/ogrody/[id]/zamow`.
- `src/app/(app)/panel/zamowienia/page.tsx` — replace stub with the list.
- `src/app/(app)/panel/page.tsx` — add a "X zapytań" summary line.

**Mind (Task 10):** new zone `service-requests`; decisions `services-pricing-metadata`, `service-request-model`.

---

### Task 1: Pricing engine (`src/lib/pricing.ts`) + sanity

**Files:** Create `src/lib/pricing.ts`, `scripts/check-pricing.ts`

- [ ] **Step 1: Create `src/lib/pricing.ts`**
```ts
/**
 * Data-driven price estimate, read from each service's `pricing` metadata (the
 * single source of truth on the services collection). PURE — no payload/server
 * imports — so the client configurator and the server recompute share it.
 * Returns a min–max RANGE: the final quote always depends on on-site conditions.
 */
export type Frequency =
  | "jednorazowo"
  | "co_tydzien"
  | "co_2_tyg"
  | "raz_w_miesiacu"
  | "sezonowy";

export type PricingKind = "area" | "perUnit" | "fixed" | "custom";

export interface ServicePricing {
  kind: PricingKind;
  basePrice?: number | null;
  pricePerM2?: number | null;
  pricePerUnit?: number | null;
  unitLabel?: string | null;
  recurring?: boolean | null;
}

/** Minimal service shape the estimate needs (catalog items satisfy it). */
export interface PricedService {
  slug: string;
  title: string;
  pricing: ServicePricing;
}

export interface RequestLineInput {
  serviceSlug: string;
  frequency?: Frequency;
  quantity?: number;
}

export interface LineEstimate {
  serviceSlug: string;
  label: string;
  min: number;
  max: number;
  custom: boolean;
}

export interface Estimate {
  lines: LineEstimate[];
  min: number;
  max: number;
  hasCustom: boolean;
}

// Business-policy constants (from calculator.ts). A future Payload Global could
// own these; per-service data stays on the collection.
export const FREQUENCY_MULT: Record<Frequency, number> = {
  jednorazowo: 1.0,
  co_tydzien: 0.85,
  co_2_tyg: 0.92,
  raz_w_miesiacu: 0.96,
  sezonowy: 0.88,
};

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  jednorazowo: "Jednorazowo",
  co_tydzien: "Co tydzień",
  co_2_tyg: "Co 2 tyg.",
  raz_w_miesiacu: "Raz w miesiącu",
  sezonowy: "Sezonowo",
};

const RANGE_SPREAD = 0.15;

const PLN = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });
export const formatPLN = (n: number): string => `${PLN.format(n)} zł`;
export const formatRange = (min: number, max: number): string =>
  min === max ? formatPLN(min) : `od ${PLN.format(min)} do ${formatPLN(max)}`;

/**
 * Estimate a basket of line items against a lawn area. Unknown/`custom`/
 * non-positive lines are flagged `custom` (shown as "wycena", excluded from totals).
 */
export function estimate(
  services: PricedService[],
  items: RequestLineInput[],
  areaM2: number,
): Estimate {
  const bySlug = new Map(services.map((s) => [s.slug, s]));
  const lines: LineEstimate[] = items.map((item) => {
    const svc = bySlug.get(item.serviceSlug);
    const label = svc?.title ?? item.serviceSlug;
    const p = svc?.pricing;
    if (!p || p.kind === "custom") {
      return { serviceSlug: item.serviceSlug, label, min: 0, max: 0, custom: true };
    }
    const base = p.basePrice ?? 0;
    let cost: number;
    if (p.kind === "area") cost = base + (p.pricePerM2 ?? 0) * Math.max(0, areaM2);
    else if (p.kind === "perUnit")
      cost = base + (p.pricePerUnit ?? 0) * Math.max(0, item.quantity ?? 0);
    else cost = base; // fixed
    if (cost <= 0) {
      return { serviceSlug: item.serviceSlug, label, min: 0, max: 0, custom: true };
    }
    const mult = p.recurring && item.frequency ? (FREQUENCY_MULT[item.frequency] ?? 1) : 1;
    const adj = cost * mult;
    return {
      serviceSlug: item.serviceSlug,
      label,
      min: Math.round(adj * (1 - RANGE_SPREAD)),
      max: Math.round(adj * (1 + RANGE_SPREAD)),
      custom: false,
    };
  });
  const priced = lines.filter((l) => !l.custom);
  return {
    lines,
    min: priced.reduce((s, l) => s + l.min, 0),
    max: priced.reduce((s, l) => s + l.max, 0),
    hasCustom: lines.some((l) => l.custom),
  };
}
```

- [ ] **Step 2: Create `scripts/check-pricing.ts`**
```ts
/** Runnable sanity checks for the pricing engine. Run: npx tsx scripts/check-pricing.ts */
import assert from "node:assert/strict";

import { estimate, type PricedService } from "../src/lib/pricing";

const SERVICES: PricedService[] = [
  { slug: "koszenie", title: "Koszenie", pricing: { kind: "area", basePrice: 180, pricePerM2: 0.35, recurring: true } },
  { slug: "ciecie", title: "Cięcie", pricing: { kind: "perUnit", basePrice: 250, pricePerUnit: 18, unitLabel: "mb", recurring: false } },
  { slug: "aranzacja", title: "Aranżacja", pricing: { kind: "custom", recurring: false } },
];

// area: koszenie @ 420 m² jednorazowo → 180 + 0.35*420 = 327 → ±15% = 278..376
const a = estimate(SERVICES, [{ serviceSlug: "koszenie", frequency: "jednorazowo" }], 420);
assert.equal(a.lines[0].min, 278, `min ${a.lines[0].min}`);
assert.equal(a.lines[0].max, 376, `max ${a.lines[0].max}`);

// recurring multiplier applies: co_2_tyg (0.92) → 327*0.92=300.84 → 256..346
const b = estimate(SERVICES, [{ serviceSlug: "koszenie", frequency: "co_2_tyg" }], 420);
assert.equal(b.lines[0].min, 256, `min ${b.lines[0].min}`);
assert.equal(b.lines[0].max, 346, `max ${b.lines[0].max}`);

// perUnit: ciecie qty 25 → 250 + 18*25 = 700 → 595..805
const c = estimate(SERVICES, [{ serviceSlug: "ciecie", quantity: 25 }], 0);
assert.equal(c.lines[0].min, 595, `min ${c.lines[0].min}`);
assert.equal(c.lines[0].max, 805, `max ${c.lines[0].max}`);

// custom excluded from totals; hasCustom true
const d = estimate(SERVICES, [{ serviceSlug: "koszenie", frequency: "jednorazowo" }, { serviceSlug: "aranzacja" }], 420);
assert.equal(d.hasCustom, true, "hasCustom");
assert.equal(d.min, 278, `total min ${d.min}`); // only koszenie counts
assert.equal(d.lines[1].custom, true, "aranzacja custom");

// unknown service → custom (not NaN)
const e = estimate(SERVICES, [{ serviceSlug: "nieznana" }], 420);
assert.equal(e.lines[0].custom, true, "unknown → custom");
assert.equal(e.min, 0, "unknown contributes 0");

console.log("pricing OK — area + recurring + perUnit + custom + unknown");
```

- [ ] **Step 3: Run it**
Run: `npx tsx scripts/check-pricing.ts`
Expected: `pricing OK — area + recurring + perUnit + custom + unknown`, exit 0. The numbers are deterministic; if any assert prints a different integer, the formula was transcribed wrong — fix `pricing.ts` (do NOT just relax the assertion).

- [ ] **Step 4: Verify + commit**
Run: `npm run check` (3 known warnings).
```bash
git add src/lib/pricing.ts scripts/check-pricing.ts
git commit -m "feat(pricing): data-driven estimate engine + sanity checks"
```

---

### Task 2: `services` pricing metadata + seed mapping

**Files:** Modify `src/collections/Services.ts`, `src/lib/services-seed-data.ts`, `scripts/seed-services.ts`

- [ ] **Step 1: Add the `pricing` group to `src/collections/Services.ts`**
Insert this field right after the `duration` field (and before `image`):
```ts
    {
      name: "pricing",
      type: "group",
      admin: { description: "Drives the panel configurator + live estimate." },
      fields: [
        {
          name: "kind",
          type: "select",
          required: true,
          defaultValue: "custom",
          options: [
            { label: "Od powierzchni (m²)", value: "area" },
            { label: "Od jednostki (szt./mb)", value: "perUnit" },
            { label: "Stała kwota", value: "fixed" },
            { label: "Wycena indywidualna", value: "custom" },
          ],
        },
        { name: "basePrice", type: "number" },
        { name: "pricePerM2", type: "number" },
        { name: "pricePerUnit", type: "number" },
        { name: "unitLabel", type: "text" },
        { name: "recurring", type: "checkbox", defaultValue: false },
      ],
    },
```

- [ ] **Step 2: Add `SERVICE_PRICING` to `src/lib/services-seed-data.ts`**
Add this import at the top and the export (anywhere among the existing exports):
```ts
import type { ServicePricing } from "./pricing";

/** Pricing metadata seeded onto each service (generalizes calculator.ts). */
export const SERVICE_PRICING: Record<string, ServicePricing> = {
  koszenie: { kind: "area", basePrice: 180, pricePerM2: 0.35, recurring: true },
  pielegnacja: { kind: "area", basePrice: 280, pricePerM2: 0.45, recurring: true },
  grabienie: { kind: "area", basePrice: 220, pricePerM2: 0.35, recurring: false },
  sadzenie: { kind: "perUnit", basePrice: 350, pricePerUnit: 130, unitLabel: "roślina", recurring: false },
  ciecie: { kind: "perUnit", basePrice: 250, pricePerUnit: 18, unitLabel: "mb żywopłotu", recurring: false },
  porzadki: { kind: "area", basePrice: 400, pricePerM2: 0.5, recurring: false },
  aranzacja: { kind: "custom", recurring: false },
  rabaty: { kind: "custom", recurring: false },
};
```

- [ ] **Step 3: Write `pricing` in `scripts/seed-services.ts`**
Import `SERVICE_PRICING` alongside the existing seed-data import, and add `pricing` to the upsert `data` object (next to `priceFrom`/`duration`):
```ts
      pricing: SERVICE_PRICING[s.slug] ?? { kind: "custom", recurring: false },
```
(Read the file to place it inside the `data` object literal. The `ServiceUpsertData` type derives from the collection, so adding `pricing` keeps it type-checked.)

- [ ] **Step 4: Regenerate types + verify**
Run: `npx payload generate:types` then `npm run check`.
Expected: `Service` in `src/payload-types.ts` now has `pricing: { kind; basePrice?; pricePerM2?; pricePerUnit?; unitLabel?; recurring? }`; check passes (3 known warnings). DB dev-push + re-seed are deferred to the controller (Final verification) — do NOT run them.

- [ ] **Step 5: Commit**
```bash
git add src/collections/Services.ts src/lib/services-seed-data.ts scripts/seed-services.ts src/payload-types.ts
git commit -m "feat(services): pricing metadata group + seed mapping (source of truth)"
```

---

### Task 3: `getConfiguratorServices` accessor

**Files:** Modify `src/lib/catalog.ts`

- [ ] **Step 1: Add the accessor + type to `src/lib/catalog.ts`**
Add the import and a new exported accessor (keep the existing `getCatalogServices` unchanged):
```ts
import type { ServicePricing } from "./pricing";

export interface ConfiguratorService {
  id: string;
  slug: string;
  title: string;
  short: string;
  icon: string;
  category: string;
  priceFrom: string;
  pricing: ServicePricing;
}

/** Services + pricing for the panel configurator (the booking source of truth). */
export async function getConfiguratorServices(): Promise<ConfiguratorService[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "services",
    sort: "order",
    depth: 0,
    limit: 100,
  });
  return docs.map((s) => {
    const p = (s.pricing ?? {}) as ServicePricing;
    return {
      id: String(s.id),
      slug: s.slug,
      title: s.title,
      short: s.short,
      icon: s.icon,
      category: s.category,
      priceFrom: s.priceFrom,
      pricing: {
        kind: p.kind ?? "custom",
        basePrice: p.basePrice ?? null,
        pricePerM2: p.pricePerM2 ?? null,
        pricePerUnit: p.pricePerUnit ?? null,
        unitLabel: p.unitLabel ?? null,
        recurring: p.recurring ?? false,
      },
    };
  });
}
```

- [ ] **Step 2: Verify + commit**
Run: `npm run check` (3 known warnings).
```bash
git add src/lib/catalog.ts
git commit -m "feat(catalog): getConfiguratorServices accessor (display + pricing)"
```

---

### Task 4: `service-requests` collection

**Files:** Create `src/collections/ServiceRequests.ts`; Modify `src/payload.config.ts`

- [ ] **Step 1: Create `src/collections/ServiceRequests.ts`**
```ts
import type { CollectionConfig } from "payload";

import { assignDefaultTenant } from "./hooks/assign-default-tenant";

/**
 * A customer's service request for a lawn: a basket of configured line items + a
 * snapshot price range. Owner-scoped, but access is enforced in src/lib/requests.ts
 * (the Local API runs as admin); access here is fully closed. Multiple per lawn (a
 * history). Scheduling fields are added in 3b.2.
 */
export const ServiceRequests: CollectionConfig = {
  slug: "service-requests",
  admin: {
    useAsTitle: "id",
    group: "Klienci",
    defaultColumns: ["lawn", "status", "estMin", "estMax", "owner"],
  },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "owner", type: "relationship", relationTo: "users", required: true, index: true },
    { name: "lawn", type: "relationship", relationTo: "lawns", required: true },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "service", type: "relationship", relationTo: "services" },
        { name: "serviceSlug", type: "text", required: true },
        { name: "serviceTitle", type: "text", required: true },
        {
          name: "frequency",
          type: "select",
          options: ["jednorazowo", "co_tydzien", "co_2_tyg", "raz_w_miesiacu", "sezonowy"],
        },
        { name: "quantity", type: "number" },
        { name: "estMin", type: "number", required: true },
        { name: "estMax", type: "number", required: true },
        { name: "custom", type: "checkbox", defaultValue: false },
      ],
    },
    { name: "estMin", type: "number", required: true },
    { name: "estMax", type: "number", required: true },
    { name: "note", type: "textarea" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: ["draft", "new", "cancelled"],
    },
    { name: "tenant", type: "relationship", relationTo: "tenants", required: true },
  ],
  hooks: { beforeChange: [assignDefaultTenant] },
  timestamps: true,
};
```

- [ ] **Step 2: Register in `src/payload.config.ts`**
Add the import after the `Lawns` import:
```ts
import { ServiceRequests } from "./collections/ServiceRequests";
```
And append `ServiceRequests` to the END of the `collections` array.

- [ ] **Step 3: Regenerate types + verify**
Run: `npx payload generate:types` then `npm run check`.
Expected: `src/payload-types.ts` has a `ServiceRequest` interface and `"service-requests"` in the collections map; check passes (3 known warnings). Dev-push deferred to controller.

- [ ] **Step 4: Commit**
```bash
git add src/collections/ServiceRequests.ts src/payload.config.ts src/payload-types.ts
git commit -m "feat(requests): service-requests collection (owner-scoped, closed) + register"
```

---

### Task 5: Requests data layer (`src/lib/requests.ts`)

**Files:** Create `src/lib/requests.ts`

- [ ] **Step 1: Write `src/lib/requests.ts`**
```ts
/**
 * The ONLY ownership boundary for service requests (the Local API runs as admin).
 * Every query filters by owner == userId. createRequest recomputes the estimate
 * server-side via lib/pricing (client values are never trusted) and snapshots it.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import type { RequiredDataFromCollectionSlug } from "payload";

import type { ServiceRequest, Lawn } from "@/payload-types";
import { estimate, type Frequency, type RequestLineInput } from "./pricing";
import { getConfiguratorServices } from "./catalog";
import { getLawn } from "./lawns";

export interface CreateRequestInput {
  lawnId: string;
  items: RequestLineInput[];
  note?: string;
}

export interface RequestItemView {
  serviceSlug: string;
  serviceTitle: string;
  frequency: Frequency | null;
  quantity: number | null;
  estMin: number;
  estMax: number;
  custom: boolean;
}

export interface RequestView {
  id: string;
  lawnId: string;
  lawnName: string;
  items: RequestItemView[];
  estMin: number;
  estMax: number;
  note: string | null;
  status: "draft" | "new" | "cancelled";
  createdAt: string;
}

function project(doc: ServiceRequest): RequestView {
  const lawn = (typeof doc.lawn === "object" && doc.lawn ? doc.lawn : null) as Lawn | null;
  return {
    id: String(doc.id),
    lawnId: lawn ? String(lawn.id) : String(doc.lawn),
    lawnName: lawn?.name ?? "Ogród",
    items: (doc.items ?? []).map((it) => ({
      serviceSlug: it.serviceSlug,
      serviceTitle: it.serviceTitle,
      frequency: (it.frequency ?? null) as Frequency | null,
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

export async function getMyRequests(userId: string): Promise<RequestView[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "service-requests",
    where: { owner: { equals: userId } },
    sort: "-createdAt",
    depth: 1,
    limit: 100,
  });
  return docs.map(project);
}

export async function getRequest(userId: string, id: string): Promise<RequestView | null> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "service-requests",
    where: { and: [{ id: { equals: id } }, { owner: { equals: userId } }] },
    depth: 1,
    limit: 1,
  });
  return docs[0] ? project(docs[0]) : null;
}

export async function createRequest(
  userId: string,
  input: CreateRequestInput,
): Promise<RequestView> {
  const lawn = await getLawn(userId, input.lawnId);
  if (!lawn) throw new Error("Lawn not found");

  const services = await getConfiguratorServices();
  const idBySlug = new Map(services.map((s) => [s.slug, s.id]));
  const titleBySlug = new Map(services.map((s) => [s.slug, s.title]));

  // Drop any line whose slug isn't a real service (defensive against a bad client).
  const items = input.items.filter((it) => idBySlug.has(it.serviceSlug));
  if (!items.length) throw new Error("No valid services");

  const est = estimate(services, items, lawn.areaM2);
  const lineData = items.map((it, i) => ({
    service: idBySlug.get(it.serviceSlug)!,
    serviceSlug: it.serviceSlug,
    serviceTitle: titleBySlug.get(it.serviceSlug) ?? it.serviceSlug,
    frequency: it.frequency ?? undefined,
    quantity: it.quantity ?? undefined,
    estMin: est.lines[i].min,
    estMax: est.lines[i].max,
    custom: est.lines[i].custom,
  }));

  const payload = await getPayload({ config });
  const doc = await payload.create({
    collection: "service-requests",
    data: {
      owner: userId,
      lawn: input.lawnId,
      items: lineData,
      estMin: est.min,
      estMax: est.max,
      note: input.note ?? undefined,
      status: "new",
    } as unknown as RequiredDataFromCollectionSlug<"service-requests">,
  });
  return project(doc);
}

export async function cancelRequest(userId: string, id: string): Promise<void> {
  const existing = await getRequest(userId, id);
  if (!existing) return; // no-op for non-owners / missing
  const payload = await getPayload({ config });
  await payload.update({ collection: "service-requests", id, data: { status: "cancelled" } });
}
```

- [ ] **Step 2: Verify + commit**
Run: `npm run check` (3 known warnings). If the `create` data shape complains beyond the `as unknown as RequiredDataFromCollectionSlug` cast (tenant filled by hook; same pattern as lawns), keep that single-call cast. Report any extra cast.
```bash
git add src/lib/requests.ts
git commit -m "feat(requests): owner-scoped data layer + server-recomputed estimate"
```

---

### Task 6: Server actions

**Files:** Create `src/app/(app)/panel/zamowienia/actions.ts`

- [ ] **Step 1: Write `src/app/(app)/panel/zamowienia/actions.ts`**
```ts
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { createRequest, cancelRequest } from "@/lib/requests";
import type { CreateRequestInput } from "@/lib/requests";

type ActionError = { ok: false; error: string };

async function requireUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

/** On success redirects to /panel/zamowienia (does not return). */
export async function createRequestAction(
  input: CreateRequestInput,
): Promise<ActionError | never> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sesja wygasła. Zaloguj się ponownie." };
  if (!input.items?.length) return { ok: false, error: "Wybierz przynajmniej jedną usługę." };
  try {
    await createRequest(userId, input);
  } catch {
    return { ok: false, error: "Nie udało się zapisać zapytania. Spróbuj ponownie." };
  }
  revalidatePath("/panel/zamowienia");
  revalidatePath("/panel");
  redirect("/panel/zamowienia");
}

export async function cancelRequestAction(
  id: string,
): Promise<{ ok: true } | ActionError> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sesja wygasła." };
  try {
    await cancelRequest(userId, id);
  } catch {
    return { ok: false, error: "Nie udało się anulować zapytania." };
  }
  revalidatePath("/panel/zamowienia");
  return { ok: true };
}
```

- [ ] **Step 2: Verify + commit**
Run: `npm run check`.
```bash
git add src/app/\(app\)/panel/zamowienia/actions.ts
git commit -m "feat(requests): create/cancel server actions (session-scoped)"
```

---

### Task 7: ServiceConfigurator client component

**Files:** Create `src/components/requests/ServiceConfigurator.tsx`

- [ ] **Step 1: Write `src/components/requests/ServiceConfigurator.tsx`**
```tsx
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { ConfiguratorService } from "@/lib/catalog";
import {
  estimate,
  formatRange,
  FREQUENCY_LABEL,
  type Frequency,
  type RequestLineInput,
} from "@/lib/pricing";
import { createRequestAction } from "@/app/(app)/panel/zamowienia/actions";

const FREQ_ORDER: Frequency[] = [
  "jednorazowo",
  "co_2_tyg",
  "co_tydzien",
  "raz_w_miesiacu",
  "sezonowy",
];

interface LineState {
  on: boolean;
  frequency: Frequency;
  quantity: number;
}

interface Props {
  lawn: { id: string; name: string; areaM2: number };
  services: ConfiguratorService[];
}

export function ServiceConfigurator({ lawn, services }: Props) {
  const [state, setState] = useState<Record<string, LineState>>(() =>
    Object.fromEntries(
      services.map((s) => [s.slug, { on: false, frequency: "jednorazowo", quantity: 10 }]),
    ),
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const items: RequestLineInput[] = useMemo(
    () =>
      services
        .filter((s) => state[s.slug]?.on)
        .map((s) => ({
          serviceSlug: s.slug,
          frequency: s.pricing.recurring ? state[s.slug].frequency : undefined,
          quantity: s.pricing.kind === "perUnit" ? state[s.slug].quantity : undefined,
        })),
    [services, state],
  );

  const est = useMemo(() => estimate(services, items, lawn.areaM2), [services, items, lawn.areaM2]);
  const lineBySlug = useMemo(
    () => new Map(est.lines.map((l) => [l.serviceSlug, l])),
    [est],
  );

  const missingQty = services.some(
    (s) => state[s.slug]?.on && s.pricing.kind === "perUnit" && state[s.slug].quantity <= 0,
  );
  const canSave = items.length > 0 && !missingQty && !saving;

  function toggle(slug: string) {
    setState((p) => ({ ...p, [slug]: { ...p[slug], on: !p[slug].on } }));
  }
  function setFreq(slug: string, f: Frequency) {
    setState((p) => ({ ...p, [slug]: { ...p[slug], frequency: f } }));
  }
  function setQty(slug: string, q: number) {
    setState((p) => ({ ...p, [slug]: { ...p[slug], quantity: Math.max(0, q) } }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await createRequestAction({ lawnId: lawn.id, items, note: note.trim() || undefined });
    if (res && !res.ok) {
      toast.error(res.error);
      setSaving(false);
    }
  }

  return (
    <div className="pb-28">
      <div className="flex flex-col gap-2.5">
        {services.map((s) => {
          const ls = state[s.slug];
          const line = lineBySlug.get(s.slug);
          const isCustom = s.pricing.kind === "custom";
          return (
            <div
              key={s.slug}
              className={`overflow-hidden rounded-2xl border ${
                ls.on
                  ? isCustom
                    ? "border-amber-300"
                    : "border-emerald-500"
                  : "border-neutral-200"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(s.slug)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                  ls.on ? (isCustom ? "bg-amber-50" : "bg-emerald-50") : "bg-white"
                }`}
              >
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-neutral-900">{s.title}</span>
                  <span className="block text-xs text-neutral-500">{s.short}</span>
                </span>
                <span
                  className={`relative h-6 w-11 rounded-full transition ${
                    ls.on ? (isCustom ? "bg-amber-500" : "bg-emerald-500") : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                      ls.on ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </span>
              </button>

              {ls.on && (
                <div className="flex flex-col gap-3 px-4 py-3">
                  {s.pricing.recurring && (
                    <div>
                      <p className="mb-1.5 text-xs text-neutral-500">Jak często?</p>
                      <div className="flex flex-wrap gap-1.5">
                        {FREQ_ORDER.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setFreq(s.slug, f)}
                            className={`rounded-full px-3 py-1.5 text-xs transition ${
                              ls.frequency === f
                                ? "bg-emerald-700 font-semibold text-white"
                                : "border border-neutral-200 text-neutral-600 hover:border-emerald-400"
                            }`}
                          >
                            {FREQUENCY_LABEL[f]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.pricing.kind === "perUnit" && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        Ilość{s.pricing.unitLabel ? ` (${s.pricing.unitLabel})` : ""}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label="Mniej"
                          onClick={() => setQty(s.slug, ls.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600"
                        >
                          −
                        </button>
                        <span className="min-w-[3rem] text-center text-sm font-bold">{ls.quantity}</span>
                        <button
                          type="button"
                          aria-label="Więcej"
                          onClick={() => setQty(s.slug, ls.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between border-t border-dashed border-neutral-200 pt-2.5">
                    {isCustom ? (
                      <>
                        <span className="text-xs text-amber-700">Nie wyceniamy automatycznie</span>
                        <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                          Wycena indywidualna
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-neutral-500">Szacunek</span>
                        <span className="text-sm font-extrabold text-emerald-700">
                          {line ? formatRange(line.min, line.max) : "—"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="📝 Dodatkowe uwagi (np. „brama od podwórka”, dostęp)…"
          className="mt-1 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white px-4 py-3 sm:left-[var(--sidebar-width,0)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs text-neutral-500">Razem (szacunek)</p>
            <p className="text-base font-extrabold text-emerald-700">
              {est.min > 0 ? formatRange(est.min, est.max) : "—"}
              {est.hasCustom && (
                <span className="ml-1 text-xs font-semibold text-amber-700">+ wycena</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Zapisywanie…" : "Zapisz zapytanie →"}
          </button>
        </div>
      </div>
    </div>
  );
}
```
Note: the sticky bar uses `fixed` (not `sticky`) because it must sit above the AppShell scroll area; `sm:left-[var(--sidebar-width,0)]` keeps it clear of the sidebar (the shadcn sidebar sets `--sidebar-width`). If lint flags the arbitrary value, replace with `sm:left-0` and report.

- [ ] **Step 2: Verify + commit**
Run: `npm run check`. Watch the React-Compiler lint rules (no ref reads in render — this component uses state only). If `useMemo` deps are flagged, keep them as written (they list real deps).
```bash
git add src/components/requests/ServiceConfigurator.tsx
git commit -m "feat(requests): ServiceConfigurator smart-catalog client island"
```

---

### Task 8: Configurator route + lawn-card link

**Files:** Create `src/app/(app)/panel/ogrody/[id]/zamow/page.tsx`; Modify `src/components/lawns/LawnCard.tsx`

- [ ] **Step 1: Write `src/app/(app)/panel/ogrody/[id]/zamow/page.tsx`**
```tsx
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getLawn } from "@/lib/lawns";
import { getConfiguratorServices } from "@/lib/catalog";
import { ServiceConfigurator } from "@/components/requests/ServiceConfigurator";

export const metadata = { title: "Zamów usługi" };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const lawn = await getLawn(session.user.id, id);
  if (!lawn) notFound();
  const services = await getConfiguratorServices();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400">Zamów usługi</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {lawn.name} · {lawn.areaM2.toLocaleString("pl-PL")} m²
          </h1>
        </div>
        <Link href="/panel/ogrody" className="text-sm text-neutral-500 hover:text-emerald-700">
          ← Wróć
        </Link>
      </div>
      <ServiceConfigurator
        lawn={{ id: lawn.id, name: lawn.name, areaM2: lawn.areaM2 }}
        services={services}
      />
    </div>
  );
}
```

- [ ] **Step 2: Point the lawn card at the configurator (`src/components/lawns/LawnCard.tsx`)**
Change the "Zamów usługi" `Link` `href` from `"/panel/uslugi"` to:
```tsx
            href={`/panel/ogrody/${lawn.id}/zamow`}
```

- [ ] **Step 3: Verify + commit**
Run: `npm run check`.
```bash
git add src/app/\(app\)/panel/ogrody/\[id\]/zamow/page.tsx src/components/lawns/LawnCard.tsx
git commit -m "feat(requests): configurator route + wire lawn card 'Zamów usługi'"
```

---

### Task 9: Requests list + cancel + dashboard summary

**Files:** Create `src/components/requests/RequestCard.tsx`, `src/components/requests/RequestActions.tsx`; Modify `src/app/(app)/panel/zamowienia/page.tsx`, `src/app/(app)/panel/page.tsx`

- [ ] **Step 1: Write `src/components/requests/RequestActions.tsx`**
```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelRequestAction } from "@/app/(app)/panel/zamowienia/actions";

export function RequestActions({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function onCancel() {
    start(async () => {
      const res = await cancelRequestAction(id);
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Zapytanie anulowane.");
        router.refresh();
      }
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">
        Anuluj
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anulować to zapytanie?</AlertDialogTitle>
          <AlertDialogDescription>
            Zapytanie zostanie oznaczone jako anulowane. Możesz złożyć nowe w każdej chwili.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Wróć</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
            disabled={pending}
            className="bg-red-600 hover:bg-red-700"
          >
            {pending ? "Anulowanie…" : "Anuluj zapytanie"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 2: Write `src/components/requests/RequestCard.tsx` (server)**
```tsx
import { formatRange } from "@/lib/pricing";
import type { RequestView } from "@/lib/requests";
import { RequestActions } from "./RequestActions";

const STATUS_LABEL: Record<RequestView["status"], { label: string; cls: string }> = {
  draft: { label: "Szkic", cls: "bg-neutral-100 text-neutral-600" },
  new: { label: "Nowe", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Anulowane", cls: "bg-red-100 text-red-700" },
};

export function RequestCard({ request }: { request: RequestView }) {
  const status = STATUS_LABEL[request.status];
  const date = new Date(request.createdAt).toLocaleDateString("pl-PL");
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold tracking-tight text-neutral-900">{request.lawnName}</h3>
          <p className="text-xs text-neutral-400">{date}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}>
          {status.label}
        </span>
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {request.items.map((it, i) => (
          <li
            key={i}
            className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600"
          >
            {it.serviceTitle}
            {it.custom ? " · wycena" : ""}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-sm font-bold text-emerald-700">
          {request.estMin > 0 ? formatRange(request.estMin, request.estMax) : "Wycena indywidualna"}
        </span>
        {request.status === "new" && <RequestActions id={request.id} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Replace `src/app/(app)/panel/zamowienia/page.tsx`**
```tsx
import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getMyRequests } from "@/lib/requests";
import { RequestCard } from "@/components/requests/RequestCard";

export const metadata = { title: "Zamówienia" };

export default async function ZamowieniaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const requests = session ? await getMyRequests(session.user.id) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Zamówienia</h1>
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
          <div className="text-3xl">📋</div>
          <h2 className="mt-3 font-semibold text-neutral-900">Brak zapytań</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Wybierz ogród i zamów usługi — przygotujemy szacunkową wycenę.
          </p>
          <Link
            href="/panel/ogrody"
            className="mt-5 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Przejdź do ogrodów
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Add a "X zapytań" line to `src/app/(app)/panel/page.tsx`**
Add the import and fetch, and a second summary card below the existing "Moje ogrody" card. Add near the top imports:
```tsx
import { getMyRequests } from "@/lib/requests";
```
In the component, after the `lawns` fetch:
```tsx
  const requests = session ? await getMyRequests(session.user.id) : [];
  const activeRequests = requests.filter((r) => r.status === "new").length;
```
And after the existing "Moje ogrody" `<Link>` card, add:
```tsx
      <Link
        href="/panel/zamowienia"
        className="mt-3 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-emerald-300"
      >
        <div>
          <p className="text-sm text-neutral-500">Zamówienia</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {activeRequests === 0 ? "Brak aktywnych zapytań" : `${activeRequests} aktywne`}
          </p>
        </div>
        <span aria-hidden className="text-emerald-700">→</span>
      </Link>
```

- [ ] **Step 5: Verify + commit**
Run: `npm run check` (3 known warnings).
```bash
git add src/components/requests/RequestCard.tsx src/components/requests/RequestActions.tsx src/app/\(app\)/panel/zamowienia/page.tsx src/app/\(app\)/panel/page.tsx
git commit -m "feat(requests): /panel/zamowienia list, cancel, dashboard summary"
```

---

### Task 10: Mind updates

**Files:** Create `kryscar-mind/map/zones/service-requests.md`, `kryscar-mind/map/decisions/services-pricing-metadata.md`, `kryscar-mind/map/decisions/service-request-model.md`; Modify `kryscar-mind/map/zones/{service-catalog,pricing-calculator,app-shell}.md`, `kryscar-mind/tech-debt/prod-migrations-needed.md`

- [ ] **Step 1: Write the `service-requests` zone**
Follow the `customer-lawns.md` format. Frontmatter: `type: zone`, summary, `status: active`, `created`/`updated: 2026-06-04`, `related` (`[[service-catalog]]`, `[[pricing-calculator]]`, `[[customer-lawns]]`, `[[payload-backend]]`, `[[app-shell]]`), `sources: ["[[2026-06-04-service-selection-3b1-design]]"]`, `owns.routes` (`/panel/ogrody/[id]/zamow`, `/panel/zamowienia`), `owns.anchors` (`symbol:estimate`, `symbol:createRequest`, `symbol:getConfiguratorServices`, `symbol:ServiceConfigurator`), `owns.globs` (`src/lib/pricing.ts`, `src/lib/requests.ts`, `src/collections/ServiceRequests.ts`, `src/components/requests/**`, `src/app/(app)/panel/zamowienia/**`, `src/app/(app)/panel/ogrody/[id]/zamow/**`), `depends` (`[[customer-lawns]]`, `[[payload-backend]]`, `[[ui-primitives]]`). Invariants (as `{rule, enforcedBy}` objects):
```yaml
invariants:
  - rule: "Pricing is data-driven from the services collection `pricing` group via lib/pricing.estimate (pure); no hardcoded service list or price table in the panel. A new service in /admin appears in the configurator, priced."
    enforcedBy: []
  - rule: "Request ownership is enforced in src/lib/requests.ts (every query filtered by owner == userId); estMin/estMax are recomputed server-side via estimate on create — client values are display-only."
    enforcedBy: []
```
Body: Purpose, the configurator flow (toggle → per-kind control → live range → save), the request model (basket of snapshot line items, multiple per lawn), and a "for browser agents" app-map note.

- [ ] **Step 2: Write the two decision records**
`services-pricing-metadata.md` — why pricing moved onto the services collection (single source of truth), the `kind`/base/rate/recurring fields, the pure data-driven `estimate` shared client+server, frequency multipliers as policy constants, and that the marketing `calculator.ts` migration onto `lib/pricing` is a noted follow-up (not done here). `service-request-model.md` — basket of line items with snapshot estimate, multiple-per-lawn history, owner-scoped data layer, closed collection access. Follow `kryscar-mind/map/decisions/lawns-ownership-in-data-layer.md` format.

- [ ] **Step 3: Update existing zones + tech-debt**
- `service-catalog.md` + `pricing-calculator.md`: note pricing now lives on the `services` collection; `lib/pricing` is the data-driven estimate; `calculator.ts` migration is a follow-up. Re-stamp `verifiedAt` to HEAD.
- `app-shell.md`: `/panel/zamowienia` is now real (owned by `service-requests`); `/panel/uslugi` remains a stub. Re-stamp `verifiedAt`.
- `prod-migrations-needed.md`: add the `services.pricing` columns + the new `service_requests` table.

- [ ] **Step 4: Regenerate + verify**
Run: `npm run check` — Mind generator clean, no broken anchors (the 4 new `symbol:` anchors must resolve), no `invariant "undefined"` gaps. 0 errors + 3 known warnings.

- [ ] **Step 5: Commit**
```bash
git add kryscar-mind/
git commit -m "docs(mind): service-requests zone + pricing/request decisions"
```

---

## Final verification (after all tasks)

- [ ] `npm run check` passes (3 known `<img>` warnings).
- [ ] `npx tsx scripts/check-pricing.ts` passes.
- [ ] **Controller dev-push + re-seed (requires user authorization):**
  ```bash
  npx tsx --env-file=.env scripts/seed.ts          # dev-push: services.pricing columns + service_requests table
  npx tsx --env-file=.env scripts/seed-services.ts # populate pricing on the 8 existing services
  ```
- [ ] Runtime (controller, non-UI): a throwaway script that, for the demo customer + a seeded lawn, calls `createRequest` with a `koszenie` (frequency) + a `ciecie` (quantity) + an `aranzacja` (custom) line → confirms snapshot `estMin/estMax` match `estimate`, `hasCustom` handled, owner-scoping holds (a second account can't `getRequest` it), then `cancelRequest` flips status. Delete the script after.
- [ ] Dispatch a final whole-feature code review, then use **superpowers:finishing-a-development-branch**.

---

## Self-review (author)

- **Spec coverage:** pricing metadata on the collection (T2), data-driven estimate (T1), configurator accessor (T3), `service-requests` collection (T4), owner-scoped data layer + server recompute (T5), server actions (T6), smart-catalog configurator (T7), route + lawn-card wiring (T8), `/panel/zamowienia` list + cancel + dashboard (T9), Mind (T10), single-source-of-truth invariant (T10), testing (T1 sanity + final runtime). All spec sections map to a task.
- **Type consistency:** `Frequency`/`PricingKind`/`ServicePricing`/`PricedService`/`RequestLineInput`/`LineEstimate`/`Estimate` defined once in `pricing.ts`; `ConfiguratorService` (T3) carries `pricing: ServicePricing` and satisfies `PricedService`; `CreateRequestInput`/`RequestView` in `requests.ts`; `estimate(services, items, areaM2)`, `createRequest(userId, input)`, `createRequestAction(input)`, `cancelRequestAction(id)` used consistently across tasks.
- **Dev-push** batched as one controller step (Final verification), matching the 3a/smart-map pattern; implementer tasks never touch the DB.
- **Client/server boundary:** `lib/pricing.ts` is pure → imported by both the client configurator (live estimate) and the server (`createRequest` recompute). The configurator imports only `pricing` + the action + `ConfiguratorService` type; never `requests`/`catalog`/`lawns`.
- **YAGNI honored:** terrain dropped; one request = basket; `calculator.ts` migration deferred; statuses limited to draft/new/cancelled (3b.2 extends).
