import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/data";
import { isWinterNow } from "@/lib/season";

/**
 * The single, canonical site header — used on the homepage AND every subpage.
 * Section links are root-relative (`/#...`) so they work from any page (jump
 * to the homepage section), matching SiteFooter. The seasonal winter banner is
 * rendered here too, so it appears site-wide; pages that render SiteHeader set
 * `revalidate = 86400` so the winter toggle flips without a redeploy.
 */
export function SiteHeader() {
  const winter = isWinterNow();
  return (
    <>
      {winter && (
        <Link
          href="/zima"
          className="block bg-emerald-900 px-4 py-2 text-center text-sm text-emerald-50 transition-colors hover:bg-emerald-800"
        >
          ❄ Sezon zimowy — odśnieżanie, świąteczne oświetlenie i zabezpieczanie roślin{" "}
          <span className="font-semibold underline underline-offset-2">Zobacz →</span>
        </Link>
      )}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt={`${COMPANY.name} logo`}
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg"
            />
            <span className="font-semibold tracking-tight">{COMPANY.name}</span>
          </Link>
          <nav className="hidden gap-7 text-sm text-neutral-700 md:flex">
            <Link href="/#katalog" className="hover:text-emerald-700">Katalog</Link>
            <Link href="/realizacje" className="hover:text-emerald-700">Realizacje</Link>
            <Link href="/zima" className="hover:text-emerald-700">Zima</Link>
            <Link href="/ogrodowe-abc" className="hover:text-emerald-700">Ogrodowe ABC</Link>
            <Link href="/#proces" className="hover:text-emerald-700">Jak to działa</Link>
            <Link href="/#opinie" className="hover:text-emerald-700">Opinie</Link>
            <Link href="/#kontakt" className="hover:text-emerald-700">Kontakt</Link>
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="hidden text-sm text-neutral-700 hover:text-emerald-700 md:block"
            >
              {COMPANY.phone}
            </a>
            <Link
              href="/#kontakt"
              className="rounded-full bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 sm:px-4 sm:text-sm"
            >
              <span className="sm:hidden">Wycena</span>
              <span className="hidden sm:inline">Zamów wycenę</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
