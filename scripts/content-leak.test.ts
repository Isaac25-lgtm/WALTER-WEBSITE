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

  it("emits nine illustrated services and owner-supplied generic work imagery", () => {
    expect(content.services).toHaveLength(9);
    expect(content.services.every((service) => service.image.src.startsWith("/media/company/"))).toBe(true);
    expect(content.projects).toHaveLength(6);
    expect(content.projectMedia.length).toBeGreaterThanOrEqual(18);
    expect(content.portfolio.groups).toHaveLength(5);
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
    ]) {
      expect(combined).not.toContain(needle);
    }
  });

  it("publishes only the three static public routes", () => {
    expect(content.routes).toEqual(["/", "/contact/", "/portfolio/"]);
    expect(content.navigation.every((item) => item.href !== "/thank-you/")).toBe(true);
    expect(JSON.stringify(content)).not.toContain("thankYou");
  });

  it("emits contact copy without provenance or a head-office claim", () => {
    expect(content.contact.heading).toBe("Contact Us");
    expect(content.contact.tanzaniaBranchLabel).toContain("Dodoma");
    expect(JSON.stringify(content.contact)).not.toMatch(/head office|headquarters/i);
    expect(JSON.stringify(content.contact)).not.toMatch(/24-hour|response time/i);
  });

  it("emits every approved contact channel with a usable link", () => {
    const { contacts } = content;
    expect(contacts.primaryPhone).toBe("+256 782 318 727");
    expect(contacts.primaryPhoneHref).toBe("tel:+256782318727");
    expect(contacts.secondaryPhone).toBe("+256 755 318 727");
    expect(contacts.secondaryPhoneHref).toBe("tel:+256755318727");
    expect(contacts.tanzaniaLocalPhone).toBe("+255 764 306 184");
    expect(contacts.tanzaniaLocalPhoneHref).toBe("tel:+255764306184");
    expect(contacts.email).toBe("activetechnicalservices@gmail.com");
    expect(contacts.emailHref).toBe("mailto:activetechnicalservices@gmail.com");
  });

  it("emits the approved WhatsApp destination and prefilled message", () => {
    const { whatsapp } = content.contacts;
    expect(whatsapp.number).toBe("256782318727");
    expect(whatsapp.url).toBe(
      `https://wa.me/256782318727?text=${encodeURIComponent(
        "Hello Active Technical Services, I would like to make an enquiry about your services.",
      )}`,
    );
    expect(whatsapp.ariaLabel).toBe("Chat with Active Technical Services on WhatsApp");
  });

  it("emits the supplied Tanzania branch map location", () => {
    const { map } = content;
    expect(map.latitude).toBe(-6.1683199);
    expect(map.longitude).toBe(35.7260943);
    expect(map.linkUrl).toBe("https://www.google.com/maps?q=-6.1683199,35.7260943&z=17&hl=en");
    expect(map.embedUrl).toBe("https://www.google.com/maps?q=-6.1683199,35.7260943&z=17&hl=en&output=embed");
    expect(map.title).toBe("Active Technical Services Tanzania branch location");
    expect(map.label).not.toMatch(/head office|headquarters/i);
  });

  it("emits homepage copy without provenance", () => {
    expect(content.homepage.heroHeading).toBe("Engineering, fabrication and construction solutions");
    expect(content.homepage.contactCtaLabel).toBe("Contact us");
    expect(content.latestWork).toEqual([]);
    expect(content.siteMedia.hero.src).toBe("/media/company/hero-lifting-operations.jpg");
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

  it("does not require the ignored raw company-image archive during a deployment build", () => {
    const generator = readFileSync(path.join(root, "scripts", "generate-public-content.mjs"), "utf8");
    expect(generator).not.toContain('path.join(root, "compan images"');
    expect(content.siteMedia.hero.src).toMatch(/^\/media\/company\//);
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
