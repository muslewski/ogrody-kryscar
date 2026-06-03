import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["motion", "motion/react", "lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "pixabay.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "staticmap.openstreetmap.de" },
      { protocol: "https", hostname: "api.mapbox.com" },
    ],
  },
};

// withPayload handles bundling/aliasing for payload + its admin (incl. CSS).
// better-auth bundles cleanly given the kysely@0.28 override (see package.json).
export default withPayload(nextConfig);
