import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { requireGardener } from "@/lib/team-auth";
import { getTenantRequests } from "@/lib/team";
import { getTeamVisits } from "@/lib/visits";

export const metadata = { title: "Pulpit" };

export default async function ZespolPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user?.name;
  const ctx = await requireGardener();
  const [requests, visits] = ctx
    ? await Promise.all([getTenantRequests(ctx.tenantId), getTeamVisits(ctx.tenantId)])
    : [[], []];

  const newCount = requests.filter((r) => r.status === "new").length;
  const weekAhead = new Date();
  weekAhead.setDate(weekAhead.getDate() + 7);
  const upcoming = visits.filter(
    (v) => v.status === "planned" && new Date(v.scheduledAt) <= weekAhead,
  ).length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Witaj{name ? `, ${name}` : ""} 👋</h1>
      <p className="mt-2 text-sm text-neutral-500">Zlecenia klientów i grafik zespołu Ogrody Kryscar.</p>

      <Link href="/zespol/zlecenia" className="mt-6 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-emerald-300">
        <div>
          <p className="text-sm text-neutral-500">Nowe zlecenia</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {newCount === 0 ? "Brak nowych" : `${newCount} do przyjęcia`}
          </p>
        </div>
        <span aria-hidden className="text-emerald-700">→</span>
      </Link>

      <Link href="/zespol/grafik" className="mt-3 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-emerald-300">
        <div>
          <p className="text-sm text-neutral-500">Wizyty (najbliższe 7 dni)</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {upcoming === 0 ? "Brak wizyt" : `${upcoming} zaplanowane`}
          </p>
        </div>
        <span aria-hidden className="text-emerald-700">→</span>
      </Link>
    </div>
  );
}
