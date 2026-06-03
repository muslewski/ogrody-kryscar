import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata = { title: "Panel" };

export default async function PanelPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user?.name;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Twój panel</h1>
      <p className="mt-2 text-neutral-600">
        Witaj{name ? `, ${name}` : ""}! Tu wkrótce pojawią się Twoje ogrody,
        zlecenia i historia wizyt.
      </p>
      <div className="mt-8">
        <SignOutButton />
      </div>
    </main>
  );
}
