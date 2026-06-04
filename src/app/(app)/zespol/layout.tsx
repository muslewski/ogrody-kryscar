import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getPayload } from "payload";
import config from "@payload-config";

import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell/AppShell";

/**
 * Authoritative gate for the GARDENER area. Same shape as the customer gate but
 * requires role `gardener` (a customer → /panel; missing user → /sign-in), then
 * renders the shared app shell. Gardeners are promoted in /admin — no public
 * gardener signup.
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
  const me = docs[0];
  if (!me?.role) redirect("/sign-in");
  if (me.role !== "gardener") redirect("/panel");

  return (
    <AppShell role="gardener" user={{ name: me.name, email: me.email }}>
      {children}
    </AppShell>
  );
}
