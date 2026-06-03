import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata = { title: "Panel zespołu" };

export default async function ZespolPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user?.name;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Panel zespołu</h1>
      <p className="mt-2 text-neutral-600">
        Witaj{name ? `, ${name}` : ""}! Tu zobaczysz zlecenia klientów przypisane
        do Ogrody Kryscar i ich szczegóły.
      </p>
      <div className="mt-8">
        <SignOutButton />
      </div>
    </main>
  );
}
