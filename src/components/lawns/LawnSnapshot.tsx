"use client";

import { useState } from "react";
import { MapPinOff } from "lucide-react";

import { buildStaticMapUrl } from "@/lib/maps";
import type { LawnPoint } from "@/lib/lawn-types";

/** Shared graceful placeholder: a map icon instead of a broken-image glyph. */
function MapUnavailable() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-emerald-900/5 text-emerald-700/40">
      <MapPinOff className="h-7 w-7" strokeWidth={1.5} aria-hidden />
      <span className="text-[11px] font-medium text-neutral-400">
        Podgląd mapy niedostępny
      </span>
    </div>
  );
}

/**
 * Shared Static-Maps snapshot of a lawn: the emerald outline + red building
 * overlays over hybrid imagery. Rendered by the lawn card, the order-page header
 * and the gardener triage card so they never drift.
 *
 * Falls back to a map icon (not a broken-image glyph) in two cases:
 *  - no snapshot URL (missing key, fewer than 3 vertices, or polygon data lost in
 *    a migration), and
 *  - the <img> fails to load at runtime (key revoked, quota, network) — caught via
 *    onError, which is why this is a client component.
 */
export function LawnSnapshot({
  polygon,
  buildings,
  alt,
  width = 480,
  height = 220,
  className,
}: {
  polygon: LawnPoint[];
  buildings: LawnPoint[][];
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = buildStaticMapUrl(polygon, { width, height, buildings });

  if (!url || failed) return <MapUnavailable />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}
