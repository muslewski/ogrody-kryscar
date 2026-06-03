import { Suspense } from "react";

import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Zaloguj się" };

export default function SignInPage() {
  // AuthForm uses useSearchParams → must sit under a Suspense boundary.
  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
