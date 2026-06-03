import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getPayload } from "payload";
import config from "@payload-config";

import { auth } from "@/lib/auth";

/**
 * Authoritative gate for the CUSTOMER area. The proxy already did an optimistic
 * cookie check; here we verify the real session and the user's role against
 * Payload (the source of truth). Loop-safe: missing user → /sign-in; wrong role
 * → that role's own area.
 */
export default async function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session) {
    const next = hdrs.get("x-pathname") ?? "/panel";
    redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  }

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "users",
    where: { id: { equals: session.user.id } },
    limit: 1,
    depth: 0,
  });
  const role = docs[0]?.role;
  if (!role) redirect("/sign-in");
  if (role !== "customer") redirect("/zespol");

  return <>{children}</>;
}
