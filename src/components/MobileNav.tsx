"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { COMPANY, NAV_LINKS } from "@/lib/data";

/**
 * Responsive mobile navigation. A hamburger shown only `< md` (exactly where the
 * desktop nav is hidden) that opens a full-width panel dropping down under the
 * sticky header (the panel is `absolute top-full` relative to the positioned
 * <header>). The panel holds the nav links + phone. Closes on link tap, outside
 * click, and Escape; locks body scroll while open.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/20"
          />
          <div
            id="mobile-nav-panel"
            className="absolute inset-x-0 top-full z-50 border-b border-neutral-200 bg-white shadow-lg"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-0.5 px-4 py-3 text-sm">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-emerald-700"
                >
                  {l.label}
                </Link>
              ))}
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                onClick={() => setOpen(false)}
                className="mt-1 rounded-lg border-t border-neutral-100 px-3 pt-3.5 pb-1 font-medium text-neutral-700 transition-colors hover:text-emerald-700"
              >
                {COMPANY.phone}
              </a>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
