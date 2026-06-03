"use client";

import { COMPANY } from "@/lib/data";
import { useIsScrolled } from "@/components/use-is-scrolled";

const palette = {
  cream: "#f5efe1",
  moss: "#5b6b3f",
  ink: "#2a2a23",
};

export function Ex6Nav() {
  const scrolled = useIsScrolled(8);
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className={[
            "mx-auto flex max-w-7xl items-center justify-between gap-3 transition-[background-color,backdrop-filter,border-color,box-shadow,padding] duration-300 ease-out",
            "rounded-full px-4 sm:px-6",
            scrolled ? "py-2.5 backdrop-blur-md sm:py-3" : "py-3 sm:py-4",
          ].join(" ")}
          style={{
            background: scrolled ? palette.cream + "e6" : "transparent",
            borderColor: scrolled ? palette.ink + "15" : "transparent",
            borderWidth: 1,
            borderStyle: "solid",
            boxShadow: scrolled
              ? "0 8px 30px -12px rgba(42,42,35,0.18)"
              : undefined,
          }}
        >
          <a href="#" className="flex items-center gap-2.5 sm:gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-full text-lg"
              style={{ background: palette.moss, color: palette.cream }}
            >
              <span className="font-[family-name:var(--font-fraunces)] italic">
                k
              </span>
            </span>
            <span
              className="font-[family-name:var(--font-fraunces)] text-base sm:text-lg"
              style={{ color: palette.ink }}
            >
              {COMPANY.name}
            </span>
          </a>
          <nav
            className="hidden gap-8 text-sm md:flex"
            style={{ color: palette.ink }}
          >
            <a href="#uslugi" className="hover:underline">Co robimy</a>
            <a href="#opowiesc" className="hover:underline">Opowieść</a>
            <a href="#proces" className="hover:underline">Proces</a>
            <a href="#faq" className="hover:underline">FAQ</a>
            <a href="#kontakt" className="hover:underline">Kontakt</a>
          </nav>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="shrink-0 rounded-full px-4 py-2 text-sm transition sm:px-5"
            style={{ background: palette.moss, color: palette.cream }}
          >
            Zadzwoń
          </a>
        </div>
      </div>
    </header>
  );
}
