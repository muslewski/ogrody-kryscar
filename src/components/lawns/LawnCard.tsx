import Link from "next/link";

import { buildStaticMapUrl } from "@/lib/maps";
import type { LawnView } from "@/lib/lawn-types";
import { LawnActionsMenu } from "./LawnActionsMenu";

export function LawnCard({ lawn }: { lawn: LawnView }) {
  const snapshot = buildStaticMapUrl(lawn.polygon, {
    width: 480,
    height: 220,
    buildings: lawn.buildings,
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="relative aspect-[16/8] bg-emerald-900/10">
        {snapshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={snapshot}
            alt={`Mapa — ${lawn.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            Podgląd mapy niedostępny
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 shadow">
          {lawn.areaM2.toLocaleString("pl-PL")} m²
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold tracking-tight text-neutral-900">
          {lawn.name}
        </h3>
        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {lawn.address}
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            href={`/panel/ogrody/${lawn.id}/zamow`}
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Zamów usługi
          </Link>
          <LawnActionsMenu id={lawn.id} name={lawn.name} />
        </div>
      </div>
    </div>
  );
}
