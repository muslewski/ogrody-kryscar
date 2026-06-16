"use client";

import { useState } from "react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

/**
 * Request a password-reset link. Always shows a neutral confirmation regardless
 * of whether the address exists (no account enumeration). The reset link in the
 * email lands on /reset-password (set via redirectTo).
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setPending(false);
    setSent(true);
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Nie pamiętasz hasła?</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Podaj adres e-mail — wyślemy link do ustawienia nowego hasła.
      </p>
      {sent ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Jeśli konto istnieje, wysłaliśmy wiadomość z linkiem do resetu hasła.
          Sprawdź swoją skrzynkę.
        </p>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); void submit(); }}
          className="flex flex-col gap-3"
        >
          <input
            className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-emerald-700 px-3 py-2 font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {pending ? "…" : "Wyślij link"}
          </button>
        </form>
      )}
      <p className="mt-4 text-sm text-neutral-500">
        <Link href="/sign-in" className="font-medium text-emerald-700 hover:underline">
          Wróć do logowania
        </Link>
      </p>
    </div>
  );
}
