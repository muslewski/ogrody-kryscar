import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getMyRequests } from "@/lib/requests";
import { RequestCard } from "@/components/requests/RequestCard";

export const metadata = { title: "Zamówienia" };

export default async function ZamowieniaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const requests = session ? await getMyRequests(session.user.id) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Zamówienia</h1>
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
          <div className="text-3xl">📋</div>
          <h2 className="mt-3 font-semibold text-neutral-900">Brak zapytań</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Wybierz ogród i zamów usługi — przygotujemy szacunkową wycenę.
          </p>
          <Link
            href="/panel/ogrody"
            className="mt-5 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Przejdź do ogrodów
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}
