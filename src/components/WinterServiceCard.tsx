// src/components/WinterServiceCard.tsx
import Link from "next/link";
import { Snowflake, Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";
import type { WinterService } from "@/lib/winter";

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
  return (
    <Link
      href={`/zima/${service.slug}`}
      className={`group flex h-full flex-col rounded-3xl border p-6 transition-colors sm:p-7 ${
        dark
          ? "border-emerald-700/40 bg-emerald-800/40 hover:bg-emerald-800/70"
          : "border-neutral-200 bg-white hover:border-emerald-700"
      }`}
    >
      <span
        className={`grid h-12 w-12 place-items-center rounded-2xl ${
          dark ? "bg-emerald-50/10 text-emerald-200" : "bg-emerald-50 text-emerald-700"
        }`}
      >
        <WinterServiceIcon icon={service.icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{service.name}</h3>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          dark ? "text-emerald-100/80" : "text-neutral-600"
        }`}
      >
        {service.tagline}
      </p>
      <span
        className={`mt-auto pt-5 text-sm font-medium ${
          dark ? "text-emerald-200" : "text-emerald-700"
        }`}
      >
        Dowiedz się więcej →
      </span>
    </Link>
  );
}
