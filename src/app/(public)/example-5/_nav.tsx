"use client";

import { COMPANY } from "@/lib/data";
import { useIsScrolled } from "@/components/use-is-scrolled";

export function Ex5Nav() {
  const scrolled = useIsScrolled(8);
  return (
    <header className="fixed inset-x-0 top-2 z-40 sm:top-4">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={[
            "flex items-center justify-between gap-3 transition-[background-color,backdrop-filter,border-color,box-shadow,padding] duration-300 ease-out",
            "rounded-full px-4 sm:px-5",
            scrolled
              ? "border border-white/60 bg-white/65 py-2.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:py-3"
              : "border border-white/40 bg-white/30 py-2.5 backdrop-blur-xl sm:py-3",
          ].join(" ")}
        >
          <a href="#" className="flex items-center gap-2.5 font-medium sm:gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-700 text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
              </svg>
            </span>
            <span className="text-sm sm:text-base">{COMPANY.name}</span>
          </a>
          <nav className="hidden gap-6 text-sm md:flex">
            {[
              { l: "Usługi", h: "#uslugi" },
              { l: "Pakiety", h: "#pakiety" },
              { l: "FAQ", h: "#faq" },
              { l: "Kontakt", h: "#kontakt" },
            ].map((n) => (
              <a key={n.l} href={n.h} className="text-emerald-900/80 hover:text-emerald-900">
                {n.l}
              </a>
            ))}
          </nav>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="shrink-0 rounded-full bg-emerald-900 px-4 py-2 text-xs font-medium text-white"
          >
            Zadzwoń
          </a>
        </div>
      </div>
    </header>
  );
}
