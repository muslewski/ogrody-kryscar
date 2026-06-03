import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep server-only packages OUT of the bundler — required at runtime from
  // node_modules instead. better-auth bundles optional DB adapters (incl. a
  // kysely sqlite dialect referencing a kysely export absent in the installed
  // version) that we never use (our DB is the custom Payload adapter); payload +
  // its adapters are likewise meant to run un-bundled. NOTE: the full Payload
  // integration will wrap this with `withPayload(...)` once the (payload) admin
  // route group exists; this list stays valid (withPayload merges it).
  serverExternalPackages: [
    "better-auth",
    "payload",
    "@payloadcms/db-postgres",
    "@payloadcms/next",
    "@payloadcms/richtext-lexical",
  ],
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

export default nextConfig;
