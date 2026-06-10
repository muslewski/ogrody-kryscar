/**
 * Team-side (gardener) reads + request transitions. The team boundary is
 * role == gardener (verified in the action via requireGardener); here every
 * query is tenant-scoped. Transitions assert canTransitionRequest server-side.
 */
import { getPayload } from "payload";
import config from "@payload-config";

import type { ServiceRequest, Lawn, User } from "@/payload-types";
import type { RequestView } from "./requests";
import type { Frequency } from "./pricing";
import { canTransitionRequest, createVisit, cancelVisitsForRequest } from "./visits";

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
  const lawnId = typeof req.lawn === "object" && req.lawn ? String(req.lawn.id) : String(req.lawn);
  const customerId = typeof req.owner === "object" && req.owner ? String(req.owner.id) : String(req.owner);
  const reqTenantId = typeof req.tenant === "object" && req.tenant ? String(req.tenant.id) : String(req.tenant);

  // CAS: flip new→accepted conditionally so concurrent accepts collapse to one
  // winner (Payload's Local API has no transaction primitive to lean on).
  const payload = await getPayload({ config });
  const flipped = await payload.update({
    collection: "service-requests",
    where: {
      and: [
        { id: { equals: id } },
        { tenant: { equals: tenantId } },
        { status: { equals: "new" } },
      ],
    },
    data: { status: "accepted" },
  });
  if (flipped.docs.length !== 1) throw new Error("Illegal transition");

  try {
    await createVisit({ requestId: String(req.id), lawnId, customerId, scheduledAt, tenantId: reqTenantId });
  } catch (err) {
    // Best-effort revert so the request doesn't strand as accepted-without-visit.
    await payload
      .update({
        collection: "service-requests",
        where: {
          and: [
            { id: { equals: id } },
            { tenant: { equals: tenantId } },
            { status: { equals: "accepted" } },
          ],
        },
        data: { status: "new" },
      })
      .catch(() => {});
    throw err;
  }
}

/**
 * Schedule a follow-up visit for an ACTIVE (accepted) request. lawn/customer/
 * tenant are re-derived server-side from the request row — the client supplies
 * only requestId + the date (see createVisit's caller contract).
 */
export async function scheduleNextVisit(
  tenantId: string,
  requestId: string,
  scheduledAt: string,
): Promise<void> {
  const req = await getTenantRequest(tenantId, requestId);
  if (!req) throw new Error("Request not found");
  if (req.status !== "accepted") throw new Error("Request not active");
  const lawnId = typeof req.lawn === "object" && req.lawn ? String(req.lawn.id) : String(req.lawn);
  const customerId = typeof req.owner === "object" && req.owner ? String(req.owner.id) : String(req.owner);
  const reqTenantId = typeof req.tenant === "object" && req.tenant ? String(req.tenant.id) : String(req.tenant);
  await createVisit({ requestId: String(req.id), lawnId, customerId, scheduledAt, tenantId: reqTenantId });
}

export async function declineRequest(
  tenantId: string,
  id: string,
  reason: string,
): Promise<void> {
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
  // Close out any still-planned visits so a finished job stops showing on the
  // grafik and in the customer's "najbliższa wizyta".
  await cancelVisitsForRequest(id);
}
