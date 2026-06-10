"use server";

import { revalidatePath } from "next/cache";

import { requireGardener } from "@/lib/team-auth";
import { setVisitStatus } from "@/lib/visits";
import { scheduleNextVisit } from "@/lib/team";

type Result = { ok: true } | { ok: false; error: string };

export async function setVisitStatusAction(
  id: string,
  status: "done" | "cancelled",
): Promise<Result> {
  const ctx = await requireGardener();
  if (!ctx) return { ok: false, error: "Brak uprawnień." };
  try {
    await setVisitStatus(ctx.tenantId, id, status);
  } catch (err) {
    console.error("setVisitStatusAction failed:", err);
    return { ok: false, error: "Nie udało się zaktualizować wizyty." };
  }
  revalidatePath("/zespol/grafik");
  revalidatePath("/zespol");
  return { ok: true };
}

export async function scheduleNextVisitAction(input: {
  requestId: string;
  scheduledAt: string;
}): Promise<Result> {
  const ctx = await requireGardener();
  if (!ctx) return { ok: false, error: "Brak uprawnień." };
  if (!input.scheduledAt || Number.isNaN(Date.parse(input.scheduledAt)))
    return { ok: false, error: "Wybierz poprawną datę wizyty." };
  try {
    await scheduleNextVisit(ctx.tenantId, input.requestId, input.scheduledAt);
  } catch (err) {
    console.error("scheduleNextVisitAction failed:", err);
    return { ok: false, error: "Nie udało się zaplanować wizyty." };
  }
  revalidatePath("/zespol/grafik");
  return { ok: true };
}
