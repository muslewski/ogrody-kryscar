"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { createRequest, cancelRequest } from "@/lib/requests";
import type { CreateRequestInput } from "@/lib/requests";

type ActionError = { ok: false; error: string };

async function requireUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

/** On success redirects to /panel/zamowienia (does not return). */
export async function createRequestAction(
  input: CreateRequestInput,
): Promise<ActionError | never> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sesja wygasła. Zaloguj się ponownie." };
  if (!input.items?.length) return { ok: false, error: "Wybierz przynajmniej jedną usługę." };
  try {
    await createRequest(userId, input);
  } catch {
    return { ok: false, error: "Nie udało się zapisać zapytania. Spróbuj ponownie." };
  }
  revalidatePath("/panel/zamowienia");
  revalidatePath("/panel");
  redirect("/panel/zamowienia");
}

export async function cancelRequestAction(
  id: string,
): Promise<{ ok: true } | ActionError> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sesja wygasła." };
  try {
    await cancelRequest(userId, id);
  } catch {
    return { ok: false, error: "Nie udało się anulować zapytania." };
  }
  // Cancelling also cancels the request's planned visits → refresh the panel
  // dashboard ("najbliższa wizyta") and the team's schedule.
  revalidatePath("/panel/zamowienia");
  revalidatePath("/panel");
  revalidatePath("/zespol/grafik");
  return { ok: true };
}
