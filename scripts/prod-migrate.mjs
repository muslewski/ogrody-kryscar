// Run `payload migrate` only for production builds. Preview deployments may point
// at a fresh DB without the base tables the additive migration assumes, so skip
// there (and locally unless explicitly prod). See decision prod-migrations.
import { execSync } from "node:child_process";
const env = process.env.VERCEL_ENV; // 'production' | 'preview' | 'development' | undefined(local)
if (env === "preview") {
  console.log("prod-migrate: VERCEL_ENV=preview — skipping migrate.");
  process.exit(0);
}
execSync("payload migrate", { stdio: "inherit" });
