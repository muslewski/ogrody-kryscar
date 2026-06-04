import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getLawn } from "@/lib/lawns";
import { getConfiguratorServices } from "@/lib/catalog";
import { ServiceConfigurator } from "@/components/requests/ServiceConfigurator";
import { LawnSnapshot } from "@/components/lawns/LawnSnapshot";

export const metadata = { title: "Zamów usługi" };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const lawn = await getLawn(session.user.id, id);
  if (!lawn) notFound();
  const services = await getConfiguratorServices();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 overflow-hidden rounded-2xl border border-neutral-200">
        <div className="relative aspect-[16/6] bg-emerald-900/10">
          <LawnSnapshot
            polygon={lawn.polygon}
            buildings={lawn.buildings}
            alt={`Mapa — ${lawn.name}`}
            width={960}
            height={360}
            className="h-full w-full object-cover"
          />
          <span className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 shadow">
            {lawn.areaM2.toLocaleString("pl-PL")} m²
          </span>
        </div>
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">Zamów usługi</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {lawn.name} · {lawn.areaM2.toLocaleString("pl-PL")} m²
            </h1>
          </div>
          <Link href="/panel/ogrody" className="text-sm text-neutral-500 hover:text-emerald-700">
            ← Wróć
          </Link>
        </div>
      </div>
      <ServiceConfigurator
        lawn={{ id: lawn.id, name: lawn.name, areaM2: lawn.areaM2 }}
        services={services}
      />
    </div>
  );
}
