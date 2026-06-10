"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { safeInternalPath } from "@/lib/safe-internal-path";

/**
 * Minimal email+password auth form for the customer portal. Shared by /sign-in
 * and /sign-up via the `mode` prop. Public signup always creates a `customer`
 * (role is admin-only); a gardener is an existing user promoted in /admin.
 */
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  // Sanitized: `?next=` is attacker-influenceable — internal paths only.
  const next = safeInternalPath(useSearchParams().get("next"), "/panel");
  const isSignUp = mode === "sign-up";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setError(null);
    setPending(true);
    const res = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password });
    setPending(false);
    if (res.error) {
      setError(res.error.message ?? "Coś poszło nie tak. Spróbuj ponownie.");
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {isSignUp ? "Załóż konto" : "Zaloguj się"}
      </h1>
      <p className="mb-6 text-sm text-neutral-500">
        Ogrody Kryscar — panel klienta
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="flex flex-col gap-3"
      >
        {isSignUp && (
          <input
            className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600"
            placeholder="Imię i nazwisko"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        )}
        <input
          className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600"
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={isSignUp ? "new-password" : "current-password"}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-700 px-3 py-2 font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "…" : isSignUp ? "Załóż konto" : "Zaloguj się"}
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-500">
        {isSignUp ? "Masz już konto? " : "Nie masz konta? "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-medium text-emerald-700 hover:underline"
        >
          {isSignUp ? "Zaloguj się" : "Załóż konto"}
        </Link>
      </p>
    </div>
  );
}
