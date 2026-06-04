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
