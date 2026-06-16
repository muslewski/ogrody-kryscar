import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Ustaw nowe hasło" };

export default function ResetPasswordPage() {
  // No signed-in redirect: a logged-in user may still arrive via a reset link.
  // ResetPasswordForm reads ?token via useSearchParams → needs Suspense.
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
