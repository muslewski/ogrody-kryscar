"use client";

/**
 * Themeable pricing calculator using shadcn primitives.
 *
 * Each example page wraps `<CalculatorForm>` in its own visual shell. The
 * form itself stays the same: select services → set area → adjust frequency
 * and terrain → see theoretical price range. All shared via `useCalculator`.
 *
 * Pass a `theme` prop with palette-matched colors to bend the chip/slider
 * styling without forking the whole component.
 */

import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import {
  DISCLAIMER,
  FREQUENCY_LABEL,
  SERVICE_SHORT,
  TERRAIN_LABEL,
  estimate,
  formatPLN,
  type CalculatorInput,
  type Frequency,
  type ServiceKey,
  type Terrain,
} from "@/lib/calculator";
import { cn } from "@/lib/utils";

const ALL_SERVICES: ServiceKey[] = [
  "koszenie",
  "pielegnacja",
  "grabienie",
  "sadzenie",
  "ciecie",
  "porzadki",
];

const FREQUENCIES: Frequency[] = [
  "jednorazowo",
  "co_2_tyg",
  "co_tydzien",
  "raz_w_miesiacu",
  "sezonowy",
];

const TERRAINS: Terrain[] = ["plaski", "lekki_spadek", "trudny"];

export interface CalculatorTheme {
  /** ring color for the active chip */
  accent?: string;
  /** filled chip color when active */
  activeBg?: string;
  /** filled chip text when active */
  activeFg?: string;
  /** chip ring + text when inactive */
  inactiveBorder?: string;
  inactiveFg?: string;
  /** track color */
  trackColor?: string;
  /** number color for the price headline */
  priceColor?: string;
  /** font family applied to chip labels (Tailwind class) */
  chipFontClass?: string;
  /** font family for the headline price (Tailwind class) */
  priceFontClass?: string;
  /** border radius scale (Tailwind class) */
  chipRadiusClass?: string;
}

export function useCalculator(initial?: Partial<CalculatorInput>) {
  const [services, setServices] = useState<ServiceKey[]>(
    initial?.services ?? ["koszenie"],
  );
  const [area, setArea] = useState<number>(initial?.area ?? 300);
  const [frequency, setFrequency] = useState<Frequency>(
    initial?.frequency ?? "co_2_tyg",
  );
  const [terrain, setTerrain] = useState<Terrain>(initial?.terrain ?? "plaski");
  const [hedgeMeters, setHedgeMeters] = useState<number>(
    initial?.hedgeMeters ?? 20,
  );
  const [plantCount, setPlantCount] = useState<number>(
    initial?.plantCount ?? 5,
  );

  const result = useMemo(
    () =>
      estimate({
        services,
        area,
        frequency,
        terrain,
        hedgeMeters,
        plantCount,
      }),
    [services, area, frequency, terrain, hedgeMeters, plantCount],
  );

  return {
    state: { services, area, frequency, terrain, hedgeMeters, plantCount },
    setServices,
    toggleService: (key: ServiceKey) =>
      setServices((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
      ),
    setArea,
    setFrequency,
    setTerrain,
    setHedgeMeters,
    setPlantCount,
    result,
  };
}

export function CalculatorForm({
  theme = {},
  className,
  showTerrain = true,
  showBreakdown = false,
}: {
  theme?: CalculatorTheme;
  className?: string;
  showTerrain?: boolean;
  showBreakdown?: boolean;
}) {
  const c = useCalculator();
  const hasHedge = c.state.services.includes("ciecie");
  const hasPlants = c.state.services.includes("sadzenie");

  const chipBase = cn(
    "inline-flex items-center justify-center px-3.5 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:text-sm",
    theme.chipFontClass ?? "",
    theme.chipRadiusClass ?? "rounded-full",
  );

  const inactiveChip = cn(
    chipBase,
    "border",
    theme.inactiveBorder ?? "border-stone-300",
    theme.inactiveFg ?? "text-stone-700 hover:bg-stone-100",
  );

  const activeChip = cn(chipBase, "border border-transparent");

  return (
    <div className={cn("flex flex-col gap-7", className)}>
      {/* Services — multi-select chips */}
      <fieldset className="flex flex-col gap-3">
        <Label className="text-xs font-medium uppercase tracking-[0.18em] opacity-70">
          Co potrzebujecie?
        </Label>
        <div className="flex flex-wrap gap-2">
          {ALL_SERVICES.map((key) => {
            const on = c.state.services.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => c.toggleService(key)}
                className={on ? activeChip : inactiveChip}
                style={
                  on
                    ? {
                        background: theme.activeBg ?? "#047857",
                        color: theme.activeFg ?? "#ffffff",
                      }
                    : undefined
                }
              >
                {SERVICE_SHORT[key]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Area slider */}
      <fieldset className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label
            htmlFor="calc-area"
            className="text-xs font-medium uppercase tracking-[0.18em] opacity-70"
          >
            Wielkość ogrodu
          </Label>
          <span
            className="font-medium tabular-nums"
            style={{ color: theme.priceColor }}
          >
            {c.state.area} m²
          </span>
        </div>
        <Slider
          id="calc-area"
          min={50}
          max={2000}
          step={25}
          value={[c.state.area]}
          onValueChange={(v) => c.setArea(v[0] ?? 50)}
          aria-label="Wielkość ogrodu w metrach kwadratowych"
        />
        <div className="flex justify-between text-[10px] uppercase tracking-wider opacity-50">
          <span>50 m²</span>
          <span>2000 m²</span>
        </div>
      </fieldset>

      {/* Conditional: hedge length */}
      {hasHedge && (
        <fieldset className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <Label
              htmlFor="calc-hedge"
              className="text-xs font-medium uppercase tracking-[0.18em] opacity-70"
            >
              Długość żywopłotu
            </Label>
            <span className="font-medium tabular-nums">
              {c.state.hedgeMeters} m
            </span>
          </div>
          <Slider
            id="calc-hedge"
            min={5}
            max={200}
            step={5}
            value={[c.state.hedgeMeters]}
            onValueChange={(v) => c.setHedgeMeters(v[0] ?? 5)}
            aria-label="Długość żywopłotu w metrach"
          />
        </fieldset>
      )}

      {/* Conditional: plant count */}
      {hasPlants && (
        <fieldset className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <Label
              htmlFor="calc-plants"
              className="text-xs font-medium uppercase tracking-[0.18em] opacity-70"
            >
              Liczba sadzonek
            </Label>
            <span className="font-medium tabular-nums">
              {c.state.plantCount}
            </span>
          </div>
          <Slider
            id="calc-plants"
            min={1}
            max={50}
            step={1}
            value={[c.state.plantCount]}
            onValueChange={(v) => c.setPlantCount(v[0] ?? 1)}
            aria-label="Liczba sadzonek"
          />
        </fieldset>
      )}

      {/* Frequency */}
      <fieldset className="flex flex-col gap-3">
        <Label className="text-xs font-medium uppercase tracking-[0.18em] opacity-70">
          Częstotliwość
        </Label>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((f) => {
            const on = c.state.frequency === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => c.setFrequency(f)}
                className={on ? activeChip : inactiveChip}
                style={
                  on
                    ? {
                        background: theme.activeBg ?? "#047857",
                        color: theme.activeFg ?? "#ffffff",
                      }
                    : undefined
                }
              >
                {FREQUENCY_LABEL[f]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Terrain (optional) */}
      {showTerrain && (
        <fieldset className="flex flex-col gap-3">
          <Label className="text-xs font-medium uppercase tracking-[0.18em] opacity-70">
            Ukształtowanie terenu
          </Label>
          <div className="flex flex-wrap gap-2">
            {TERRAINS.map((t) => {
              const on = c.state.terrain === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => c.setTerrain(t)}
                  className={on ? activeChip : inactiveChip}
                  style={
                    on
                      ? {
                          background: theme.activeBg ?? "#047857",
                          color: theme.activeFg ?? "#ffffff",
                        }
                      : undefined
                  }
                >
                  {TERRAIN_LABEL[t]}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Result */}
      <div className="mt-2 flex flex-col gap-3 border-t pt-6" style={{ borderColor: "currentColor" }}>
        {/* Stack label + price vertically on mobile to keep the price on
            one line. The previous `flex justify-between` cramped both
            into a single row that kept wrapping/unwrapping below ~360 px
            as the price string grew — that wrap toggle on every slider
            tick read as flicker. */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <span className="text-xs font-medium uppercase tracking-[0.18em] opacity-70">
            Orientacyjnie
          </span>
          <span
            className={cn(
              "whitespace-nowrap tabular-nums leading-none",
              theme.priceFontClass ?? "font-medium",
            )}
            style={{ color: theme.priceColor }}
          >
            {c.state.services.length === 0 ? (
              <span className="text-base opacity-50">Wybierz usługę</span>
            ) : (
              <span className="text-2xl sm:text-3xl md:text-4xl">
                <AnimatedNumber value={c.result.min} format={formatPLN} />
                {" – "}
                <AnimatedNumber value={c.result.max} format={formatPLN} />
              </span>
            )}
          </span>
        </div>
        {showBreakdown && c.result.breakdown.length > 0 && (
          <ul className="flex flex-col gap-1 text-xs opacity-70">
            {c.result.breakdown.map((b) => (
              <li key={b.service} className="flex justify-between tabular-nums">
                <span>{b.label}</span>
                <span>
                  <AnimatedNumber value={b.minPrice} format={formatPLN} />
                  –
                  <AnimatedNumber value={b.maxPrice} format={formatPLN} />
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="max-w-prose text-[11px] leading-relaxed opacity-65 sm:text-xs">
          {DISCLAIMER}
        </p>
      </div>
    </div>
  );
}

// Re-export Checkbox so callers that need a checkbox elsewhere don't have to
// hunt for the right path. (Slider, Label etc. live in @/components/ui too.)
export { Checkbox };
