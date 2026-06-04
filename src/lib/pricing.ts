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
