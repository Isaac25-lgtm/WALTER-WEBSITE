/**
 * Remove regenerable install/build artefacts. Workspace junctions under
 * node_modules/@ats are unlinked without following them.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const declaredRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = fs.realpathSync.native(declaredRoot);
const expected = fs.realpathSync.native(path.normalize("F:\\MY FILES\\DATA SCIENCE\\WALTER'S WEBSITE"));

function samePath(a, b) {
  return path.normalize(a).toLowerCase() === path.normalize(b).toLowerCase();
}

if (!samePath(root, expected)) {
  throw new Error(`Refusing to clean: workspace is ${root}, expected ${expected}`);
}

function assertInsideRoot(target) {
  const resolved = path.resolve(target);
  const rel = path.relative(root, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Refusing to remove path outside workspace: ${resolved}`);
  }
  return resolved;
}

function unlinkJunction(linkPath) {
  const target = assertInsideRoot(linkPath);
  if (!fs.existsSync(target)) return;
  execFileSync("cmd.exe", ["/c", "rmdir", target], { stdio: "pipe" });
}

function unlinkAtsJunctions(nodeModulesDir) {
  const atsDir = path.join(nodeModulesDir, "@ats");
  if (!fs.existsSync(atsDir)) return;
  for (const name of fs.readdirSync(atsDir)) {
    unlinkJunction(path.join(atsDir, name));
  }
}

const workspaceNodeModules = [
  path.join(root, "node_modules"),
  path.join(root, "apps", "web", "node_modules"),
];

for (const dir of workspaceNodeModules) {
  if (fs.existsSync(dir)) unlinkAtsJunctions(dir);
}

function removeDir(dir) {
  const target = assertInsideRoot(dir);
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
}

for (const dir of workspaceNodeModules) {
  removeDir(dir);
}

removeDir(path.join(root, "apps", "web", ".next"));
removeDir(path.join(root, "apps", "web", ".next-build"));
removeDir(path.join(root, "apps", "web", "out"));

function removeTsbuildinfo(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "context" || entry.name === ".next" || entry.name === "out" || entry.name === "dist") {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) removeTsbuildinfo(full);
    else if (entry.name.endsWith(".tsbuildinfo")) {
      assertInsideRoot(full);
      fs.rmSync(full, { force: true });
    }
  }
}

removeTsbuildinfo(root);

const lock = path.join(root, "package-lock.json");
if (fs.existsSync(lock)) {
  assertInsideRoot(lock);
  fs.rmSync(lock, { force: true });
}

console.log("Cleaned generated artefacts at", root);
