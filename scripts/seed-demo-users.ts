/**
 * Seed two DEMO login accounts so you can preview the authenticated areas:
 *   - a CUSTOMER  (role: customer) → lands on /panel
 *   - a GARDENER  (role: gardener) → lands on /zespol  (Kryscar team member)
 *
 * Creates them through Better Auth's server API (proper password hashing →
 * hashed credential lives on the `accounts` collection) and assigns the role
 * via the Payload Local API (which overrides the admin-only field access).
 * Tenant = Kryscar is assigned by the users beforeChange hook on create.
 *
 * Idempotent: re-running RESETS the password for an existing demo user so the
 * printed credentials always work. Prints the credentials at the end.
 *
 * Run (env loaded from .env — same Neon DB production uses):
 *   npx tsx --env-file=.env scripts/seed-demo-users.ts
 */
import { randomBytes } from "node:crypto";

import { getPayload } from "payload";

import config from "../src/payload.config";
import { auth } from "../src/lib/auth";

type Role = "customer" | "gardener";

const DEMO: {
  label: string;
  name: string;
  email: string;
  role: Role;
  pwPrefix: string;
}[] = [
  {
    label: "KLIENT  (customer → /panel)",
    name: "Demo Klient",
    email: "demo.klient@kryscar.pl",
    role: "customer",
    pwPrefix: "Klient",
  },
  {
    label: "ZESPÓŁ  (gardener → /zespol)",
    name: "Demo Ogrodnik",
    email: "demo.ogrodnik@kryscar.pl",
    role: "gardener",
    pwPrefix: "Zespol",
  },
];

// readable, policy-safe (>=8 chars, has upper+lower+digit)
function genPassword(prefix: string): string {
  return `${prefix}-${randomBytes(3).toString("hex")}-Kx9`;
}

async function main() {
  const payload = await getPayload({ config });
  const ctx = await auth.$context; // Better Auth internal ctx → password hasher

  // Ensure the single Kryscar tenant exists (the users hook needs it).
  const tenant = await payload.find({
    collection: "tenants",
    where: { slug: { equals: "kryscar" } },
    limit: 1,
    depth: 0,
  });
  if (!tenant.docs[0]) {
    await payload.create({
      collection: "tenants",
      data: { name: "Ogrody Kryscar", slug: "kryscar" },
    });
    payload.logger.info("Seeded Kryscar tenant");
  }

  const out: {
    label: string;
    email: string;
    password: string;
    role: Role;
    status: string;
  }[] = [];

  for (const d of DEMO) {
    const password = genPassword(d.pwPrefix);

    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: d.email } },
      limit: 1,
      depth: 0,
    });

    let status: string;
    if (!existing.docs[0]) {
      await auth.api.signUpEmail({
        body: { email: d.email, password, name: d.name },
      });
      status = "created";
    } else {
      // Reset the credential password so the printed value works on re-run.
      const hash = await ctx.password.hash(password);
      const acct = await payload.find({
        collection: "accounts",
        where: {
          and: [
            { userId: { equals: existing.docs[0].id } },
            { providerId: { equals: "credential" } },
          ],
        },
        limit: 1,
        depth: 0,
      });
      if (acct.docs[0]) {
        await payload.update({
          collection: "accounts",
          id: acct.docs[0].id,
          data: { password: hash },
          overrideAccess: true,
        });
        status = "existed → password reset";
      } else {
        status = "existed (no credential account — try a fresh email)";
      }
    }

    // Ensure the role (gardener needs promoting; customer is the default).
    const { docs } = await payload.find({
      collection: "users",
      where: { email: { equals: d.email } },
      limit: 1,
      depth: 0,
    });
    const user = docs[0];
    if (user && user.role !== d.role) {
      await payload.update({
        collection: "users",
        id: user.id,
        data: { role: d.role },
        overrideAccess: true,
      });
    }

    out.push({ label: d.label, email: d.email, password, role: d.role, status });
  }

  console.log("\n=================  DEMO ACCOUNTS  =================");
  for (const o of out) {
    console.log(`\n${o.label}`);
    console.log(`  email:    ${o.email}`);
    console.log(`  password: ${o.password}`);
    console.log(`  status:   ${o.status}`);
  }
  console.log("\n==================================================\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Demo seed failed:", err);
  process.exit(1);
});
