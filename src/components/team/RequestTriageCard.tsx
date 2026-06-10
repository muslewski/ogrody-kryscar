"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { formatRange } from "@/lib/pricing";
import type { LawnPoint } from "@/lib/lawn-types";
import type { TeamRequestView } from "@/lib/team";
import { LawnSnapshot } from "@/components/lawns/LawnSnapshot";
import {
  acceptRequestAction,
  declineRequestAction,
  completeRequestAction,
} from "@/app/(app)/zespol/zlecenia/actions";

/** Tomorrow 09:00 local, formatted for <input type="datetime-local">. */
function defaultSlot(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RequestTriageCard({ request }: { request: TeamRequestView }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [mode, setMode] = useState<"none" | "accept" | "decline">("none");
  const [slot, setSlot] = useState(defaultSlot);
  const [reason, setReason] = useState("");

  function refresh(msg: string) {
    toast.success(msg);
    setMode("none");
    router.refresh();
  }

  function onAccept() {
    start(async () => {
      const res = await acceptRequestAction(request.id, new Date(slot).toISOString());
      if (!res.ok) toast.error(res.error);
      else refresh("Zlecenie przyjęte — wizyta zaplanowana.");
    });
  }
  function onDecline() {
    start(async () => {
      const res = await declineRequestAction(request.id, reason.trim());
      if (!res.ok) toast.error(res.error);
      else refresh("Zlecenie odrzucone.");
    });
  }
  function onComplete() {
    start(async () => {
      const res = await completeRequestAction(request.id);
      if (!res.ok) toast.error(res.error);
      else refresh("Zlecenie zakończone.");
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 overflow-hidden rounded-xl border border-neutral-100">
        <div className="relative aspect-[16/6] bg-emerald-900/10">
          <LawnSnapshot
            polygon={request.polygon as unknown as LawnPoint[]}
            buildings={request.buildings as unknown as LawnPoint[][]}
            alt={`Mapa — ${request.lawnName}`}
            width={720}
            height={270}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <h3 className="font-semibold tracking-tight text-neutral-900">{request.lawnName}</h3>
      <p className="text-xs text-neutral-500">
        {request.customerName}
        {request.address ? ` · ${request.address}` : ""}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {request.items.map((it, i) => (
          <li key={i} className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600">
            {it.serviceTitle}
            {it.custom ? " · wycena" : ""}
          </li>
        ))}
      </ul>
      {request.note && <p className="mt-2 text-sm text-neutral-600">„{request.note}&rdquo;</p>}
      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-sm font-bold text-emerald-700">
          {request.estMin > 0 ? formatRange(request.estMin, request.estMax) : "Wycena indywidualna"}
        </span>
        {request.status === "new" && mode === "none" && (
          <div className="flex gap-2">
            <button
              onClick={() => setMode("decline")}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
            >
              Odrzuć
            </button>
            <button
              onClick={() => setMode("accept")}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Przyjmij
            </button>
          </div>
        )}
        {request.status === "accepted" && (
          <button
            onClick={onComplete}
            disabled={pending}
            className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
          >
            {pending ? "…" : "Zakończ zlecenie"}
          </button>
        )}
      </div>

      {mode === "accept" && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
          <label htmlFor={`slot-${request.id}`} className="block text-xs font-medium text-neutral-700">Termin wizyty</label>
          <input
            id={`slot-${request.id}`}
            type="datetime-local"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setMode("none")} disabled={pending} className="rounded-lg px-3 py-1.5 text-xs text-neutral-500">
              Anuluj
            </button>
            <button onClick={onAccept} disabled={pending} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {pending ? "…" : "Przyjmij i zaplanuj"}
            </button>
          </div>
        </div>
      )}
      {mode === "decline" && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50/50 p-3">
          <label htmlFor={`reason-${request.id}`} className="block text-xs font-medium text-neutral-700">Powód (widoczny dla klienta)</label>
          <textarea
            id={`reason-${request.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            placeholder="np. poza obszarem działania"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setMode("none")} disabled={pending} className="rounded-lg px-3 py-1.5 text-xs text-neutral-500">
              Wróć
            </button>
            <button onClick={onDecline} disabled={pending} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {pending ? "…" : "Odrzuć zlecenie"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
