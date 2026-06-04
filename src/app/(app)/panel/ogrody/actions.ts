"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { createLawn, updateLawn, deleteLawn } from "@/lib/lawns";
import type { LawnInput } from "@/lib/lawn-types";
import { autoFillLawn } from "@/lib/boundary";
import type { AutoFillResult, AutoFillError } from "@/lib/boundary/types";

type ActionError = { ok: false; error: string };

async function requireUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

function validate(input: LawnInput): string | null {
  if (!input.name.trim()) return "Podaj nazwę ogrodu.";
  if (!input.address.trim()) return "Brak adresu — wyszukaj lokalizację.";
  if (!Array.isArray(input.polygon) || input.polygon.length < 3)
    return "Obrysuj trawnik (min. 3 punkty).";
  return null;
}

/** On success this redirects to /panel/ogrody (does not return). */
export async function createLawnAction(
  input: LawnInput,
): Promise<ActionError | never> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sesja wygasła. Zaloguj się ponownie." };
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    await createLawn(userId, input);
  } catch {
    return { ok: false, error: "Nie udało się zapisać ogrodu. Spróbuj ponownie." };
  }
  revalidatePath("/panel/ogrody");
  revalidatePath("/panel");
  redirect("/panel/ogrody");
}

/** On success this redirects to /panel/ogrody (does not return). */
export async function updateLawnAction(
  id: string,
  input: LawnInput,
): Promise<ActionError | never> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sesja wygasła. Zaloguj się ponownie." };
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    await updateLawn(userId, id, input);
  } catch {
    return { ok: false, error: "Nie udało się zapisać zmian." };
  }
  revalidatePath("/panel/ogrody");
  revalidatePath("/panel");
  redirect("/panel/ogrody");
}

/** Read-only: resolve a parcel (minus buildings) for the given point. */
export async function autoFillLawnAction(
  lat: number,
  lng: number,
): Promise<AutoFillResult | AutoFillError> {
  const userId = await requireUserId();
  if (!userId) return { error: "failed" };
  try {
    return await autoFillLawn({ lat, lng });
  } catch {
    return { error: "failed" };
  }
}

export async function deleteLawnAction(
  id: string,
): Promise<{ ok: true } | ActionError> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sesja wygasła." };
  try {
    await deleteLawn(userId, id);
  } catch {
    return { ok: false, error: "Nie udało się usunąć ogrodu." };
  }
  revalidatePath("/panel/ogrody");
  revalidatePath("/panel");
  return { ok: true };
}
