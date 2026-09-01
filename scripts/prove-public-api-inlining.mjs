/**
 * Temporary static-export proof that NEXT_PUBLIC_API_BASE_URL is inlined.
 * Builds a disposable copy; does not replace apps/web/out.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fs.realpathSync.native(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const webDir = path.join(root, "apps", "web");
const tmp = path.join(root, "apps", ".tmp-inlining-proof");
const SENTINEL_ORIGIN = "https://api.example.test";
const DEST = path.join(root, "project", "visual-checks", "prompt-12");

function collectFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, files);
    else files.push(full);
  }
  return files;
}

function copyWeb() {
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const skip = new Set([".next", ".next-build", "out", "node_modules", ".tmp-web-build", ".tmp-inlining-proof"]);
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
}

function buildTemp() {
  const result = spawnSync("cmd.exe", ["/d", "/s", "/c", "npx.cmd", "--no-install", "next", "build", "--webpack"], {
    cwd: tmp,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_API_BASE_URL: SENTINEL_ORIGIN,
      NEXT_PUBLIC_NEON_AUTH_BASE_URL: "",
    },
    shell: false,
    windowsVerbatimArguments: true,
  });
  if (result.status !== 0) {
    throw new Error("Temporary Next.js build failed");
  }
}

function assertBundleContainsOrigin() {
  const outDir = path.join(tmp, "out");
  const files = collectFiles(path.join(outDir, "_next"));
  const hits = files.filter((file) => {
    if (!file.endsWith(".js")) return false;
    return fs.readFileSync(file, "utf8").includes(SENTINEL_ORIGIN);
  });
  if (hits.length === 0) {
    throw new Error("Browser bundle does not contain the sentinel API origin");
  }
  return hits.map((file) => path.relative(outDir, file).replaceAll("\\", "/"));
}

function runPython(script) {
  const candidates = [
    ["python", script],
    ["python3", script],
    ["py", "-3", script],
  ];
  let last = null;
  for (const args of candidates) {
    const result = spawnSync(args[0], args.slice(1), {
      cwd: root,
      encoding: "utf8",
      shell: false,
    });
    last = result;
    if (result.error) {
      console.error(`failed to spawn ${args[0]}:`, result.error.message);
      continue;
    }
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status === 0) return JSON.parse(fs.readFileSync(path.join(DEST, "inlining-intercept.json"), "utf8"));
  }
  throw new Error(
    `Chrome intercept of the temporary export failed (${last?.status ?? "no-python"}): ${last?.stderr || last?.error?.message || ""}`,
  );
}

function interceptContact() {
  return runPython(path.join(root, "scripts", "prove-public-api-inlining-chrome.py"));
}

function cleanup() {
  try {
    execFileSync("cmd.exe", ["/c", "rmdir", path.join(tmp, "node_modules")], { stdio: "pipe" });
  } catch {
    // Junction removal can fail if already gone.
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

const evidence = {
  sentinelOrigin: SENTINEL_ORIGIN,
  bundleFiles: [],
  intercept: null,
  officialOutUntouched: true,
};

try {
  fs.mkdirSync(DEST, { recursive: true });
  copyWeb();
  buildTemp();
  evidence.bundleFiles = assertBundleContainsOrigin();
  fs.writeFileSync(path.join(DEST, "inlining-bundle.json"), JSON.stringify({ sentinelOrigin: SENTINEL_ORIGIN, bundleFiles: evidence.bundleFiles }, null, 2));
  evidence.intercept = interceptContact();
  if (!evidence.intercept.hitExactInquiries) {
    throw new Error("Contact submission did not request https://api.example.test/inquiries");
  }
  fs.writeFileSync(path.join(DEST, "inlining-proof.json"), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  cleanup();
}
