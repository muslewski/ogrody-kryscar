import { formatRange } from "@/lib/pricing";
import type { RequestView } from "@/lib/requests";
import { RequestActions } from "./RequestActions";

const STATUS_LABEL: Record<RequestView["status"], { label: string; cls: string }> = {
  draft: { label: "Szkic", cls: "bg-neutral-100 text-neutral-600" },
  new: { label: "Nowe", cls: "bg-emerald-100 text-emerald-700" },
  accepted: { label: "Przyjęte", cls: "bg-sky-100 text-sky-700" },
  declined: { label: "Odrzucone", cls: "bg-red-100 text-red-700" },
  cancelled: { label: "Anulowane", cls: "bg-red-100 text-red-700" },
  done: { label: "Zakończone", cls: "bg-neutral-200 text-neutral-700" },
};

export function RequestCard({ request }: { request: RequestView }) {
  const status = STATUS_LABEL[request.status];
  const date = new Date(request.createdAt).toLocaleDateString("pl-PL");
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold tracking-tight text-neutral-900">{request.lawnName}</h3>
          <p className="text-xs text-neutral-400">{date}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}>
          {status.label}
        </span>
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {request.items.map((it, i) => (
          <li
            key={i}
            className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600"
          >
            {it.serviceTitle}
            {it.custom ? " · wycena" : ""}
          </li>
        ))}
      </ul>
      {request.status === "declined" && request.declineReason && (
        <p className="mt-2 text-xs text-red-600">Powód: {request.declineReason}</p>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-sm font-bold text-emerald-700">
          {request.estMin > 0 ? formatRange(request.estMin, request.estMax) : "Wycena indywidualna"}
        </span>
        {(request.status === "new" || request.status === "accepted") && <RequestActions id={request.id} />}
      </div>
    </div>
  );
}
