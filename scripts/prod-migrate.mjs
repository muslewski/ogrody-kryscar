// Production migration step for the Vercel build (runs before `next build`).
//
// Two jobs beyond plain `payload migrate`:
//  1. Clear the dev-push marker. When a DB was created via Payload schema-push
//     (as prod was), payload_migrations holds a `batch = -1` row. `payload
//     migrate` then shows an interactive "you've run in dev mode… data loss"
//     prompt, which in CI (no TTY) auto-cancels and SILENTLY SKIPS the
//     migration. Deleting that one marker row is equivalent to answering "yes"
//     (the adapter filters batch === -1 anyway) and lets migrate proceed.
//  2. Verify the migration actually applied, and fail the build if it didn't —
//     so prod is never promoted on a stale schema.
//
// Skipped entirely on preview deployments (a preview on a fresh DB has no base
// tables for the additive migration). See decision prod-migrations.
import { execSync } from "node:child_process";

const DELTA = "20260610_174309"; // the committed migration that must end up applied
const uri = process.env.DATABASE_URI;

if (process.env.VERCEL_ENV === "preview") {
  console.log("prod-migrate: VERCEL_ENV=preview — skipping migrate.");
  process.exit(0);
}

async function withClient(fn) {
  if (!uri) {
    console.log("prod-migrate: no DATABASE_URI — skipping DB step.");
    return null;
  }
  const { Client } = await import("pg");
  const client = new Client({ connectionString: uri });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

// 1. Clear the dev-push marker so migrate won't hit the interactive prompt.
await withClient(async (client) => {
  try {
    const res = await client.query("DELETE FROM payload_migrations WHERE batch = -1");
    console.log(`prod-migrate: cleared ${res.rowCount} dev-push marker row(s).`);
  } catch (err) {
    // Table may not exist yet on a truly fresh DB — that's fine, migrate creates it.
    console.log(`prod-migrate: no dev-push marker to clear (${err.code ?? err.message}).`);
  }
});

// 2. Run migrations (non-interactive now). `npx` resolves the local payload bin
//    regardless of whether node_modules/.bin is on PATH.
execSync("npx payload migrate", { stdio: "inherit" });

// 3. Verify the delta landed — otherwise abort the build (don't promote a stale schema).
const applied = await withClient(async (client) => {
  const { rows } = await client.query(
    "SELECT 1 FROM payload_migrations WHERE name = $1 LIMIT 1",
    [DELTA],
  );
  return rows.length > 0;
});
if (applied === false) {
  console.error(`prod-migrate: migration ${DELTA} did NOT apply — aborting build.`);
  process.exit(1);
}
console.log(`prod-migrate: migration ${DELTA} confirmed applied.`);
