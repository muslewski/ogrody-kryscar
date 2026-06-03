"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.push("/sign-in");
        router.refresh();
      }}
      className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
    >
      Wyloguj się
    </button>
  );
}
