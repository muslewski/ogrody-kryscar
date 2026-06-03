import type { CollectionConfig } from "payload";

/**
 * Better Auth `session` model, as a Payload-managed collection.
 *
 * Field names mirror BA's authoritative `session` schema (see
 * `@better-auth/core` `getAuthTables()`). `userId` is a relationship to the
 * `users` collection — BA treats it as a plain string id, so the adapter always
 * queries this collection with `depth: 0` to keep `userId` a string, not a
 * populated object.
 */
export const Sessions: CollectionConfig = {
  slug: "sessions",
  admin: {
    useAsTitle: "token",
    group: "Auth (Better Auth)",
  },
  fields: [
    { name: "expiresAt", type: "date", required: true },
    { name: "token", type: "text", required: true, unique: true, index: true },
    { name: "ipAddress", type: "text" },
    { name: "userAgent", type: "text" },
    {
      name: "userId",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    // NOTE: no `activeOrganizationId` — that is the Better Auth organization
    // plugin's field, deferred with the rest of the multi-tenant machinery. This
    // is the bare BA `session` model.
  ],
  timestamps: true,
};
