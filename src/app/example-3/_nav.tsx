"use client";

import { COMPANY } from "@/lib/data";
import { useIsScrolled } from "@/components/use-is-scrolled";

export function Ex3Nav() {
  const scrolled = useIsScrolled(8);
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className={[
            "mx-auto flex max-w-[1400px] items-center justify-between gap-3 transition-[background-color,backdrop-filter,border-color,box-shadow,padding] duration-300 ease-out",
            "rounded-3xl px-4 sm:px-6",
            scrolled
              ? "border border-stone-900/10 bg-[#f5f1e8]/90 py-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md sm:py-4"
              : "border border-transparent bg-transparent py-3 sm:py-4",
          ].join(" ")}
        >
          <a href="#" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-stone-900 text-white">
              <span className="font-[family-name:var(--font-fraunces)] text-lg italic">
                k
              </span>
            </div>
            <span className="text-sm font-medium">{COMPANY.name}</span>
          </a>
          <nav className="hidden gap-2 text-sm md:flex">
            {[
              { l: "Usługi", h: "#uslugi" },
              { l: "Realizacje", h: "#realizacje" },
              { l: "FAQ", h: "#faq" },
              { l: "Kontakt", h: "#kontakt" },
            ].map((n) => (
              <a
                key={n.l}
                href={n.h}
                className="rounded-full bg-stone-900/5 px-4 py-2 hover:bg-stone-900/10"
              >
                {n.l}
              </a>
            ))}
          </nav>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="shrink-0 rounded-full bg-stone-900 px-4 py-2.5 text-xs font-medium text-white sm:px-5"
          >
            Zadzwoń
          </a>
        </div>
      </div>
    </header>
  );
}
