import type { Metadata } from "next";

import "../globals.css";

/**
 * Root layout for the authenticated app group: /sign-in, /sign-up, /panel,
 * /zespol. UNGATED on purpose — it only provides <html>/<body> + the shared
 * Tailwind stylesheet so the auth screens are reachable without a session. The
 * actual gates live in the nested panel/zespol layouts. noindex — this area is
 * private and must never be crawled.
 */
export const metadata: Metadata = {
  title: { template: "%s · Ogrody Kryscar", default: "Ogrody Kryscar" },
  robots: { index: false, follow: false },
};

export default function AppRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-white text-neutral-900">{children}</body>
    </html>
  );
}
