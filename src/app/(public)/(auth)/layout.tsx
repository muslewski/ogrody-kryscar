import type { Metadata } from "next";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BlurImage } from "@/components/BlurImage";
import { IMG } from "@/lib/data";

/**
 * Chrome for the auth SCREENS. They now live in the (public) group so they get
 * the marketing root layout (brand fonts, legacy-browser check). This nested
 * layout wraps them with SiteHeader + a split hero (lawnSuburb photo + form) +
 * SiteFooter. noindex — auth pages must never be crawled.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="grid md:min-h-[78vh] md:grid-cols-2">
        <div className="relative hidden md:block">
          <BlurImage
            src={IMG.lawnSuburb}
            alt=""
            fill
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/25 to-emerald-950/80" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="text-3xl font-semibold leading-tight tracking-tight">
              Twój ogród,
              <br />
              pod kontrolą.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-emerald-50/90">
              Dodaj swój trawnik, wybierz usługi i śledź wizyty — wszystko w
              jednym panelu.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center px-6 py-14">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
