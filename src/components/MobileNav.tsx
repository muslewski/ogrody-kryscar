"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { COMPANY, NAV_LINKS } from "@/lib/data";
import { useSession } from "@/lib/auth-client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Responsive mobile navigation (`< md`). A hamburger that opens a shadcn Sheet
 * drawer sliding in from the left over a dimmed scrim — Radix Dialog provides
 * the focus-trap, scroll-lock, Escape, and inert background. The drawer carries
 * the nav links plus the actions the minimal mobile bar no longer shows: the
 * session-aware Zaloguj/Panel link, the "Zamów wycenę" CTA, and a tap-to-call.
 * A client island, so the marketing pages stay statically generated.
 */
export function MobileNav() {
  const { data, isPending } = useSession();
  const loggedIn = !isPending && Boolean(data);
  const authHref = loggedIn ? "/panel" : "/sign-in";
  const authLabel = loggedIn ? "Panel" : "Zaloguj";

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger
          type="button"
          aria-label="Otwórz menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </SheetTrigger>

        <SheetContent side="left" className="w-[84%] max-w-xs gap-0 p-0">
          <SheetHeader className="flex-row items-center gap-2.5 border-b border-neutral-200 p-4">
            <Image
              src="/logo.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-md"
            />
            <SheetTitle className="text-base tracking-tight">
              {COMPANY.name}
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 text-sm">
            {NAV_LINKS.map((l) => (
              <SheetClose asChild key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-lg px-3 py-2.5 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-emerald-700"
                >
                  {l.label}
                </Link>
              </SheetClose>
            ))}
          </nav>

          <div className="flex flex-col gap-3 border-t border-neutral-200 p-4">
            <SheetClose asChild>
              <Link
                href={authHref}
                className="text-sm font-medium text-neutral-700 transition-colors hover:text-emerald-700"
              >
                {authLabel} →
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/#kontakt"
                className="rounded-full bg-neutral-900 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Zamów wycenę
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="text-sm text-neutral-500 transition-colors hover:text-emerald-700"
              >
                {COMPANY.phone}
              </a>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
