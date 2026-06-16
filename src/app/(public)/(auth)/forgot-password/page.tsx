import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Nie pamiętasz hasła?" };

export default async function ForgotPasswordPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/panel");
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
