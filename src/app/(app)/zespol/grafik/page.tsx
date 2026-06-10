import { requireGardener } from "@/lib/team-auth";
import { getTeamVisits, type VisitView } from "@/lib/visits";
import { VisitCard } from "@/components/team/VisitCard";

export const metadata = { title: "Grafik" };

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
}

export default async function GrafikPage() {
  const ctx = await requireGardener();
  const visits = ctx ? await getTeamVisits(ctx.tenantId) : [];

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const overdue = visits.filter((v) => v.status === "planned" && new Date(v.scheduledAt) < startOfToday);
  const upcoming = visits.filter((v) => !(v.status === "planned" && new Date(v.scheduledAt) < startOfToday));

  // Group upcoming by day (already sorted soonest-first).
  const byDay = new Map<string, VisitView[]>();
  for (const v of upcoming) {
    const k = dayKey(v.scheduledAt);
    const arr = byDay.get(k);
    if (arr) arr.push(v);
    else byDay.set(k, [v]);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Grafik</h1>
      {visits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
          <div className="text-3xl">📅</div>
          <h2 className="mt-3 font-semibold text-neutral-900">Brak zaplanowanych wizyt</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Przyjmij zlecenie z zakładki &bdquo;Zlecenia&rdquo;, aby zaplanować pierwszą wizytę.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {overdue.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-600">Zaległe · {overdue.length}</h2>
              <div className="space-y-2">
                {overdue.map((v) => (
                  <VisitCard key={v.id} visit={v} overdue />
                ))}
              </div>
            </section>
          )}
          {[...byDay.entries()].map(([day, items]) => (
            <section key={day}>
              <h2 className="mb-3 text-sm font-semibold capitalize text-neutral-700">{day}</h2>
              <div className="space-y-2">
                {items.map((v) => (
                  <VisitCard key={v.id} visit={v} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
