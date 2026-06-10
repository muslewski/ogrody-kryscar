import { requireGardener } from "@/lib/team-auth";
import { getTenantRequests } from "@/lib/team";
import { RequestTriageCard } from "@/components/team/RequestTriageCard";

export const metadata = { title: "Zlecenia" };

const GROUPS = [
  { key: "new", label: "Nowe", match: (s: string) => s === "new" },
  { key: "active", label: "W realizacji", match: (s: string) => s === "accepted" },
  { key: "archive", label: "Archiwum", match: (s: string) => ["done", "declined", "cancelled"].includes(s) },
] as const;

export default async function ZleceniaPage() {
  const ctx = await requireGardener();
  const requests = ctx ? await getTenantRequests(ctx.tenantId) : [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Zlecenia</h1>
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
          <div className="text-3xl">🌿</div>
          <h2 className="mt-3 font-semibold text-neutral-900">Brak zleceń</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Gdy klient zamówi usługi, zlecenie pojawi się tutaj do przyjęcia.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {GROUPS.map((g) => {
            const items = requests.filter((r) => g.match(r.status));
            if (items.length === 0) return null;
            return (
              <section key={g.key}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  {g.label} · {items.length}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((r) => (
                    <RequestTriageCard key={r.id} request={r} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
