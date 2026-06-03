import type { CollectionConfig } from "payload";

/**
 * Better Auth `verification` model, as a Payload-managed collection.
 *
 * Stores single-use verification values (email verification, password reset,
 * etc). Field names mirror BA's authoritative `verification` schema (see
 * `@better-auth/core` `getAuthTables()`).
 */
export const Verifications: CollectionConfig = {
  slug: "verifications",
  admin: {
    useAsTitle: "identifier",
    group: "Auth (Better Auth)",
  },
  fields: [
    { name: "identifier", type: "text", required: true, index: true },
    { name: "value", type: "text", required: true },
    { name: "expiresAt", type: "date", required: true },
  ],
  timestamps: true,
};
