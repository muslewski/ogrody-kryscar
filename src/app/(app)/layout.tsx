import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import "../globals.css";

/**
 * Root layout for the authenticated app group: /panel, /zespol (the auth
 * SCREENS now live under (public)/(auth)). UNGATED on purpose — provides
 * <html>/<body> + the Tailwind stylesheet + brand UI fonts. The real gates live
 * in the nested panel/zespol layouts. noindex — private, never crawled.
 */
const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: { template: "%s · Ogrody Kryscar", default: "Ogrody Kryscar" },
  robots: { index: false, follow: false },
};

export default function AppRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className="h-full antialiased" suppressHydrationWarning>
      <body
        className={`${inter.className} ${manrope.variable} min-h-full bg-white text-neutral-900`}
      >
        {children}
      </body>
    </html>
  );
}
