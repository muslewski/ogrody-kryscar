"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SERVICES, CATEGORIES } from "@/lib/data";
import { HoverCard } from "@/components/motion";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";

type Service = (typeof SERVICES)[number];
export type CatalogItem = Service & {
  img: string;
  from: string;
  duration: string;
};

export function ServiceCatalog({ services }: { services: CatalogItem[] }) {
  const [active, setActive] = useState<string>("all");
  const shown =
    active === "all"
      ? services
      : services.filter((s) => s.category === active);

  return (
    <>
      {/* Filter bar */}
      <div className="border-y border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-3 sm:px-6">
          <span className="shrink-0 text-xs uppercase tracking-widest text-neutral-500">
            Kategoria:
          </span>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
                active === c.id
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
              }`}
            >
              {c.label}
            </button>
          ))}
          <span className="ml-auto hidden shrink-0 text-xs text-neutral-500 md:inline">
            {shown.length} usług dostępnych
          </span>
        </div>
      </div>

      {/* CATALOG */}
      <section
        id="katalog"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12"
      >
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {shown.map((s, i) => {
              const num = services.findIndex((x) => x.slug === s.slug) + 1;
              return (
                <motion.article
                  key={s.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    layout: { type: "spring", stiffness: 260, damping: 30 },
                    duration: 0.3,
                    delay: i * 0.03,
                  }}
                  className="h-full"
                >
                  {/* HoverCard owns the lift + shadow as a motion gesture
                      (touch-filtered, spring) so it can't stick/flicker on
                      mobile. `group` stays for the child group-hover effects. */}
                  <HoverCard className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                      <WarpedHoverImage
                        src={s.img}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      {s.slug === "pielegnacja" && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-emerald-700 px-3 py-1 text-xs font-medium text-white">
                          Najpopularniejsze
                        </span>
                      )}
                      {s.slug === "aranzacja" && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-amber-400 px-3 py-1 text-xs font-medium text-neutral-900">
                          Projekt + realizacja
                        </span>
                      )}
                      <span className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
                        0{num}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg font-semibold leading-tight tracking-tight">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                        {s.short}
                      </p>
                      <div className="mt-5 flex items-end justify-between border-t border-neutral-100 pt-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-neutral-500">
                            {s.duration}
                          </p>
                          <p className="text-lg font-semibold tracking-tight">
                            {s.from}
                          </p>
                        </div>
                        <a
                          href="#kontakt"
                          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white transition-colors group-hover:bg-emerald-700"
                        >
                          Zamów →
                        </a>
                      </div>
                    </div>
                  </HoverCard>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
