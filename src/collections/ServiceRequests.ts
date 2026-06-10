import type { CollectionConfig } from "payload";

import { assignDefaultTenant } from "./hooks/assign-default-tenant";

/**
 * A customer's service request for a lawn: a basket of configured line items + a
 * snapshot price range. Owner-scoped, but access is enforced in src/lib/requests.ts
 * (the Local API runs as admin); access here is fully closed. Multiple per lawn (a
 * history). Scheduling fields are added in 3b.2.
 */
export const ServiceRequests: CollectionConfig = {
  slug: "service-requests",
  admin: {
    useAsTitle: "id",
    group: "Klienci",
    defaultColumns: ["lawn", "status", "estMin", "estMax", "owner"],
  },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "owner", type: "relationship", relationTo: "users", required: true, index: true },
    { name: "lawn", type: "relationship", relationTo: "lawns", required: true },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "service", type: "relationship", relationTo: "services" },
        { name: "serviceSlug", type: "text", required: true },
        { name: "serviceTitle", type: "text", required: true },
        {
          name: "frequency",
          type: "select",
          options: ["jednorazowo", "co_tydzien", "co_2_tyg", "raz_w_miesiacu", "sezonowy"],
        },
        { name: "quantity", type: "number" },
        { name: "estMin", type: "number", required: true },
        { name: "estMax", type: "number", required: true },
        { name: "custom", type: "checkbox", defaultValue: false },
      ],
    },
    { name: "estMin", type: "number", required: true },
    { name: "estMax", type: "number", required: true },
    { name: "note", type: "textarea" },
    { name: "declineReason", type: "text" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: ["draft", "new", "accepted", "declined", "cancelled", "done"],
    },
    { name: "tenant", type: "relationship", relationTo: "tenants", required: true },
  ],
  hooks: { beforeChange: [assignDefaultTenant] },
  timestamps: true,
};
