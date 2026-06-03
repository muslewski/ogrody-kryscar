import type { CollectionConfig } from "payload";

/**
 * A gardening company = a tenant.
 *
 * Single-tenant MVP: exactly one row (Ogrody Kryscar), seeded by scripts/seed.ts.
 * This is a PLAIN Payload collection — intentionally NOT the Better Auth
 * `organization` plugin nor `@payloadcms/plugin-multi-tenant`. It is the
 * structural tenancy seam: `users.tenant` points here, domain rows (later
 * slices) carry `tenant` from birth, and access control is written tenant-aware.
 * Shaped so it can later become the BA `organization` / multi-tenant tenant
 * collection when partner gardeners are onboarded (see the foundation spec —
 * "deferred machinery").
 */
export const Tenants: CollectionConfig = {
  slug: "tenants",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "contactEmail", type: "email" },
  ],
  timestamps: true,
};
