/**
 * Server-side team boundary. Every /zespol server action calls this — the layout
 * gate can't be trusted by directly-callable actions. Resolves the Better Auth
 * session, looks up the Payload role + tenant, and returns them only for a
 * gardener. Returns null otherwise (the action surfaces a Polish error).
 */
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";

import { auth } from "./auth";

export interface GardenerCtx {
  userId: string;
  tenantId: string;
}

export async function requireGardener(): Promise<GardenerCtx | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "users",
    where: { id: { equals: session.user.id } },
    limit: 1,
    depth: 0,
  });
  const me = docs[0];
  if (!me || me.role !== "gardener") return null;
  const tenantId =
    typeof me.tenant === "object" && me.tenant
      ? String(me.tenant.id)
      : String(me.tenant);
  return { userId: session.user.id, tenantId };
}
