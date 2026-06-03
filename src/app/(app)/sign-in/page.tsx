import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Zaloguj się" };

export default async function SignInPage() {
  // Already signed in? Skip the auth screen.
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/panel");
  // AuthForm uses useSearchParams → must sit under a Suspense boundary.
  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
