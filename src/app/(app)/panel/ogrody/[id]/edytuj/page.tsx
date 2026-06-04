import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getLawn } from "@/lib/lawns";
import { LawnDrawer } from "@/components/lawns/LawnDrawer";
import { updateLawnAction } from "../../actions";
import type { LawnInput } from "@/lib/lawn-types";

export const metadata = { title: "Edytuj ogród" };

export default async function EditLawnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const lawn = await getLawn(session.user.id, id);
  if (!lawn) notFound();

  // Bind the id into the action (a server function) so LawnDrawer's onSave
  // signature stays (input) => ….
  async function onSave(input: LawnInput) {
    "use server";
    return updateLawnAction(id, input);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edytuj ogród</h1>
        <Link
          href="/panel/ogrody"
          className="text-sm text-neutral-500 hover:text-emerald-700"
        >
          ← Wróć
        </Link>
      </div>
      <LawnDrawer initial={lawn} onSave={onSave} submitLabel="Zapisz zmiany" />
    </div>
  );
}
