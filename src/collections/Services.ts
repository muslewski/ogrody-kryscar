import type { CollectionConfig } from "payload";

import { assignDefaultTenant } from "./hooks/assign-default-tenant";

/**
 * The service catalog as a Payload collection — one record per service. Drives
 * the live marketing catalog ([[service-catalog]]) and the /uslugi landing
 * pages ([[service-pages]]) via the async accessors in lib/catalog + lib/services.
 * `image` is a Vercel-Blob-backed media upload; `tenant` is the tenancy seam.
 */
export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "title",
    group: "Katalog",
    defaultColumns: ["title", "slug", "category", "order"],
  },
  access: { read: () => true },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "order", type: "number", required: true, defaultValue: 0 },
    { name: "title", type: "text", required: true },
    { name: "short", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Trawnik", value: "trawnik" },
        { label: "Cięcie", value: "ciecie" },
        { label: "Sadzenie", value: "sadzenie" },
        { label: "Porządki", value: "porzadki" },
        { label: "Projekt", value: "projekt" },
      ],
    },
    {
      name: "icon",
      type: "select",
      required: true,
      options: [
        "scissors",
        "leaf",
        "rake",
        "sprout",
        "hedge",
        "broom",
        "compass",
        "flowers",
      ].map((v) => ({ label: v, value: v })),
    },
    {
      name: "badge",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        {
          name: "tone",
          type: "select",
          options: [
            { label: "Emerald (primary)", value: "primary" },
            { label: "Amber (accent)", value: "accent" },
          ],
        },
      ],
    },
    { name: "priceFrom", type: "text", required: true },
    { name: "duration", type: "text", required: true },
    {
      name: "pricing",
      type: "group",
      admin: { description: "Drives the panel configurator + live estimate." },
      fields: [
        {
          name: "kind",
          type: "select",
          required: true,
          defaultValue: "custom",
          options: [
            { label: "Od powierzchni (m²)", value: "area" },
            { label: "Od jednostki (szt./mb)", value: "perUnit" },
            { label: "Stała kwota", value: "fixed" },
            { label: "Wycena indywidualna", value: "custom" },
          ],
        },
        { name: "basePrice", type: "number" },
        { name: "pricePerM2", type: "number" },
        { name: "pricePerUnit", type: "number" },
        { name: "unitLabel", type: "text" },
        { name: "recurring", type: "checkbox", defaultValue: false },
      ],
    },
    { name: "image", type: "upload", relationTo: "media", required: true },
    {
      name: "hero",
      type: "array",
      required: true,
      fields: [{ name: "paragraph", type: "textarea", required: true }],
    },
    {
      name: "includes",
      type: "array",
      required: true,
      fields: [{ name: "item", type: "text", required: true }],
    },
    { name: "pricingNote", type: "textarea", required: true },
    {
      name: "faq",
      type: "array",
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "metaTitle", type: "text" },
        { name: "metaDescription", type: "textarea" },
      ],
    },
    { name: "tenant", type: "relationship", relationTo: "tenants", required: true },
  ],
  hooks: { beforeChange: [assignDefaultTenant] },
  timestamps: true,
};
