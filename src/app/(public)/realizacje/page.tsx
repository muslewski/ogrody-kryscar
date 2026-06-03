// src/app/realizacje/page.tsx
import type { Metadata } from "next";
import { COMPANY, SITE_URL } from "@/lib/data";
import { getAllProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Realizacje — metamorfozy ogrodów przed i po | Ogrody Kryscar",
  description:
    "Realizacje Ogrody Kryscar: zdjęcia przed i po aranżacji ogrodów i zakładania rabat w Bydgoszczy i okolicy. Zobacz metamorfozy, które wykonaliśmy.",
  alternates: { canonical: "/realizacje" },
};

// Daily ISR so the seasonal winter banner (SiteHeader) flips without a redeploy.
export const revalidate = 86400;

export default async function RealizacjePage() {
  const projects = await getAllProjects();

  return (
    <main className="bg-white text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Strona główna", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Realizacje", item: `${SITE_URL}/realizacje` },
            ],
          }),
        }}
      />
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Realizacje</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Metamorfozy ogrodów — przed i po
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-700">
            Wybrane ogrody, które zaprojektowaliśmy i urządziliśmy w Bydgoszczy i okolicy.
            Przesuń suwak na zdjęciach, żeby zobaczyć, jak zmieniła się przestrzeń.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 sm:p-12">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            Twój ogród może być następny.
          </h2>
          <p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">
            Aranżacja, rabaty, kompleksowe urządzenie ogrodu — zacznijmy od bezpłatnej wyceny.
          </p>
          <div className="mt-6">
            <a href={`tel:${COMPANY.phoneRaw}`} className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
              Zadzwoń: {COMPANY.phone}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
