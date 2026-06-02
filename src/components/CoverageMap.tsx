/**
 * Real-world static map of the Bydgoszcz / Kujawsko-Pomorskie coverage area.
 *
 * Two providers, picked automatically at render time:
 *
 *   1. Mapbox Static Images API — when `NEXT_PUBLIC_MAPBOX_TOKEN` is set in
 *      `.env.local`. Picks one of Mapbox's built-in styles per `variant`
 *      ("light", "dark", "outdoors", "satellite", "streets"). Highest
 *      quality + per-example design variety.
 *   2. staticmap.openstreetmap.de — no key needed, works out of the box for
 *      showcase / preview. Single OSM style (good enough as a fallback).
 *
 * The image is a plain `<img>` — Next will browser-cache it and the URL
 * doesn't change unless you edit `COVERAGE_CITIES`, so it's lightweight.
 *
 * The map intentionally does NOT show city labels (the labels are drawn
 * onto the underlying tiles only at higher zoom). Labels go in the
 * adjacent `CityList` so they never overlap pins on small screens.
 */

import {
  COVERAGE_CITIES,
  HEADQUARTERS,
  MAP_CENTER,
  MAP_ZOOM,
  type CoverageCity,
} from "@/lib/coverage";
import { WarpedHoverImage } from "@/components/WarpedHoverImage";

export type CoverageMapVariant =
  | "light"
  | "dark"
  | "outdoors"
  | "satellite"
  | "streets";

const MAPBOX_STYLE: Record<CoverageMapVariant, string> = {
  light: "mapbox/light-v11",
  dark: "mapbox/dark-v11",
  outdoors: "mapbox/outdoors-v12",
  satellite: "mapbox/satellite-streets-v12",
  streets: "mapbox/streets-v12",
};

export interface CoverageMapProps {
  /** Visual style. Only takes effect when a Mapbox token is present. */
  variant?: CoverageMapVariant;
  /** Aspect ratio of the rendered map image. */
  aspect?: "16/9" | "4/3" | "1/1" | "3/2" | "5/4";
  /** Pixel width hint sent to the provider (height derived from aspect). */
  width?: number;
  /** Marker hex color for non-HQ cities (no `#`). */
  pinColor?: string;
  /** Marker hex color for the HQ pin (no `#`). */
  hqColor?: string;
  /** Round the map corners with this Tailwind class. */
  rounded?: string;
  className?: string;
  /**
   * Add the WarpedHoverImage WebGL bulge on hover. Defaults to true so
   * map cards match the rest of the imagery; pass `false` to render a
   * plain `<img>` (e.g. when the surrounding chrome already implies an
   * interaction).
   */
  warp?: boolean;
  /** Override map center (defaults to MAP_CENTER from coverage.ts). */
  center?: { lat: number; lng: number };
  /** Override zoom (defaults to MAP_ZOOM). */
  zoom?: number;
  /** Image alt text. Defaults to the area-wide coverage description. */
  alt?: string;
}

function buildMapboxUrl({
  variant,
  width,
  height,
  pinColor,
  hqColor,
  center,
  zoom,
}: {
  variant: CoverageMapVariant;
  width: number;
  height: number;
  pinColor: string;
  hqColor: string;
  center: { lat: number; lng: number };
  zoom: number;
}): string | null {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;

  const style = MAPBOX_STYLE[variant];
  const markers = COVERAGE_CITIES.map((c) => {
    const isHQ = c.km === 0;
    const color = isHQ ? hqColor : pinColor;
    const pin = isHQ ? "pin-l" : "pin-s"; // large pin for HQ
    return `${pin}+${color}(${c.lng},${c.lat})`;
  }).join(",");

  const c = `${center.lng},${center.lat},${zoom},0`;
  return (
    `https://api.mapbox.com/styles/v1/${style}/static/` +
    `${markers}/${c}/${width}x${height}@2x?access_token=${token}`
  );
}

function buildOsmUrl({
  width,
  height,
  center,
  zoom,
}: {
  width: number;
  height: number;
  center: { lat: number; lng: number };
  zoom: number;
}): string {
  // staticmap.openstreetmap.de — public OSM static map service. One style
  // only (mapnik), markers limited but adequate. Pipe between markers is
  // URL-encoded as %7C.
  const markers = COVERAGE_CITIES.map((c) => {
    const isHQ = c.km === 0;
    const color = isHQ ? "ol-marker-green" : "ol-marker";
    return `${c.lat},${c.lng},${color}`;
  }).join("%7C");

  return (
    `https://staticmap.openstreetmap.de/staticmap.php` +
    `?center=${center.lat},${center.lng}` +
    `&zoom=${zoom}` +
    `&size=${width}x${height}` +
    `&maptype=mapnik` +
    `&markers=${markers}`
  );
}

const ASPECT_RATIO: Record<NonNullable<CoverageMapProps["aspect"]>, number> = {
  "16/9": 16 / 9,
  "4/3": 4 / 3,
  "1/1": 1,
  "3/2": 3 / 2,
  "5/4": 5 / 4,
};

export function CoverageMap({
  variant = "light",
  aspect = "4/3",
  width = 1200,
  pinColor = "047857",
  hqColor = "1c1917",
  rounded = "rounded-3xl",
  className,
  warp = true,
  center = MAP_CENTER,
  zoom = MAP_ZOOM,
  alt = "Mapa zasięgu — Bydgoszcz, Toruń i województwo kujawsko-pomorskie.",
}: CoverageMapProps) {
  const ratio = ASPECT_RATIO[aspect];
  const height = Math.round(width / ratio);

  const url =
    buildMapboxUrl({ variant, width, height, pinColor, hqColor, center, zoom }) ??
    buildOsmUrl({ width, height, center, zoom });

  const imgClass = [
    "block h-auto w-full select-none object-cover",
    rounded,
    className ?? "",
  ].join(" ");

  if (warp) {
    // WarpedHoverImage needs an explicit aspect on its parent so the
    // size-full Canvas wrapper has a height to fill. We replicate the
    // map image's intrinsic ratio so the layout matches the plain
    // <img> path exactly.
    return (
      <div
        className={["relative w-full overflow-hidden", rounded].join(" ")}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <WarpedHoverImage
          src={url}
          alt={alt}
          className={[
            "absolute inset-0 block h-full w-full select-none object-cover",
            className ?? "",
          ].join(" ")}
        />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={imgClass}
    />
  );
}

/**
 * Adjacent legend list — shows the city names + km from base. Use this
 * next to (or below) `CoverageMap` instead of trying to label pins on the
 * map itself (small text on map tiles always reads badly on mobile).
 */
export function CityList({
  className,
  itemClassName,
  showZip = false,
  cities = COVERAGE_CITIES,
}: {
  className?: string;
  itemClassName?: string;
  showZip?: boolean;
  cities?: CoverageCity[];
}) {
  return (
    <ul className={className}>
      {cities.map((c) => (
        <li
          key={c.name}
          className={
            itemClassName ??
            "flex items-baseline justify-between gap-3 border-b border-current/15 py-2 text-sm"
          }
        >
          <span className="font-medium">{c.name}</span>
          <span className="flex items-baseline gap-2 text-xs opacity-70 tabular-nums">
            {showZip && <span>{c.zip}</span>}
            <span>{c.km === 0 ? "baza" : `${c.km} km`}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export { HEADQUARTERS };
