import type { CollectionBeforeChangeHook } from "payload";
import sharp from "sharp";

/**
 * On upload, generate a tiny base64 WebP blur placeholder (mirrors
 * scripts/gen-blur.mjs) and store it on `blurDataURL`, so next/image can render
 * placeholder="blur" for Payload media. Runs only when a new file buffer is
 * present (create or replace) — a metadata-only update keeps the existing value.
 */
export const generateBlurDataURL: CollectionBeforeChangeHook = async ({
  data,
  req,
}) => {
  const file = (req as { file?: { data?: Buffer } }).file;
  if (file?.data) {
    const buf = await sharp(file.data).resize(16).webp({ quality: 40 }).toBuffer();
    data.blurDataURL = "data:image/webp;base64," + buf.toString("base64");
  }
  return data;
};
