"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth-client";

/**
 * Set a new password using the token from the reset link (?token=...). On success
 * redirect to /sign-in. A missing/invalid token shows a clear message.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setError(null);
    setPending(true);
    const res = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (res.error) {
      setError(res.error.message ?? "Nie udało się zresetować hasła. Link mógł wygasnąć.");
      return;
    }
    router.push("/sign-in");
    router.refresh();
  };

  if (!token) {
    return (
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Nieprawidłowy link</h1>
        <p className="text-sm text-neutral-500">
          Link do resetu hasła jest nieprawidłowy lub wygasł. Poproś o nowy na stronie
          {" ‚Nie pamiętasz hasła?’"}.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Ustaw nowe hasło</h1>
      <p className="mb-6 text-sm text-neutral-500">Wpisz nowe hasło do swojego konta.</p>
      <form
        onSubmit={(e) => { e.preventDefault(); void submit(); }}
        className="flex flex-col gap-3"
      >
        <input
          className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600"
          type="password"
          placeholder="Nowe hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-700 px-3 py-2 font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "…" : "Zapisz nowe hasło"}
        </button>
      </form>
    </div>
  );
}
