import type { Metadata } from "next";
import Script from "next/script";
import {
  Inter,
  Playfair_Display,
  Fraunces,
  Space_Grotesk,
  Cormorant_Garamond,
  Bricolage_Grotesque,
  DM_Serif_Display,
  Instrument_Serif,
  Archivo_Black,
  IM_Fell_DW_Pica,
  Newsreader,
  Manrope,
} from "next/font/google";
import { SITE_URL } from "@/lib/data";
import "../globals.css";

/**
 * Inline browser-capability check that runs BEFORE any module bundle is
 * fetched. We feature-detect two ES2020-era APIs:
 *   - Object.fromEntries (Safari 12.1+, Chrome 73+, Firefox 63+)
 *   - globalThis         (Safari 12.1+, Chrome 71+, Firefox 65+)
 *
 * If either is missing, modern bundles parse-error with "unexpected token"
 * (optional chaining / nullish coalescing / object spread). We swap the
 * body for a branded PL+EN "browser too old" notice built via DOM APIs
 * (no innerHTML / document.write — keeps the markup XSS-clean and
 * passes our security lint). The script itself is plain ES5 so it parses
 * in any legacy runtime.
 */
const LEGACY_BROWSER_CHECK = [
  "(function(){try{",
  "var ok=(typeof Object.fromEntries==='function')&&(typeof globalThis!=='undefined');",
  "if(ok)return;",
  "var d=document;",
  "while(d.body&&d.body.firstChild){d.body.removeChild(d.body.firstChild);}",
  "d.title='Ogrody Kryscar \\u2014 przegl\\u0105darka jest zbyt stara';",
  "var s=d.createElement('style');",
  "s.appendChild(d.createTextNode(",
  "'html,body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;background:#fafaf9;color:#1c1917;height:100%}'+",
  "'body{display:flex;align-items:center;justify-content:center;text-align:center;padding:24px}'+",
  "'main{max-width:480px}'+",
  "'h1{font-size:22px;margin:0 0 12px;font-weight:600;line-height:1.3}'+",
  "'p{font-size:15px;line-height:1.55;color:#57534e;margin:0 0 8px}'+",
  "'a{color:#047857;text-decoration:underline}'",
  "));",
  "(d.head||d.getElementsByTagName('head')[0]).appendChild(s);",
  "var m=d.createElement('main');",
  "var h=d.createElement('h1');",
  "h.appendChild(d.createTextNode('Twoja przegl\\u0105darka jest zbyt stara \\u00b7 Your browser is too old'));",
  "m.appendChild(h);",
  "var p1=d.createElement('p');",
  "p1.appendChild(d.createTextNode('Strona Ogrody Kryscar wymaga przegl\\u0105darki z 2019 roku lub nowszej. Zaktualizuj Safari, Chrome, Firefox lub Edge.'));",
  "m.appendChild(p1);",
  "var p2=d.createElement('p');",
  "p2.appendChild(d.createTextNode('The site needs a 2019+ browser. Please update Safari, Chrome, Firefox or Edge.'));",
  "m.appendChild(p2);",
  "var p3=d.createElement('p');p3.style.marginTop='24px';",
  "var a1=d.createElement('a');a1.href='tel:+48668994483';a1.appendChild(d.createTextNode('+48 668 994 483'));p3.appendChild(a1);",
  "p3.appendChild(d.createTextNode(' \\u00b7 '));",
  "var a2=d.createElement('a');a2.href='mailto:ogrody@kryscar.pl';a2.appendChild(d.createTextNode('ogrody@kryscar.pl'));p3.appendChild(a2);",
  "m.appendChild(p3);",
  "d.body.appendChild(m);",
  "}catch(e){}})();",
].join("");

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: ["400"],
  subsets: ["latin", "latin-ext"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: ["400"],
  subsets: ["latin", "latin-ext"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: ["400"],
  subsets: ["latin", "latin-ext"],
});

const imFell = IM_Fell_DW_Pica({
  variable: "--font-im-fell",
  weight: ["400"],
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ogrody Kryscar — Profesjonalne usługi ogrodnicze",
  description:
    "Koszenie trawników, pielęgnacja ogrodu, grabienie liści, sadzenie roślin i przycinanie krzewów. Zadbamy o Twój ogród.",
  // Emits <meta name="apple-mobile-web-app-title" content="Kryscar" />
  // (per realfavicongenerator instructions, the App Router way).
  appleWebApp: { title: "Kryscar" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={[
        inter.variable,
        manrope.variable,
        playfair.variable,
        fraunces.variable,
        spaceGrotesk.variable,
        cormorant.variable,
        bricolage.variable,
        dmSerif.variable,
        instrument.variable,
        archivoBlack.variable,
        imFell.variable,
        newsreader.variable,
        "antialiased",
      ].join(" ")}
    >
      <body className="min-h-screen">
        {/* Legacy-browser feature-detect. Runs before any bundle loads so
            ancient runtimes get a branded notice instead of a parse-error
            white screen. */}
        <Script id="legacy-browser-check" strategy="beforeInteractive">
          {LEGACY_BROWSER_CHECK}
        </Script>
        {/* Static branded fallback for browsers with JavaScript disabled. */}
        <noscript>
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            <h1 style={{ fontSize: "22px", margin: "0 0 12px" }}>
              JavaScript jest wyłączony · JavaScript is disabled
            </h1>
            <p style={{ maxWidth: "480px", margin: "0 auto 8px", color: "#57534e" }}>
              Włącz JavaScript w przeglądarce, aby zobaczyć stronę Ogrody
              Kryscar. · Please enable JavaScript to view this site.
            </p>
            <p style={{ marginTop: "16px" }}>
              <a href="tel:+48668994483" style={{ color: "#047857" }}>
                +48 668 994 483
              </a>{" "}
              ·{" "}
              <a href="mailto:ogrody@kryscar.pl" style={{ color: "#047857" }}>
                ogrody@kryscar.pl
              </a>
            </p>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
