import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const webDir = path.join(root, "apps", "web");

const FORBIDDEN = ["Metalworks", "metalfabrication.ie", "WhatsApp", "whatsapp", "/walter"];

function collectFiles(dir: string, extensions: Set<string>, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, extensions, files);
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function isPrivateManagementSource(file: string): boolean {
  const relative = path.relative(webDir, file).replaceAll("\\", "/");
  return (
    relative.startsWith("app/walter/") ||
    relative.startsWith("app/walter-visual/") ||
    relative.startsWith("src/components/walter/") ||
    relative.startsWith("src/lib/auth/") ||
    relative === "src/styles/walter.css"
  );
}

describe("public source and export safety", () => {
  it("keeps Metalworks, WhatsApp, and /walter out of public source", () => {
    const files = [
      ...collectFiles(path.join(webDir, "app"), new Set([".tsx", ".ts", ".css"])),
      ...collectFiles(path.join(webDir, "src"), new Set([".tsx", ".ts", ".css"])),
    ].filter(
      (file) =>
        !file.endsWith("export-safety.test.ts") &&
        !file.endsWith("chrome.test.tsx") &&
        !file.endsWith("home.test.tsx") &&
        !file.endsWith("contact.test.tsx") &&
        !file.endsWith("thank-you.test.tsx") &&
        !file.endsWith("walter.test.tsx") &&
        !isPrivateManagementSource(file),
    );

    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const needle of FORBIDDEN) {
        expect(text, `${file} contains ${needle}`).not.toContain(needle);
      }
    }
  });

  it("keeps forbidden identity out of exported public HTML when the static export exists", () => {
    const outDir = path.join(webDir, "out");
    if (!existsSync(outDir)) return;
    const htmlFiles = collectFiles(outDir, new Set([".html"])).filter((file) => {
      const relative = path.relative(outDir, file).replaceAll("\\", "/");
      return !relative.startsWith("walter/");
    });
    expect(htmlFiles.length).toBeGreaterThan(0);
    for (const file of htmlFiles) {
      const text = readFileSync(file, "utf8");
      for (const needle of FORBIDDEN) {
        expect(text, `${file} contains ${needle}`).not.toContain(needle);
      }
    }
  });

  it("does not import Neon Auth Next.js middleware into the static export", () => {
    const adapter = readFileSync(path.join(webDir, "src", "lib", "auth", "create-identity-adapter.ts"), "utf8");
    expect(adapter).toContain('import("@neondatabase/auth")');
    expect(adapter).toContain("createAuthClient");
    expect(adapter).not.toContain("createInternalNeonAuth");
    expect(adapter).not.toContain("@neondatabase/auth/next");
  });
});
