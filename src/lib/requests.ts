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
import { cancelVisitsForRequest } from "./visits";
import { notifyNewRequest } from "./email/notifications";

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
  declineReason: string | null;
  status: "draft" | "new" | "accepted" | "declined" | "cancelled" | "done";
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
    declineReason: doc.declineReason ?? null,
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
  const pricingBySlug = new Map(services.map((s) => [s.slug, s.pricing]));

  // Drop any line that isn't a real service, or a perUnit line with no quantity —
  // mirrors the client's save-gate server-side (a crafted request can't bypass it).
  const items = input.items.filter((it) => {
    const pricing = pricingBySlug.get(it.serviceSlug);
    if (!pricing) return false;
    if (pricing.kind === "perUnit" && (it.quantity ?? 0) <= 0) return false;
    return true;
  });
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
  const view = project(doc);
  const tenantId =
    typeof doc.tenant === "object" && doc.tenant ? String(doc.tenant.id) : String(doc.tenant);
  if (tenantId && tenantId !== "undefined" && tenantId !== "null") {
    void notifyNewRequest({
      tenantId,
      customerId: userId, // notifyNewRequest resolves the name (LawnView has none)
      lawnName: view.lawnName,
      address: lawn.address, // LawnView.address is a required string
      serviceTitles: view.items.map((it) => it.serviceTitle),
      note: view.note,
      estRange: view.estMin > 0 ? `${view.estMin}–${view.estMax} zł` : "Wycena indywidualna",
    }).catch((err) => console.error("[email] notifyNewRequest:", err));
  }
  return view;
}

export async function cancelRequest(userId: string, id: string): Promise<void> {
  const existing = await getRequest(userId, id);
  if (!existing) return; // no-op for non-owners / missing
  // Only new/accepted are cancellable; declined/done/cancelled are terminal.
  if (existing.status !== "new" && existing.status !== "accepted") return;
  const payload = await getPayload({ config });
  await payload.update({ collection: "service-requests", id, data: { status: "cancelled" } });
  await cancelVisitsForRequest(id);
}
