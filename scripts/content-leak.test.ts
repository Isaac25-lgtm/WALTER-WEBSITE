import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPublicContent, renderPublicContentFiles } from "./generate-public-content.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("public content rules", () => {
  const content = buildPublicContent();
  const files = renderPublicContentFiles(content);
  const combined = `${files.json}\n${files.ts}`;

  it("emits nine services and withholds projects", () => {
    expect(content.services).toHaveLength(9);
    expect(content.projects).toEqual([]);
    expect(content.projectMedia).toEqual([]);
    expect(content.clientNames).toEqual([]);
    expect(content.prices).toEqual([]);
    expect(content.pricingMode).toBe("quote_only");
  });

  it("keeps Jinja as primary operation and Tanzania as a branch", () => {
    expect(content.identity.primaryOperation.displayName).toBe("Jinja, Uganda");
    expect(content.identity.branch.role).toBe("branch");
    expect(content.identity.branch.displayName).toBe("Dodoma, Tanzania");
  });

  it("does not leak private or reference identity", () => {
    for (const needle of [
      "Walter",
      "Metalworks",
      "metalfabrication.ie",
      "5847177",
      "hello@metalworksdublin",
      "COMPANY CONTEXT.pdf",
      "context/assets",
      "/walter",
      "WhatsApp",
    ]) {
      expect(combined).not.toContain(needle);
    }
  });

  it("emits thank-you copy without a photograph or nav link", () => {
    expect(content.thankYou.heading).toBe("Thank you");
    expect(content.thankYou.supporting).toBe("We will be in touch.");
    expect(content.thankYou.returnHomeLabel).toBe("Return home");
    expect(content.thankYou.returnContactLabel).toBe("Return to contact");
    expect(content.navigation.every((item) => item.href !== "/thank-you/")).toBe(true);
    expect(JSON.stringify(content.thankYou)).not.toMatch(/WhatsApp|24-hour|Metalworks/i);
  });

  it("emits contact copy without provenance or WhatsApp claims", () => {
    expect(content.contact.heading).toBe("Contact Us");
    expect(content.contact.formUnavailableMessage).toContain("being prepared");
    expect(content.contact.tanzaniaBranchLabel).toContain("Dodoma");
    expect(JSON.stringify(content.contact)).not.toMatch(/WhatsApp|head office/i);
  });

  it("emits homepage copy without provenance", () => {
    expect(content.homepage.heroHeading).toBe("Engineering, fabrication and construction solutions");
    expect(content.homepage.contactCtaLabel).toBe("Contact us");
    expect(content.latestWork).toEqual([]);
    expect(combined).not.toContain("canonical_field");
    expect(combined).not.toContain("editorial_note");
  });

  it("emits three visible primary navigation items without Home", () => {
    expect(content.navigation).toEqual([
      { label: "Services", href: "/#what-we-do" },
      { label: "Portfolio", href: "/portfolio/" },
      { label: "Contact", href: "/contact/" },
    ]);
  });

  it("requires publication controls", () => {
    expect(
      readFileSync(path.join(root, "context", "canonical", "publication-controls.json"), "utf8").length,
    ).toBeGreaterThan(10);
  });

  it("inspects the saved JSON and TypeScript snapshots", () => {
    const json = readFileSync(path.join(root, "apps", "web", "src", "generated", "public-content.json"), "utf8");
    const ts = readFileSync(path.join(root, "apps", "web", "src", "generated", "public-content.ts"), "utf8");
    expect(json).toBe(files.json);
    expect(ts).toBe(files.ts);
    expect(json).not.toContain("Walter");
    expect(ts).not.toContain("Metalworks");
    expect(json).not.toContain("COMPANY CONTEXT.pdf");
  });
});
