/**
 * Notification helpers: assemble recipients + props from Payload and send. Each
 * is fire-and-forget at the call site (`void notify...().catch(...)`), and
 * sendEmail itself never throws, so a notification can't break a flow. Recipient
 * emails are looked up here (depth:0) so callers pass only ids.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import type { Payload } from "payload";

import { sendEmail } from "./send";
import { buildTeamRecipients } from "./recipients";
import { OPS_INBOX, emailLink, formatPlDateTime } from "./config";
import { NewRequestTeam } from "./templates/NewRequestTeam";
import { RequestDecision } from "./templates/RequestDecision";
import { VisitScheduled } from "./templates/VisitScheduled";

async function gardenerEmails(payload: Payload, tenantId: string): Promise<string[]> {
  const { docs } = await payload.find({
    collection: "users",
    where: { and: [{ role: { equals: "gardener" } }, { tenant: { equals: tenantId } }] },
    depth: 0,
    limit: 100,
  });
  return docs.map((u) => u.email).filter((e): e is string => Boolean(e));
}

async function customerContact(
  payload: Payload,
  customerId: string,
): Promise<{ email: string; name: string } | null> {
  try {
    const u = await payload.findByID({ collection: "users", id: customerId, depth: 0 });
    return u?.email ? { email: u.email, name: u.name ?? "" } : null;
  } catch {
    return null;
  }
}

/** New request → all tenant gardeners + ops inbox. Resolves the customer's name
 *  by id (LawnView carries no owner name). */
export async function notifyNewRequest(input: {
  tenantId: string;
  customerId: string;
  lawnName: string;
  address: string;
  serviceTitles: string[];
  note: string | null;
  estRange: string;
}): Promise<void> {
  const payload = await getPayload({ config });
  const to = buildTeamRecipients(await gardenerEmails(payload, input.tenantId), OPS_INBOX);
  if (!to.length) return;
  const customer = await customerContact(payload, input.customerId);
  await sendEmail({
    to,
    subject: `Nowe zlecenie — ${input.lawnName}`,
    react: NewRequestTeam({
      customerName: customer?.name || "Klient",
      lawnName: input.lawnName,
      address: input.address,
      serviceTitles: input.serviceTitles,
      note: input.note,
      estRange: input.estRange,
      url: emailLink("/zespol/zlecenia"),
    }),
  });
}

/** Accept/decline → the customer. */
export async function notifyRequestDecision(input: {
  customerId: string;
  lawnName: string;
  decision: "accepted" | "declined";
  visitDateIso?: string;
  reason?: string;
}): Promise<void> {
  const payload = await getPayload({ config });
  const c = await customerContact(payload, input.customerId);
  if (!c) return;
  await sendEmail({
    to: c.email,
    subject:
      input.decision === "accepted"
        ? `Zlecenie przyjęte — ${input.lawnName}`
        : `Zlecenie odrzucone — ${input.lawnName}`,
    react: RequestDecision({
      customerName: c.name,
      lawnName: input.lawnName,
      decision: input.decision,
      visitDate: input.visitDateIso ? formatPlDateTime(input.visitDateIso) : undefined,
      reason: input.reason,
      url: emailLink("/panel/zamowienia"),
    }),
  });
}

/** Next visit scheduled → the customer. */
export async function notifyVisitScheduled(input: {
  customerId: string;
  lawnName: string;
  scheduledAtIso: string;
}): Promise<void> {
  const payload = await getPayload({ config });
  const c = await customerContact(payload, input.customerId);
  if (!c) return;
  await sendEmail({
    to: c.email,
    subject: `Zaplanowano wizytę — ${input.lawnName}`,
    react: VisitScheduled({
      customerName: c.name,
      lawnName: input.lawnName,
      scheduledAt: formatPlDateTime(input.scheduledAtIso),
      url: emailLink("/panel"),
    }),
  });
}
