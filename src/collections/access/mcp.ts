import type { Access } from "payload";

/**
 * Allow ONLY the Payload MCP plugin's API-key principal; everyone else denied.
 *
 * @payloadcms/plugin-mcp authenticates each /api/mcp request by resolving the
 * Bearer API key to its `payload-mcp-api-keys` row, then runs every CRUD call
 * with `overrideAccess: false` and a `user` whose `.collection` is the plugin's
 * `userCollection` — which we pin to `admins` (the /admin superadmin collection)
 * in payload.config.ts. So an authenticated MCP request reaches these access
 * functions exactly as `req.user.collection === "admins"`.
 *
 * This is the SAME privileged principal that already sees these collections in
 * /admin (see Users.ts `adminOnlyAccess`); it is NEVER a Better Auth customer
 * (`users`). The data-layer ownership boundary is unaffected — customer reads
 * still go through the owner-scoped Local API in src/lib/{lawns,requests,visits}.ts,
 * never through here. See kryscar-mind/map/decisions/mcp-principal-is-admins.md.
 */
const MCP_KEYS_SLUG = "admins";

export const mcpOnly: Access = ({ req }) => req.user?.collection === MCP_KEYS_SLUG;
