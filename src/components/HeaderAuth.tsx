"use client";

import Link from "next/link";

import { useSession } from "@/lib/auth-client";

/**
 * Session-aware auth entry. Logged out → "Zaloguj" (/sign-in); logged in →
 * "Panel" (/panel — gardeners are routed to /zespol by the gate, so one link
 * covers both roles). A client island, so the marketing pages stay statically
 * generated; while the session resolves we show the logged-out state (it's a
 * link either way, so no layout jump).
 *
 * `header` = a compact text link for the header / mobile menu; `inline` = a
 * footer list link matching the other footer links.
 */
export function HeaderAuth({
  variant = "header",
}: {
  variant?: "header" | "inline";
}) {
  const { data, isPending } = useSession();
  const loggedIn = !isPending && Boolean(data);
  const href = loggedIn ? "/panel" : "/sign-in";
  const label = loggedIn ? "Panel" : "Zaloguj";

  if (variant === "inline") {
    return (
      <Link
        href={href}
        className="underline-offset-4 hover:text-emerald-700 hover:underline"
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="text-xs font-medium text-neutral-700 transition-colors hover:text-emerald-700 sm:text-sm"
    >
      {label}
    </Link>
  );
}
