import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getPayload } from "payload";
import config from "@payload-config";

import { auth } from "@/lib/auth";

/**
 * Authoritative gate for the GARDENER area. Same shape as the customer gate but
 * requires role `gardener` (a customer is sent to /panel; a missing user to
 * /sign-in). Gardeners are existing users promoted in /admin — there is no
 * public gardener signup.
 */
export default async function ZespolLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session) {
    const next = hdrs.get("x-pathname") ?? "/zespol";
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
  if (role !== "gardener") redirect("/panel");

  return <>{children}</>;
}
