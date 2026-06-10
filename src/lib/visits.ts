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
