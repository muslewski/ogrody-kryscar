import type { CollectionConfig } from "payload";

import { generateBlurDataURL } from "./hooks/generate-blur";

/**
 * Uploads collection. Files are stored on Vercel Blob (configured in
 * payload.config.ts); each image gets a generated `blurDataURL` so the
 * frontend keeps its instant blur-up preview (see [[image-loading]]).
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Treść" },
  access: { read: () => true },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 768 },
    ],
  },
  fields: [
    { name: "alt", type: "text", required: true },
    {
      name: "blurDataURL",
      type: "text",
      admin: {
        readOnly: true,
        description: "Auto-generated tiny blur placeholder.",
      },
    },
  ],
  hooks: { beforeChange: [generateBlurDataURL] },
  timestamps: true,
};
