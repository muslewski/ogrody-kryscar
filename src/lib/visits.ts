/**
 * Pure visit-scheduling logic (top section) + Payload data-access (bottom section).
 *
 * Security boundary: reads/writes are scoped by the CALLER.
 *   - Customer functions (getUpcomingVisitsForCustomer) filter by customer == userId.
 *   - Team write functions (createVisit, setVisitStatus, cancelVisitsForRequest) are
 *     dispatched only after requireGardener — enforced in Task 5/6 server actions.
 * The Local API runs as admin, so where-filters are the ONLY ownership gate.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import type { RequiredDataFromCollectionSlug } from "payload";

import type { Visit, Lawn, User, ServiceRequest } from "@/payload-types";
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

// ── Data-access layer ────────────────────────────────────────────────────────

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

/**
 * Create a visit linked to a service request. Called by team.acceptRequest and
 * the schedule-next action. CALLER RESPONSIBILITY: customerId/lawnId must be
 * derived from the request row (never from user-supplied input) — this function
 * does not re-verify that customer matches request.owner.
 */
export async function createVisit(input: {
  requestId: string;
  lawnId: string;
  customerId: string;
  scheduledAt: string;
  note?: string;
  /** The request's tenant — pass it through so multi-tenant stays sound; the
   *  default-tenant hook only covers the single-tenant fallback. */
  tenantId?: string;
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
      tenant: input.tenantId ?? undefined,
    } as unknown as RequiredDataFromCollectionSlug<"visits">,
    depth: 1,
  });
  return project(doc as Visit);
}

/** Set a visit's status (done/cancelled), scoped to the gardener's tenant. */
export async function setVisitStatus(
  tenantId: string,
  id: string,
  status: "done" | "cancelled",
): Promise<void> {
  const payload = await getPayload({ config });
  await payload.update({
    collection: "visits",
    where: { and: [{ id: { equals: id } }, { tenant: { equals: tenantId } }] },
    data: { status },
  });
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
