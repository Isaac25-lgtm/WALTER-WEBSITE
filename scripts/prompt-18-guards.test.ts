import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function collectFiles(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, files);
    else files.push(full);
  }
  return files;
}

describe("Prompt 18 completion guards", () => {
  it("requires content-management documentation and Prompt 18 comparison evidence", () => {
    expect(existsSync(path.join(root, "project", "CONTENT-MANAGEMENT.md"))).toBe(true);
    expect(existsSync(path.join(root, "project", "visual-checks", "prompt-18", "comparison.md"))).toBe(true);
    expect(existsSync(path.join(root, "project", "visual-checks", "prompt-18", "README.md"))).toBe(true);
    expect(existsSync(path.join(root, "project", "visual-checks", "prompt-18", "measurements.json"))).toBe(true);
  });

  it("does not keep handwritten Prompt 18 HTML fixtures or the visual test route", () => {
    const fixtures = path.join(root, "project", "visual-checks", "prompt-18", "fixtures");
    if (existsSync(fixtures)) {
      const html = collectFiles(fixtures).filter((file) => file.endsWith(".html"));
      expect(html).toEqual([]);
    }
    expect(existsSync(path.join(root, "apps", "web", "app", "walter-visual"))).toBe(false);
    const outDir = path.join(root, "apps", "web", "out");
    if (existsSync(outDir)) {
      const relative = collectFiles(outDir).map((file) => path.relative(outDir, file).replaceAll("\\", "/"));
      expect(relative.some((file) => file.startsWith("walter-visual/"))).toBe(false);
    }
  });

  it("includes the publication compiler in package scripts and verify", () => {
    const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts["content:compile-publication:test"]).toContain("compile-publication-content.mjs");
    expect(pkg.scripts.verify).toContain("content:compile-publication:test");
  });

  it("keeps publication pagination in SQL and classifies 415 correctly", () => {
    const drizzle = readFileSync(
      path.join(root, "apps", "api", "src", "repositories", "drizzle-publication-repository.ts"),
      "utf8",
    );
    expect(drizzle).not.toContain("isBeforeCursor");
    expect(drizzle).toContain("query.limit + 1");
    expect(drizzle).toContain("lt(contentPublications.createdAt");
    const client = readFileSync(path.join(root, "apps", "web", "src", "lib", "auth", "management-request.ts"), "utf8");
    expect(client).toContain('return "unsupported_media_type"');
    expect(client).not.toContain(
      'status === 415 && inquiryUnsupportedMediaTypeErrorSchema.safeParse(json).success) return "unexpected"',
    );
  });

  it("uses publication-specific pagination copy", () => {
    const component = readFileSync(
      path.join(root, "apps", "web", "src", "components", "walter", "ContentPublications.tsx"),
      "utf8",
    );
    expect(component).toContain("MANAGEMENT_COPY.loadMorePublications");
    expect(component).toContain("MANAGEMENT_COPY.loadingMorePublications");
    expect(component).not.toContain("MANAGEMENT_COPY.loadMore}");
  });

  it("keeps official generated content canonical and free of publication metadata and draft overlays", () => {
    const json = readFileSync(path.join(root, "apps", "web", "src", "generated", "public-content.json"), "utf8");
    expect(json).not.toContain("createdBySubject");
    expect(json).not.toContain("sourceDraftVersion");
    expect(json).not.toContain("Local draft heading");
    expect(json).not.toContain("Local compiled heading");
    expect(json).not.toContain("admin-subject-1");
    const outDir = path.join(root, "apps", "web", "out");
    if (!existsSync(outDir)) return;
    for (const file of collectFiles(outDir).filter((item) => item.endsWith(".html"))) {
      const relative = path.relative(outDir, file).replaceAll("\\", "/");
      if (relative.startsWith("walter/")) continue;
      const text = readFileSync(file, "utf8");
      expect(text, relative).not.toContain("createdBySubject");
      expect(text, relative).not.toContain("Local draft heading");
      expect(text, relative).not.toContain("admin-subject-1");
    }
  });
});
