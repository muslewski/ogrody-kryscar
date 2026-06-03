import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt={`${COMPANY.name} logo`}
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg"
          />
          <span className="text-base font-semibold tracking-tight">
            {COMPANY.name}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/#katalog"
            className="hidden text-sm font-medium text-neutral-700 transition-colors hover:text-emerald-700 sm:block"
          >
            Usługi
          </Link>
          <Link
            href="/zima"
            className="hidden text-sm font-medium text-neutral-700 transition-colors hover:text-emerald-700 sm:block"
          >
            Zima
          </Link>
          <Link
            href="/ogrodowe-abc"
            className="hidden text-sm font-medium text-neutral-700 transition-colors hover:text-emerald-700 sm:block"
          >
            Ogrodowe ABC
          </Link>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            {COMPANY.phone}
          </a>
        </div>
      </div>
    </header>
  );
}
