import type { CollectionConfig } from "payload";

import { assignDefaultTenant } from "./hooks/assign-default-tenant";

/**
 * A scheduled visit fulfilling a service-request. Single dated appointment
 * (recurrence is manual — the gardener schedules the next one). Owner-scoped
 * reads + team writes are enforced in src/lib/visits.ts / src/lib/team.ts
 * (the Local API runs as admin via the Better Auth adapter), NOT here — access
 * is fully closed. `customer`/`lawn` are denormalized from the request so the
 * agenda and the customer's "najbliższe wizyty" query cheaply.
 */
export const Visits: CollectionConfig = {
  slug: "visits",
  admin: {
    useAsTitle: "scheduledAt",
    group: "Klienci",
    defaultColumns: ["scheduledAt", "status", "lawn", "customer", "assignee"],
  },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "request", type: "relationship", relationTo: "service-requests", required: true, index: true },
    { name: "lawn", type: "relationship", relationTo: "lawns", required: true },
    { name: "customer", type: "relationship", relationTo: "users", required: true, index: true },
    { name: "scheduledAt", type: "date", required: true, index: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "assignee", type: "relationship", relationTo: "users" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "planned",
      options: ["planned", "done", "cancelled"],
    },
    { name: "note", type: "textarea" },
    { name: "tenant", type: "relationship", relationTo: "tenants", required: true },
  ],
  hooks: { beforeChange: [assignDefaultTenant] },
  timestamps: true,
};
