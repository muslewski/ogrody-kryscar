import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { getMyLawns } from "@/lib/lawns";
import { getMyRequests } from "@/lib/requests";

export const metadata = { title: "Pulpit" };

/** Polish plural for "ogród": 1 → ogród, 2–4 → ogrody, 5+ / 11–14 → ogrodów. */
function lawnsLabel(n: number): string {
  if (n === 1) return "ogród";
  const ones = n % 10;
  const tens = n % 100;
  if (ones >= 2 && ones <= 4 && (tens < 10 || tens >= 20)) return "ogrody";
  return "ogrodów";
}

export default async function PanelPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user?.name;
  const lawns = session ? await getMyLawns(session.user.id) : [];
  const requests = session ? await getMyRequests(session.user.id) : [];
  const activeRequests = requests.filter((r) => r.status === "new").length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Witaj{name ? `, ${name}` : ""} 👋
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Tu zobaczysz swoje ogrody, najbliższe wizyty i zamówienia.
      </p>

      <Link
        href="/panel/ogrody"
        className="mt-6 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-emerald-300"
      >
        <div>
          <p className="text-sm text-neutral-500">Moje ogrody</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {lawns.length === 0
              ? "Dodaj swój pierwszy ogród"
              : `${lawns.length} ${lawnsLabel(lawns.length)}`}
          </p>
        </div>
        <span aria-hidden className="text-emerald-700">
          →
        </span>
      </Link>

      <Link
        href="/panel/zamowienia"
        className="mt-3 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-emerald-300"
      >
        <div>
          <p className="text-sm text-neutral-500">Zamówienia</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {activeRequests === 0 ? "Brak aktywnych zapytań" : `${activeRequests} aktywne`}
          </p>
        </div>
        <span aria-hidden className="text-emerald-700">
          →
        </span>
      </Link>
    </div>
  );
}
