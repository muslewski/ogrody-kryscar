import Link from "next/link";

import { LawnDrawer } from "@/components/lawns/LawnDrawer";
import { createLawnAction } from "../actions";

export const metadata = { title: "Dodaj ogród" };

export default function NewLawnPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dodaj ogród</h1>
        <Link
          href="/panel/ogrody"
          className="text-sm text-neutral-500 hover:text-emerald-700"
        >
          ← Wróć
        </Link>
      </div>
      <LawnDrawer onSave={createLawnAction} submitLabel="Zapisz ogród" />
    </div>
  );
}
