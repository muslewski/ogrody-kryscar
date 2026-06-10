import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { mcpPlugin } from "@payloadcms/plugin-mcp";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Admins } from "./collections/Admins";
import { Users } from "./collections/auth/Users";
import { Sessions } from "./collections/auth/Sessions";
import { Accounts } from "./collections/auth/Accounts";
import { Verifications } from "./collections/auth/Verifications";
import { Tenants } from "./collections/Tenants";
import { Media } from "./collections/Media";
import { Services } from "./collections/Services";
import { Lawns } from "./collections/Lawns";
import { ServiceRequests } from "./collections/ServiceRequests";
import { Visits } from "./collections/Visits";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // Payload's own admin panel logs in via the `admins` collection (staff / devs).
  admin: {
    user: Admins.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  // `admins` = Payload's superadmin login for /admin (unrelated to customers).
  // `users`/`sessions`/`accounts`/`verifications` ARE the Better Auth models —
  // Payload-managed; Better Auth writes to them through our custom BA -> Payload
  // Local-API adapter (src/lib/better-auth-payload-adapter.ts). `tenants` is the
  // single-tenant seam (seeded: Kryscar). NO multi-tenant plugin (deferred).
  collections: [Admins, Users, Sessions, Accounts, Verifications, Tenants, Media, Services, Lawns, ServiceRequests, Visits],
  editor: lexicalEditor(),
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: { media: true },
      // If BLOB_READ_WRITE_TOKEN is absent the plugin self-disables and falls
      // back to local disk (files lost on redeploy). Set it in ALL prod envs.
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
    // MCP server at /api/mcp. Exposes ONLY the ops collections, full CRUD, behind
    // Bearer API keys minted in /admin (MCP > API Keys, collection
    // `payload-mcp-api-keys`). Auth keys resolve to the `admins` principal
    // (userCollection below) and run with overrideAccess:false, so the closed ops
    // collections gate on `mcpOnly` (collection === "admins"); auth collections
    // (users/sessions/accounts/verifications), admins, and media are NOT listed,
    // so they have no MCP surface. See src/collections/access/mcp.ts.
    mcpPlugin({
      // API-key principal is an `admins` row — the same privileged identity that
      // sees these collections in /admin. (Default is config.admin.user = admins;
      // pinned explicitly so the access carve-out stays true if that ever changes.)
      userCollection: "admins",
      collections: {
        services: { enabled: true },
        "service-requests": { enabled: true },
        lawns: { enabled: true },
        visits: { enabled: true },
        tenants: { enabled: true },
      },
    }),
  ],
  // Read process.env directly (NOT src/lib/env.ts): this config is also loaded by
  // `payload generate:types`, where the DB/secret env may be absent.
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      // Neon pooled URI. If schema push / migrations hit pooler or
      // "prepared statement" errors, swap to process.env.DATABASE_URI_DIRECT.
      connectionString: process.env.DATABASE_URI || "",
    },
    // String UUID primary keys for every collection. Better Auth uses string ids;
    // with idType:'uuid' Postgres mints them and our adapter runs with
    // disableIdGeneration, so Payload owns id generation end to end and BA reads
    // the uuid back (incl. relation fields like account.userId).
    idType: "uuid",
  }),
  sharp,
});
