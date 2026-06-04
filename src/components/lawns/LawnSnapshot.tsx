import { buildStaticMapUrl } from "@/lib/maps";
import type { LawnPoint } from "@/lib/lawn-types";

/**
 * Shared Static-Maps snapshot of a lawn: the emerald outline + red building
 * overlays over hybrid imagery. Rendered by the lawn card and the order-page
 * header so they never drift. Falls back to a neutral note when there's no
 * snapshot URL (missing key / fewer than 3 vertices).
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
  const url = buildStaticMapUrl(polygon, { width, height, buildings });
  if (!url) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        Podgląd mapy niedostępny
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className={className} />
  );
}
