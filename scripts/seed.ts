/**
 * Idempotent seed: ensure the single Kryscar tenant exists.
 *
 * Run locally with env loaded (Neon `DATABASE_URI`, `PAYLOAD_SECRET`):
 *   npm run seed            (Node >= 20.6: tsx --env-file=.env scripts/seed.ts)
 *
 * Single-tenant MVP — every customer is assigned to this tenant by the
 * default-tenant hook on the `users` collection.
 */
import { getPayload } from "payload";

import config from "../src/payload.config";

async function main() {
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "tenants",
    where: { slug: { equals: "kryscar" } },
    limit: 1,
  });

  if (!existing.docs[0]) {
    await payload.create({
      collection: "tenants",
      data: { name: "Ogrody Kryscar", slug: "kryscar" },
    });
    payload.logger.info("Seeded Kryscar tenant (slug: kryscar)");
  } else {
    payload.logger.info("Kryscar tenant already exists — nothing to seed");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
