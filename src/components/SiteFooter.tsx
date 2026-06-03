import Image from "next/image";
import Link from "next/link";
import { COMPANY, SERVICES, ADDRESS, LEGAL_LINKS } from "@/lib/data";
import { Socials } from "@/components/Socials";

export function SiteFooter() {
  return (
    /* FOOTER — catalog */
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt={`${COMPANY.name} logo`}
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg"
              />
              <span className="text-base font-semibold tracking-tight">{COMPANY.name}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600">
              Katalog usług ogrodniczych dla Bydgoszczy i województwa
              Kujawsko-Pomorskiego. Wybierz pakiet, my dojeżdżamy.
            </p>
            <Socials className="mt-6 text-neutral-700" variant="outline" />
          </div>

          {/* Katalog */}
          <div className="lg:col-span-3">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Katalog</p>
            <ul className="mt-5 space-y-2.5 text-sm text-neutral-700">
              {SERVICES.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <Link href={`/#${s.slug}`} className="underline-offset-4 hover:text-emerald-700 hover:underline">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Firma */}
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Firma</p>
            <ul className="mt-5 space-y-2.5 text-sm text-neutral-700">
              <li><Link href="/realizacje" className="underline-offset-4 hover:text-emerald-700 hover:underline">Realizacje</Link></li>
              <li><Link href="/#zespol" className="underline-offset-4 hover:text-emerald-700 hover:underline">Zespół</Link></li>
              <li><Link href="/#proces" className="underline-offset-4 hover:text-emerald-700 hover:underline">Jak to działa</Link></li>
              <li><Link href="/#opinie" className="underline-offset-4 hover:text-emerald-700 hover:underline">Opinie</Link></li>
              <li><Link href="/#faq" className="underline-offset-4 hover:text-emerald-700 hover:underline">FAQ</Link></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div className="lg:col-span-3">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Kontakt</p>
            <address className="mt-5 space-y-3 text-sm not-italic">
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="block rounded-2xl bg-neutral-900 px-4 py-3 text-white transition hover:bg-emerald-700"
              >
                <span className="text-xs uppercase tracking-wider text-neutral-400">Telefon</span>
                <span className="mt-1 block text-lg font-semibold">{COMPANY.phone}</span>
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="block rounded-2xl border border-neutral-200 px-4 py-3 transition hover:border-emerald-700"
              >
                <span className="text-xs uppercase tracking-wider text-neutral-500">E-mail</span>
                <span className="mt-1 block text-sm font-semibold text-neutral-900">{COMPANY.email}</span>
              </a>
              <p className="px-1 text-xs text-neutral-500">
                {ADDRESS.fullLine}
                <br />
                {ADDRESS.hours}
              </p>
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {ADDRESS.legalName} · NIP {ADDRESS.nip}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-neutral-900 hover:underline">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
