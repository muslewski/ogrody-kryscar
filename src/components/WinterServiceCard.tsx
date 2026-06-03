// src/components/WinterServiceCard.tsx
import Link from "next/link";
import { Snowflake, Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";
import type { WinterService } from "@/lib/winter";
import { BlurImage, hasBlurImage } from "@/components/BlurImage";

const ICONS: Record<string, LucideIcon> = {
  snowflake: Snowflake,
  sparkles: Sparkles,
  shield: ShieldCheck,
};

export function WinterServiceIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = ICONS[icon] ?? Snowflake;
  return <Icon className={className} aria-hidden />;
}

export function WinterServiceCard({
  service,
  tone = "light",
}: {
  service: WinterService;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const shell = `group flex h-full flex-col rounded-3xl border transition-colors ${
    dark
      ? "border-emerald-700/40 bg-emerald-800/40 hover:bg-emerald-800/70"
      : "border-neutral-200 bg-white hover:border-emerald-700"
  }`;
  const tagline = dark ? "text-emerald-100/80" : "text-neutral-600";
  const cta = dark ? "text-emerald-200" : "text-emerald-700";

  if (hasBlurImage(service.image)) {
    return (
      <Link href={`/zima/${service.slug}`} className={`${shell} overflow-hidden`}>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          <BlurImage
            src={service.image}
            alt={service.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <span
            className={`absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl backdrop-blur ${
              dark ? "bg-emerald-900/60 text-emerald-100" : "bg-white/85 text-emerald-700"
            }`}
          >
            <WinterServiceIcon icon={service.icon} className="h-5 w-5" />
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <h3 className="text-lg font-semibold tracking-tight">{service.name}</h3>
          <p className={`mt-2 text-sm leading-relaxed ${tagline}`}>{service.tagline}</p>
          <span className={`mt-auto pt-5 text-sm font-medium ${cta}`}>
            Dowiedz się więcej →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/zima/${service.slug}`} className={`${shell} p-6 sm:p-7`}>
      <span
        className={`grid h-12 w-12 place-items-center rounded-2xl ${
          dark ? "bg-emerald-50/10 text-emerald-200" : "bg-emerald-50 text-emerald-700"
        }`}
      >
        <WinterServiceIcon icon={service.icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{service.name}</h3>
      <p className={`mt-2 text-sm leading-relaxed ${tagline}`}>{service.tagline}</p>
      <span className={`mt-auto pt-5 text-sm font-medium ${cta}`}>
        Dowiedz się więcej →
      </span>
    </Link>
  );
}
