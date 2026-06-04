import Link from "next/link";
import { headers } from "next/headers";
import { Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { getMyLawns } from "@/lib/lawns";
import { LawnCard } from "@/components/lawns/LawnCard";

export const metadata = { title: "Moje ogrody" };

export default async function OgrodyPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const lawns = session ? await getMyLawns(session.user.id) : [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Moje ogrody</h1>
        {lawns.length > 0 && (
          <Link
            href="/panel/ogrody/nowy"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Dodaj ogród
          </Link>
        )}
      </div>

      {lawns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
          <div className="text-3xl">🌱</div>
          <h2 className="mt-3 font-semibold text-neutral-900">
            Nie masz jeszcze żadnego ogrodu
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Dodaj swój trawnik na mapie — obrysujesz go w kilka sekund, a my
            policzymy powierzchnię i przygotujemy wycenę usług.
          </p>
          <Link
            href="/panel/ogrody/nowy"
            className="mt-5 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Dodaj ogród
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lawns.map((lawn) => (
            <LawnCard key={lawn.id} lawn={lawn} />
          ))}
          <Link
            href="/panel/ogrody/nowy"
            className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            <Plus className="h-7 w-7" />
            <span className="text-sm font-semibold">Dodaj kolejny ogród</span>
          </Link>
        </div>
      )}
    </div>
  );
}
