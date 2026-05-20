/**
 * Theoretical price calculator for Ogrody Kryscar.
 *
 * Returns a price RANGE (min — max) rather than a single value because the
 * final quote always depends on on-site conditions (slope, plant health,
 * weed pressure, access for equipment). Don't show the output as a fixed
 * number — always frame it as "wycena teoretyczna" or "od X do Y zł".
 *
 * Tweak `BASE_PRICES`, `FREQUENCY_MULT`, and `RANGE_SPREAD` here — every
 * example page reads from this module so prices stay in sync.
 */

export type ServiceKey =
  | "koszenie"
  | "pielegnacja"
  | "grabienie"
  | "sadzenie"
  | "ciecie"
  | "porzadki"
  | "rabaty"
  | "aranzacja";

export type Frequency =
  | "jednorazowo"
  | "co_tydzien"
  | "co_2_tyg"
  | "raz_w_miesiacu"
  | "sezonowy";

export type Terrain = "plaski" | "lekki_spadek" | "trudny";

export interface CalculatorInput {
  services: ServiceKey[];
  /** Garden area in m². */
  area: number;
  frequency: Frequency;
  /** Hedge length in meters — only relevant when "ciecie" is selected. */
  hedgeMeters?: number;
  /** Tree/shrub count — only relevant when "sadzenie" is selected. */
  plantCount?: number;
  terrain?: Terrain;
}

export interface EstimateBreakdownItem {
  service: ServiceKey;
  label: string;
  minPrice: number;
  maxPrice: number;
}

export interface EstimateResult {
  /** Lower bound of theoretical price per visit/job (PLN). */
  min: number;
  /** Upper bound of theoretical price per visit/job (PLN). */
  max: number;
  /** Per-service breakdown for showing what makes up the total. */
  breakdown: EstimateBreakdownItem[];
  /** Multiplier already applied for the chosen frequency (1 = single visit baseline). */
  frequencyFactor: number;
  /** Multiplier already applied for terrain difficulty (1 = flat). */
  terrainFactor: number;
}

export const SERVICE_LABEL: Record<ServiceKey, string> = {
  koszenie: "Koszenie trawnika",
  pielegnacja: "Pielęgnacja ogrodu",
  grabienie: "Grabienie liści",
  sadzenie: "Sadzenie roślin",
  ciecie: "Cięcie i formowanie",
  porzadki: "Porządki sezonowe",
  rabaty: "Rabaty bylinowe",
  aranzacja: "Aranżacja ogrodu",
};

export const SERVICE_SHORT: Record<ServiceKey, string> = {
  koszenie: "Koszenie",
  pielegnacja: "Pielęgnacja",
  grabienie: "Grabienie",
  sadzenie: "Sadzenie",
  ciecie: "Cięcie",
  porzadki: "Porządki",
  rabaty: "Rabaty",
  aranzacja: "Aranżacja",
};

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  jednorazowo: "Jednorazowo",
  co_tydzien: "Co tydzień",
  co_2_tyg: "Co 2 tyg.",
  raz_w_miesiacu: "Raz w miesiącu",
  sezonowy: "Pakiet sezonowy",
};

export const TERRAIN_LABEL: Record<Terrain, string> = {
  plaski: "Płaski",
  lekki_spadek: "Lekki spadek",
  trudny: "Trudny dojazd / spadek",
};

/**
 * Base price model. `base` is the visit minimum (dojazd / mobilizacja /
 * sprzęt / first ~100 m² of work). `perM2` is the marginal cost per square
 * meter beyond that. Numbers are PLN and calibrated against 2024–2025
 * gardening market rates around Bydgoszcz / Toruń:
 *
 *   - Koszenie:    typical 250–400 zł for a 300–500 m² visit
 *   - Pielęgnacja: 60–100 zł / h, typical 4–6 h visit
 *   - Cięcie żywopłotu: 15–25 zł / mb
 *   - Porządki sezonowe (wiosna/jesień): 500–1500 zł
 *
 * Quick spot-checks at common areas:
 *   - Koszenie 300 m²  →  180 + 0.35·300  =  285 zł  (range ~240–330 zł)
 *   - Koszenie 500 m²  →  180 + 0.35·500  =  355 zł  (range ~300–410 zł)
 *   - Koszenie 1000 m² →  180 + 0.35·1000 =  530 zł  (range ~450–610 zł)
 */
const BASE_PRICES: Record<ServiceKey, { base: number; perM2: number }> = {
  koszenie: { base: 180, perM2: 0.35 },
  pielegnacja: { base: 280, perM2: 0.45 },
  grabienie: { base: 220, perM2: 0.35 },
  sadzenie: { base: 350, perM2: 0 },
  ciecie: { base: 250, perM2: 0 },
  porzadki: { base: 400, perM2: 0.5 },
  rabaty: { base: 600, perM2: 0.8 },
  aranzacja: { base: 1500, perM2: 1.2 },
};

/**
 * Multiplier per-visit price relative to a single one-off visit. Regular
 * contracts get a modest per-visit discount because mobilizacja is shared
 * across more visits — but stała opieka is never cheaper-than-cost.
 */
const FREQUENCY_MULT: Record<Frequency, number> = {
  jednorazowo: 1.0,
  co_tydzien: 0.85,
  co_2_tyg: 0.92,
  raz_w_miesiacu: 0.96,
  sezonowy: 0.88,
};

const TERRAIN_MULT: Record<Terrain, number> = {
  plaski: 1,
  lekki_spadek: 1.1,
  trudny: 1.25,
};

/** ±15% spread baked into the returned (min, max) range. */
const RANGE_SPREAD = 0.15;

export function estimate(input: CalculatorInput): EstimateResult {
  const services = input.services.length > 0 ? input.services : [];
  const area = Math.max(0, input.area || 0);
  const frequencyFactor = FREQUENCY_MULT[input.frequency] ?? 1;
  const terrainFactor = TERRAIN_MULT[input.terrain ?? "plaski"];

  const breakdown: EstimateBreakdownItem[] = services.map((service) => {
    const config = BASE_PRICES[service];
    const areaCost = config.perM2 * area;
    let baseCost = config.base + areaCost;

    // Per-meter hedge labour (~18 zł/mb is the Bydgoszcz market median).
    if (service === "ciecie" && input.hedgeMeters) {
      baseCost += input.hedgeMeters * 18;
    }
    // Per-plant labour for sadzenie — covers planting only. Sadzonki
    // płaci klient osobno, ceny bywają bardzo różne (10–500 zł / szt.).
    if (service === "sadzenie" && input.plantCount) {
      baseCost += input.plantCount * 130;
    }

    const adjusted = baseCost * terrainFactor;

    return {
      service,
      label: SERVICE_LABEL[service],
      minPrice: Math.round(adjusted * (1 - RANGE_SPREAD)),
      maxPrice: Math.round(adjusted * (1 + RANGE_SPREAD)),
    };
  });

  const sumMin = breakdown.reduce((s, item) => s + item.minPrice, 0);
  const sumMax = breakdown.reduce((s, item) => s + item.maxPrice, 0);

  return {
    min: Math.round(sumMin * frequencyFactor),
    max: Math.round(sumMax * frequencyFactor),
    breakdown,
    frequencyFactor,
    terrainFactor,
  };
}

/**
 * Disclaimer copy — pull this into the calculator UI so every page uses the
 * same wording. Frame the result as theoretical, not a binding quote.
 */
export const DISCLAIMER =
  "Wycena teoretyczna. Ostateczna cena zależy od stanu trawnika, ilości chwastów, ukształtowania terenu i dostępu dla sprzętu — konkretną ofertę otrzymują Państwo po bezpłatnej wizycie u Państwa.";

export const FORMATTER = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 0,
});

export function formatPLN(value: number): string {
  return `${FORMATTER.format(value)} zł`;
}
