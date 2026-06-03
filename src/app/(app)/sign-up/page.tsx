import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Załóż konto" };

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/panel");
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
