/**
 * Run npm against the real workspace root. Cursor may expose a subst drive
 * letter; npm workspace discovery requires the F: path.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fs.realpathSync.native(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const expected = fs.realpathSync.native("F:\\MY FILES\\DATA SCIENCE\\WALTER'S WEBSITE");

if (root.toLowerCase() !== expected.toLowerCase()) {
  throw new Error(`Refusing to run outside workspace: ${root}`);
}

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const args = process.argv.slice(2);
if (args.length === 0) {
  throw new Error("Usage: node scripts/run-in-workspace.mjs <npm-args>");
}

const result =
  process.platform === "win32"
    ? spawnSync("cmd.exe", ["/d", "/s", "/c", npmCmd, ...args], {
        cwd: root,
        stdio: "inherit",
        env: process.env,
        shell: false,
        windowsVerbatimArguments: true,
      })
    : spawnSync(npmCmd, args, {
        cwd: root,
        stdio: "inherit",
        env: process.env,
        shell: false,
      });

if (result.error) {
  console.error(result.error);
}


process.exit(result.status ?? 1);
