"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { VisitView } from "@/lib/visits";
import {
  setVisitStatusAction,
  scheduleNextVisitAction,
} from "@/app/(app)/zespol/grafik/actions";

/** `iso` + N days, formatted for <input type="datetime-local"> (local time). */
function plusDaysSlot(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function VisitCard({ visit, overdue }: { visit: VisitView; overdue?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [planning, setPlanning] = useState(false);
  const [slot, setSlot] = useState(() => plusDaysSlot(visit.scheduledAt, 7));

  const time = new Date(visit.scheduledAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

  function act(fn: () => Promise<{ ok: true } | { ok: false; error: string }>, msg: string) {
    start(async () => {
      const res = await fn();
      if (!res.ok) toast.error(res.error);
      else {
        toast.success(msg);
        setPlanning(false);
        router.refresh();
      }
    });
  }

  return (
    <div className={`rounded-xl border bg-white p-3 ${overdue ? "border-amber-300" : "border-neutral-200"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {time} · {visit.lawnName}
          </p>
          <p className="text-xs text-neutral-500">{visit.customerName}</p>
          {visit.serviceTitles.length > 0 && (
            <p className="mt-1 text-xs text-neutral-400">{visit.serviceTitles.join(" · ")}</p>
          )}
          {visit.note && <p className="mt-1 text-xs text-neutral-500">{visit.note}</p>}
        </div>
        {visit.assigneeName && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{visit.assigneeName}</span>
        )}
      </div>
      {visit.status === "planned" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => act(() => setVisitStatusAction(visit.id, "done"), "Wizyta wykonana.")}
            disabled={pending}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Wykonana
          </button>
          <button
            onClick={() => act(() => setVisitStatusAction(visit.id, "cancelled"), "Wizyta odwołana.")}
            disabled={pending}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 disabled:opacity-60"
          >
            Odwołaj
          </button>
          <button
            onClick={() => setPlanning((v) => !v)}
            disabled={pending}
            className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
          >
            Zaplanuj kolejną
          </button>
        </div>
      ) : (
        <p className="mt-2 text-xs font-medium text-emerald-600">&#10003; Wykonana</p>
      )}
      {planning && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
          <label htmlFor={`next-${visit.id}`} className="block text-xs font-medium text-neutral-700">
            Termin kolejnej wizyty
          </label>
          <input
            id={`next-${visit.id}`}
            type="datetime-local"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setPlanning(false)} disabled={pending} className="rounded-lg px-3 py-1.5 text-xs text-neutral-500">
              Anuluj
            </button>
            <button
              onClick={() =>
                act(
                  () =>
                    scheduleNextVisitAction({
                      requestId: visit.requestId,
                      scheduledAt: new Date(slot).toISOString(),
                    }),
                  "Kolejna wizyta zaplanowana.",
                )
              }
              disabled={pending}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {pending ? "…" : "Zaplanuj"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
