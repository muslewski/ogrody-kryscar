import type { CollectionConfig } from "payload";

import { assignDefaultTenant } from "./hooks/assign-default-tenant";
import { mcpOnly } from "./access/mcp";

/**
 * A customer's lawn/property: a map pin + a drawn polygon + its computed area.
 * Owner-scoped — but access is enforced in src/lib/lawns.ts (the Local API runs
 * as admin via the Better Auth adapter), NOT here. Access is `mcpOnly`: closed to
 * every customer (BA `users`), open only to the admin principal — which is both
 * the /admin superadmin and the @payloadcms/plugin-mcp API-key principal (it
 * resolves to `collection: "admins"`). All customer reads/writes still go through
 * the owner-scoped data-access layer. `tenant` is assigned by the shared
 * beforeChange hook ([[tenancy-and-roles]]).
 */
export const Lawns: CollectionConfig = {
  slug: "lawns",
  admin: {
    useAsTitle: "name",
    group: "Klienci",
    defaultColumns: ["name", "address", "areaM2", "owner"],
  },
  access: {
    // Admin-principal only (mcpOnly). The app reaches lawns via the Local API
    // (src/lib/lawns.ts), which bypasses access control; this gate exists so the
    // MCP plugin (overrideAccess:false, admin principal) gets CRUD while every
    // customer stays denied. /admin superadmins are the same principal.
    read: mcpOnly,
    create: mcpOnly,
    update: mcpOnly,
    delete: mcpOnly,
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
    // Clipped building rings subtracted from the parcel (auto-fill). Empty for manual.
    { name: "buildings", type: "json" },
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "manual",
      options: ["manual", "auto"],
    },
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
