// src/components/BlurImage.tsx
import Image, { type ImageProps } from "next/image";
import { BLUR_DATA } from "@/lib/blur-data";

/**
 * Thin server-component wrapper over next/image: if a generated blur
 * placeholder exists for `src` (a public path under /img), render it with
 * placeholder="blur" so a blurred preview paints instantly and sharpens in.
 * Otherwise behaves exactly like a plain next/image (placeholder="empty").
 *
 * Server component on purpose — the full BLUR_DATA map stays server-side and
 * only the chosen image's tiny dataURL is serialized into the HTML.
 */
export function BlurImage({ alt, ...props }: ImageProps) {
  const blur = typeof props.src === "string" ? BLUR_DATA[props.src] : undefined;
  if (blur) {
    return <Image alt={alt} {...props} placeholder="blur" blurDataURL={blur} />;
  }
  return <Image alt={alt} {...props} />;
}

/**
 * True when `src` is a string that has a generated blur entry — i.e. the
 * image file exists on disk (gen-blur only emits keys for real files). Lets
 * callers gate an optional image so a not-yet-present file falls back to a
 * placeholder instead of rendering a broken <img> (404).
 */
export function hasBlurImage(src: string | undefined): src is string {
  return typeof src === "string" && src in BLUR_DATA;
}
