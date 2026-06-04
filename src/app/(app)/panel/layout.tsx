import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getPayload } from "payload";
import config from "@payload-config";

import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell/AppShell";

/**
 * Authoritative gate for the CUSTOMER area. The proxy did an optimistic cookie
 * check; here we verify the real session + role against Payload, then render the
 * shared app shell. Loop-safe: missing user → /sign-in; wrong role → /zespol.
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
  const me = docs[0];
  if (!me?.role) redirect("/sign-in");
  if (me.role !== "customer") redirect("/zespol");

  return (
    <AppShell role="customer" user={{ name: me.name, email: me.email }}>
      {children}
    </AppShell>
  );
}
