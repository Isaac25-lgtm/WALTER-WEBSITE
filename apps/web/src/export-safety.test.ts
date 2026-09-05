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

    it("exports the Tanzania branch map on both the homepage and the contact page", () => {
      if (!exportExists) return;
      for (const page of ["index.html", "contact/index.html"]) {
        const text = readFileSync(path.join(outDir, page), "utf8");
        expect(text, `${page} is missing the map embed`).toContain(
          "https://www.google.com/maps?q=-6.1683199,35.7260943&amp;z=17&amp;hl=en&amp;output=embed",
        );
        expect(text, `${page} map is missing a title`).toContain(
          "Active Technical Services Tanzania branch location",
        );
        expect(text, `${page} map is not lazily loaded`).toContain('loading="lazy"');
        expect(text, `${page} is missing the Open in Google Maps link`).toContain("Open in Google Maps");
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

/**
 * The retired backend must not come back by accident.
 *
 * Scope note: guard code and history legitimately name what they forbid, so
 * project/PROGRESS.md, context/extracted/ and context/reference/ are excluded,
 * and test files are excluded from the source scan.
 */
describe("retired backend stays retired", () => {
  const scriptsDir = path.join(root, "scripts");

  it("has deleted the unused backend-era URL helper", () => {
    expect(existsSync(path.join(webDir, "src", "lib", "public-url.ts"))).toBe(false);
  });

  it("has deleted the obsolete visual evidence for the retired backend", () => {
    for (let n = 8; n <= 18; n += 1) {
      const dir = path.join(root, "project", "visual-checks", `prompt-${String(n).padStart(2, "0")}`);
      expect(existsSync(dir), `${dir} should not exist`).toBe(false);
    }
  });

  it("keeps the current visual evidence", () => {
    for (const keep of [
      path.join(root, "project", "visual-checks", "prompt-06"),
      path.join(root, "project", "visual-checks", "prompt-07"),
      path.join(root, "project", "visual-checks", "static-site", "measurements.json"),
      path.join(root, "project", "visual-checks", "company-media", "measurements.json"),
    ]) {
      expect(existsSync(keep), `${keep} must be kept`).toBe(true);
    }
  });

  it("keeps retired identifiers out of application source", () => {
    const banned = [
      "parsePublicApiOrigin",
      "parseNeonAuthBaseUrl",
      "walter-visual",
      "NEXT_PUBLIC_API_BASE_URL",
      "NEXT_PUBLIC_NEON_AUTH_BASE_URL",
      "DATABASE_URL",
      "apps/api",
      "fastify",
      "Fastify",
      "drizzle",
      "Drizzle",
      "@neondatabase",
      "Neon Auth",
      "management/session",
      "/walter",
      "R2_SECRET_ACCESS_KEY",
      "RESEND_API_KEY",
      "STATIC_SITE_DEPLOY_HOOK_URL",
    ];
    expect(sourceFiles.length).toBeGreaterThan(5);
    for (const file of sourceFiles) {
      const text = readFileSync(file, "utf8");
      for (const needle of banned) {
        expect(text, `${file} reintroduces ${needle}`).not.toContain(needle);
      }
    }
  });

  it("keeps retired dependencies and secrets out of active scripts", () => {
    // Content guards legitimately list "/walter" and "Walter" as forbidden
    // tokens, so this tier bans wiring markers rather than bare mentions.
    const banned = [
      "parsePublicApiOrigin",
      "parseNeonAuthBaseUrl",
      "walter-visual",
      "NEXT_PUBLIC_API_BASE_URL",
      "NEXT_PUBLIC_NEON_AUTH_BASE_URL",
      "DATABASE_URL",
      "apps/api",
      "fastify",
      "drizzle",
      "@neondatabase",
      "management/session",
      "R2_SECRET_ACCESS_KEY",
      "RESEND_API_KEY",
      "STATIC_SITE_DEPLOY_HOOK_URL",
    ];
    const scripts = collectFiles(scriptsDir, new Set([".mjs", ".js", ".py"]));
    expect(scripts.length).toBeGreaterThan(3);
    for (const file of scripts) {
      const text = readFileSync(file, "utf8");
      for (const needle of banned) {
        expect(text, `${file} reintroduces ${needle}`).not.toContain(needle);
      }
    }
  });

  it("keeps backend build and database commands out of current architecture docs", () => {
    // Prose may say a thing was removed; these are operational instructions
    // that only exist if the backend is presented as active again.
    const docs = [
      path.join(root, "README.md"),
      path.join(root, "scripts", "README.md"),
      path.join(root, "project", "ARCHITECTURE.md"),
      path.join(root, "project", "DEPLOYMENT-PLAN.md"),
      path.join(root, "project", "LOCAL-DEVELOPMENT.md"),
      path.join(root, "project", "DECISIONS.md"),
      path.join(root, "project", "SOURCE-CONTROL-POLICY.md"),
      path.join(root, "context", "canonical", "content-model.md"),
      path.join(root, "context", "canonical", "content-gaps.md"),
      path.join(root, "context", "canonical", "editorial-decisions.md"),
    ];
    const banned = [
      "run dev:api",
      "run build:api",
      "run db:migrate",
      "run db:generate",
      "run db:check",
      "drizzle-kit",
      "apps/api/dist",
      "sync: false",
      "walter-visual",
      "parsePublicApiOrigin",
      "parseNeonAuthBaseUrl",
    ];
    for (const file of docs) {
      expect(existsSync(file), `${file} must exist`).toBe(true);
      const text = readFileSync(file, "utf8");
      for (const needle of banned) {
        expect(text, `${file} presents ${needle} as current`).not.toContain(needle);
      }
    }
  });

  it("declares exactly one static Render service with no operator-supplied value", () => {
    const blueprint = readFileSync(path.join(root, "render.yaml"), "utf8");
    expect(blueprint.match(/^\s*- type: /gm) ?? []).toHaveLength(1);
    expect(blueprint).toContain("name: ats-public-web");
    expect(blueprint).toContain("runtime: static");
    expect(blueprint).toContain("staticPublishPath: apps/web/out");
    for (const needle of ["runtime: node", "startCommand", "healthCheckPath", "plan:", "sync: false", "ats-api"]) {
      expect(blueprint, `render.yaml still declares ${needle}`).not.toContain(needle);
    }
    const keys = (blueprint.match(/^\s*- key: (.+)$/gm) ?? []).map((line) => line.split("key:")[1]?.trim());
    expect(keys).toEqual(["NODE_VERSION"]);
  });
});
