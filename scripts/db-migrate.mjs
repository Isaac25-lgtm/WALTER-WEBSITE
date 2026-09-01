/**
 * Apply local Drizzle migrations. Requires an explicit DATABASE_URL.
 * This prompt does not run this command against Neon.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "apps", "api");
const url = typeof process.env.DATABASE_URL === "string" ? process.env.DATABASE_URL.trim() : "";

if (!url) {
  console.error("Refusing to migrate: DATABASE_URL is not set.");
  process.exit(1);
}

if (!fs.existsSync(path.join(apiRoot, "drizzle.config.ts"))) {
  console.error("Missing apps/api/drizzle.config.ts");
  process.exit(1);
}

const result = spawnSync("npx.cmd", ["--no-install", "drizzle-kit", "migrate"], {
  cwd: apiRoot,
  stdio: "inherit",
  env: process.env,
  shell: false,
});

process.exit(result.status ?? 1);
