import type { CollectionConfig } from "payload";

/**
 * Better Auth `account` model, as a Payload-managed collection.
 *
 * Holds credential + OAuth account rows. For email/password, the hashed
 * `password` lives HERE (not on `users`) — this is the row that sign-in reads
 * back, which is exactly what broke the dead off-the-shelf adapter, so the
 * adapter's findOne path against this collection is the critical test.
 *
 * Field names mirror BA's authoritative `account` schema (see
 * `@better-auth/core` `getAuthTables()`). `userId` is a relationship to
 * `users`; the adapter queries with `depth: 0` so it stays a string id.
 */
export const Accounts: CollectionConfig = {
  slug: "accounts",
  admin: {
    useAsTitle: "accountId",
    group: "Auth (Better Auth)",
  },
  fields: [
    { name: "accountId", type: "text", required: true },
    { name: "providerId", type: "text", required: true },
    {
      name: "userId",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    { name: "accessToken", type: "text" },
    { name: "refreshToken", type: "text" },
    { name: "idToken", type: "text" },
    { name: "accessTokenExpiresAt", type: "date" },
    { name: "refreshTokenExpiresAt", type: "date" },
    { name: "scope", type: "text" },
    { name: "password", type: "text" },
  ],
  timestamps: true,
};
