/**
 * Build the static web export from the real workspace root.
 * If the editor has locked apps/web/.next, fall back to a temporary copy.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fs.realpathSync.native(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const webDir = path.join(root, "apps", "web");
const outDir = path.join(webDir, "out");

function runNpm(args, cwd = root) {
  return spawnSync("cmd.exe", ["/d", "/s", "/c", "npm.cmd", ...args], {
    cwd,
    stdio: "inherit",
    env: process.env,
    shell: false,
    windowsVerbatimArguments: true,
  });
}

function relativePosix(from, to) {
  return path.relative(from, to).replaceAll("\\", "/");
}

function isVisualRoutePath(relative) {
  return (
    relative === "walter-visual" ||
    relative.startsWith("walter-visual/") ||
    relative.includes("/walter-visual/") ||
    relative.endsWith("/walter-visual")
  );
}

function removeVisualRoute(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relative = relativePosix(outDir, full);
    if (isVisualRoutePath(relative)) {
      fs.rmSync(full, { recursive: true, force: true });
      continue;
    }
    if (entry.isDirectory()) removeVisualRoute(full);
  }
}

function copyOut(fromDir) {
  const from = path.join(fromDir, "out");
  if (!fs.existsSync(from)) {
    throw new Error("Next.js static export did not produce an out/ directory");
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.cpSync(from, outDir, { recursive: true, force: true });
  removeVisualRoute(outDir);
}

const nextCache = path.join(webDir, ".next");
if (!fs.existsSync(nextCache)) {
  const inPlace = runNpm(["run", "build", "--workspace=@ats/web"]);
  if (inPlace.status === 0) {
    process.exit(0);
  }
}

console.warn("apps/web/.next is present; building from a temporary copy so a locked cache cannot block the static export.");

const tmp = path.join(root, "apps", ".tmp-web-build");
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
const skip = new Set([".next", ".next-build", "out", "node_modules", ".tmp-web-build"]);

fs.cpSync(webDir, tmp, {
  recursive: true,
  filter: (source) => {
    const rel = path.relative(webDir, source);
    if (!rel || rel === ".") return true;
    return !rel.split(path.sep).some((part) => skip.has(part));
  },
});

execFileSync("cmd.exe", ["/c", "mklink", "/J", path.join(tmp, "node_modules"), path.join(root, "node_modules")], {
  stdio: "pipe",
});

const isolated = spawnSync(
  "cmd.exe",
  ["/d", "/s", "/c", "npx.cmd", "--no-install", "next", "build", "--webpack"],
  {
    cwd: tmp,
    stdio: "inherit",
    env: process.env,
    shell: false,
    windowsVerbatimArguments: true,
  },
);

try {
  if (isolated.status !== 0) {
    process.exit(isolated.status ?? 1);
  }
  copyOut(tmp);
} finally {
  try {
    execFileSync("cmd.exe", ["/c", "rmdir", path.join(tmp, "node_modules")], { stdio: "pipe" });
  } catch {
    // Ignore junction removal failures; temp cleanup still proceeds.
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}
