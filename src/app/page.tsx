import Link from "next/link";

const examples = [
  { n: 1, name: "Minimalist Clean", note: "Sage green, generous whitespace, serif accents" },
  { n: 3, name: "Bento Magazine", note: "Asymmetric grid, editorial feel" },
  { n: 4, name: "Bold Brutalist", note: "Huge type, thick borders, raw aesthetics" },
  { n: 5, name: "Glassmorphism", note: "Frosted cards, gradient greens" },
  { n: 6, name: "Organic Natural", note: "Blob shapes, curves, earthy tones" },
  { n: 7, name: "Editorial Magazine", note: "Garamond, columns, botanical magazine" },
  { n: 8, name: "Tech SaaS", note: "Modern SaaS look, feature grid, FAQ" },
  { n: 9, name: "Vintage Botanical", note: "Sepia, IM Fell, old botanical poster" },
  { n: 10, name: "Seasonal Storytelling", note: "Year-round narrative, full-bleed imagery" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 font-[family-name:var(--font-inter)] text-neutral-900">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-700">
          Ogrody Kryscar — Design Studio
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          9 propozycji homepage&apos;a
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-600">
          Każdy projekt to oddzielna estetyka, układ i system kolorów. Otwórz
          każdy w nowej karcie i porównaj.
        </p>

        <ol className="mt-12 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
          {examples.map((e) => (
            <li key={e.n}>
              <Link
                href={`/example-${e.n}`}
                className="group flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-emerald-50"
              >
                <div className="flex items-center gap-5">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-neutral-900 text-sm font-medium text-white">
                    {String(e.n).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-lg font-medium">{e.name}</p>
                    <p className="text-sm text-neutral-500">{e.note}</p>
                  </div>
                </div>
                <span className="text-sm text-neutral-400 group-hover:text-emerald-700">
                  /example-{e.n} →
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-xs text-neutral-500">
          Zdjęcia: Pixabay. Kontakt: +48 668 994 483 ·
          kontakt@ogrody.kryscar.pl
        </p>
      </div>
    </main>
  );
}
