"use server";

import { revalidatePath } from "next/cache";

import { requireGardener } from "@/lib/team-auth";
import { acceptRequest, declineRequest, completeRequest } from "@/lib/team";

type Result = { ok: true } | { ok: false; error: string };

export async function acceptRequestAction(id: string, scheduledAt: string): Promise<Result> {
  const ctx = await requireGardener();
  if (!ctx) return { ok: false, error: "Brak uprawnień." };
  if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt)))
    return { ok: false, error: "Wybierz poprawną datę wizyty." };
  try {
    await acceptRequest(ctx.tenantId, id, scheduledAt);
  } catch (err) {
    console.error("acceptRequestAction failed:", err);
    return { ok: false, error: "Nie udało się przyjąć zlecenia." };
  }
  revalidatePath("/zespol/zlecenia");
  revalidatePath("/zespol/grafik");
  revalidatePath("/zespol");
  return { ok: true };
}

export async function declineRequestAction(id: string, reason: string): Promise<Result> {
  const ctx = await requireGardener();
  if (!ctx) return { ok: false, error: "Brak uprawnień." };
  try {
    await declineRequest(ctx.tenantId, id, reason);
  } catch (err) {
    console.error("declineRequestAction failed:", err);
    return { ok: false, error: "Nie udało się odrzucić zlecenia." };
  }
  revalidatePath("/zespol/zlecenia");
  revalidatePath("/zespol");
  return { ok: true };
}

export async function completeRequestAction(id: string): Promise<Result> {
  const ctx = await requireGardener();
  if (!ctx) return { ok: false, error: "Brak uprawnień." };
  try {
    await completeRequest(ctx.tenantId, id);
  } catch (err) {
    console.error("completeRequestAction failed:", err);
    return { ok: false, error: "Nie udało się zakończyć zlecenia." };
  }
  revalidatePath("/zespol/zlecenia");
  revalidatePath("/zespol");
  return { ok: true };
}
