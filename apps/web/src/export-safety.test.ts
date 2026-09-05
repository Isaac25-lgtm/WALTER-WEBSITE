import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const webDir = path.join(root, "apps", "web");
const outDir = path.join(webDir, "out");

/** Reference-site identity and removed private routes must never appear publicly. */
const FORBIDDEN = ["Metalworks", "metalfabrication.ie", "/walter"];

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

/** Shipped source only. Test files legitimately name the things they forbid. */
const sourceFiles = [
  ...collectFiles(path.join(webDir, "app"), new Set([".tsx", ".ts", ".css"])),
  ...collectFiles(path.join(webDir, "src"), new Set([".tsx", ".ts", ".css"])),
].filter((file) => !/\.test\.tsx?$/.test(file));

describe("public source and export safety", () => {
  it("keeps reference-site identity and the removed /walter route out of public source", () => {
    const files = sourceFiles;
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const needle of FORBIDDEN) {
        expect(text, `${file} contains ${needle}`).not.toContain(needle);
      }
    }
  });

  it("has no management, authentication, API-client or database code left in the web app", () => {
    const banned = [
      "@ats/contracts",
      "@ats/config",
      "@neondatabase/auth",
      "createAuthClient",
      "NEXT_PUBLIC_API_BASE_URL",
      "NEXT_PUBLIC_NEON_AUTH_BASE_URL",
      "management/session",
      "submitInquiry",
      "DATABASE_URL",
    ];
    for (const file of sourceFiles) {
      const text = readFileSync(file, "utf8");
      for (const needle of banned) {
        expect(text, `${file} still references ${needle}`).not.toContain(needle);
      }
    }
  });

  it("has removed the backend, shared backend packages and management source trees", () => {
    for (const gone of [
      path.join(root, "apps", "api"),
      path.join(root, "packages"),
      path.join(webDir, "app", "walter"),
      path.join(webDir, "app", "(public)", "thank-you"),
      path.join(webDir, "src", "components", "walter"),
      path.join(webDir, "src", "components", "public", "thank-you"),
      path.join(webDir, "src", "lib", "auth"),
    ]) {
      expect(existsSync(gone), `${gone} should not exist`).toBe(false);
    }
  });

  it("reads no runtime environment variable anywhere in the web app", () => {
    for (const file of sourceFiles) {
      const text = readFileSync(file, "utf8");
      expect(text, `${file} reads process.env`).not.toContain("process.env");
    }
  });

  it("declares no backend environment variable in the Render blueprint", () => {
    const blueprint = readFileSync(path.join(root, "render.yaml"), "utf8");
    for (const needle of [
      "DATABASE_URL",
      "NEON_AUTH",
      "WALTER_ADMIN_USER_IDS",
      "CORS_ORIGINS",
      "R2_",
      "RESEND_API_KEY",
      "STATIC_SITE_DEPLOY_HOOK_URL",
      "NEXT_PUBLIC_API_BASE_URL",
      "NEXT_PUBLIC_NEON_AUTH_BASE_URL",
      "sync: false",
      "startCommand",
      "healthCheckPath",
      "ats-api",
    ]) {
      expect(blueprint, `render.yaml still declares ${needle}`).not.toContain(needle);
    }
  });

  describe("static export", () => {
    const exportExists = existsSync(outDir);

    it("exports exactly the public routes and no management route", () => {
      if (!exportExists) return;
      for (const page of ["index.html", "portfolio/index.html", "contact/index.html", "404.html"]) {
        expect(existsSync(path.join(outDir, page)), `${page} must be exported`).toBe(true);
      }
      expect(existsSync(path.join(outDir, "walter")), "/walter/ must not be exported").toBe(false);
      expect(existsSync(path.join(outDir, "thank-you")), "/thank-you/ must not be exported").toBe(false);
    });

    it("keeps forbidden identity out of exported public HTML", () => {
      if (!exportExists) return;
      const htmlFiles = collectFiles(outDir, new Set([".html"]));
      expect(htmlFiles.length).toBeGreaterThan(0);
      for (const file of htmlFiles) {
        const text = readFileSync(file, "utf8");
        for (const needle of FORBIDDEN) {
          expect(text, `${file} contains ${needle}`).not.toContain(needle);
        }
      }
    });

    it("carries no stale inquiry-success or backend-unavailable messaging", () => {
      if (!exportExists) return;
      for (const file of collectFiles(outDir, new Set([".html"]))) {
        const text = readFileSync(file, "utf8");
        for (const needle of [
          "Thank you for your enquiry",
          "could not be sent",
          "Please try again",
          "Submitting…",
          "inquiry could not",
        ]) {
          expect(text, `${file} contains stale message: ${needle}`).not.toContain(needle);
        }
      }
    });

    it("puts the WhatsApp floater on every exported public page", () => {
      if (!exportExists) return;
      const pages = ["index.html", "portfolio/index.html", "contact/index.html", "404.html"];
      for (const page of pages) {
        const text = readFileSync(path.join(outDir, page), "utf8");
        expect(text, `${page} is missing the WhatsApp floater`).toContain("whatsapp-float");
        expect(text, `${page} has the wrong WhatsApp number`).toContain("wa.me/256782318727");
        expect(text, `${page} is missing the WhatsApp accessible name`).toContain(
          "Chat with Active Technical Services on WhatsApp",
        );
        expect(text, `${page} is missing safe external-link attributes`).toContain("noopener noreferrer");
      }
    });

    it("keeps the floater clear of the mobile call bar in the shipped stylesheet", () => {
      const css = readFileSync(path.join(webDir, "app", "globals.css"), "utf8");
      expect(css).toContain(".whatsapp-float");
      expect(css).toContain("bottom: calc(var(--ats-call-bar-height) + 16px)");
      const tokens = readFileSync(path.join(webDir, "src", "styles", "tokens.css"), "utf8");
      expect(tokens).toContain("--ats-whatsapp-size: 56px");
    });

    it("resolves every public media reference in the exported HTML", () => {
      if (!exportExists) return;
      const referenced = new Set<string>();
      for (const file of collectFiles(outDir, new Set([".html"]))) {
        const text = readFileSync(file, "utf8");
        for (const match of text.matchAll(/\/media\/[A-Za-z0-9._/-]+/g)) {
          referenced.add(match[0]);
        }
      }
      expect(referenced.size).toBeGreaterThan(10);
      for (const src of referenced) {
        expect(existsSync(path.join(outDir, src)), `missing exported media: ${src}`).toBe(true);
      }
    });
  });
});
