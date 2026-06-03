import type { CollectionConfig } from "payload";

/**
 * Payload's OWN admin auth collection — the superadmin / dev user that can log
 * into `/admin`. This stays devs-only.
 *
 * NOTE: Customer-facing auth is intentionally NOT handled here. That arrives in
 * a later slice via Better Auth. Do not add customer auth to this collection.
 */
export const Admins: CollectionConfig = {
  slug: "admins",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  fields: [
    // `email` and `password` are added automatically because `auth: true`.
  ],
};
