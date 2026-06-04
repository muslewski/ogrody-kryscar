import type { CollectionConfig } from "payload";

import { assignDefaultTenant } from "./hooks/assign-default-tenant";

/**
 * A customer's lawn/property: a map pin + a drawn polygon + its computed area.
 * Owner-scoped — but access is enforced in src/lib/lawns.ts (the Local API runs
 * as admin via the Better Auth adapter), NOT here. `read`/`create` stay closed
 * (no public API surface); all reads/writes go through the data-access layer.
 * `tenant` is assigned by the shared beforeChange hook ([[tenancy-and-roles]]).
 */
export const Lawns: CollectionConfig = {
  slug: "lawns",
  admin: {
    useAsTitle: "name",
    group: "Klienci",
    defaultColumns: ["name", "address", "areaM2", "owner"],
  },
  access: {
    // Closed by default — the app reaches lawns only via the Local API
    // (src/lib/lawns.ts), which bypasses access control. /admin superadmins
    // still see them (admins collection auth is separate).
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    { name: "name", type: "text", required: true },
    { name: "address", type: "text", required: true },
    { name: "placeId", type: "text" },
    {
      name: "location",
      type: "group",
      fields: [
        { name: "lat", type: "number", required: true },
        { name: "lng", type: "number", required: true },
      ],
    },
    // Array of { lat, lng } vertices (>=3). Stored as JSON.
    { name: "polygon", type: "json", required: true },
    { name: "areaM2", type: "number", required: true },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
    },
  ],
  hooks: {
    beforeChange: [assignDefaultTenant],
  },
  timestamps: true,
};
