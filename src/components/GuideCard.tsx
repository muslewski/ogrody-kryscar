// src/components/GuideCard.tsx
import Link from "next/link";
import { BlurImage } from "@/components/BlurImage";
import { SEASON_LABELS, type Guide } from "@/lib/guides";

/** Presentational card for a guide. Links to the article. */
export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/ogrodowe-abc/${guide.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-colors hover:border-emerald-700"
    >
      <div className="relative aspect-[16/9] w-full bg-neutral-100">
        <BlurImage
          src={guide.img}
          alt={guide.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-800 backdrop-blur">
          {SEASON_LABELS[guide.season]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-emerald-700">
          {guide.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
          {guide.excerpt}
        </p>
        <span className="mt-4 text-xs uppercase tracking-wider text-neutral-500">
          {guide.readMinutes} min czytania
        </span>
      </div>
    </Link>
  );
}
