import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const metadata = { title: "Pulpit" };

export default async function PanelPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user?.name;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Witaj{name ? `, ${name}` : ""} 👋
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Tu zobaczysz swoje ogrody, najbliższe wizyty i zamówienia.
      </p>
    </div>
  );
}
