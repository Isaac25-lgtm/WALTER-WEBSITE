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

  it("emits homepage map copy that names both sites without implying a headquarters", () => {
    const { map } = content;
    expect(map.homeHeading).toBe("Where to find us");
    expect(map.homeSupporting).toMatch(/Jinja/);
    expect(map.homeSupporting).toMatch(/Dodoma/);
    expect(`${map.homeHeading} ${map.homeSupporting}`).not.toMatch(/head office|headquarters/i);
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
describe("canonical data is authoritative", () => {
  const canonical = (name: string) =>
    JSON.parse(readFileSync(path.join(root, "context", "canonical", name), "utf8"));
  const generatorSource = readFileSync(path.join(root, "scripts", "generate-public-content.mjs"), "utf8");
  const content = buildPublicContent();

  it("reads the Dodoma coordinates from the canonical location record", () => {
    const locations = canonical("locations.json");
    const dodoma = locations.locations.find((l: { id: string }) => l.id === "loc-dodoma-branch");
    expect(dodoma.map.latitude).toBe(-6.1683199);
    expect(dodoma.map.longitude).toBe(35.7260943);
    expect(dodoma.map.zoom).toBe(17);
    expect(dodoma.map.language).toBe("en");
    expect(dodoma.map.provenance.source).toBe("owner_supplied");
    expect(dodoma.map_status).toBe("owner_supplied_coordinates_approved_for_public_site");
    // The published map must be the canonical record, not a duplicate literal.
    expect(content.map.latitude).toBe(dodoma.map.latitude);
    expect(content.map.longitude).toBe(dodoma.map.longitude);
    expect(content.map.zoom).toBe(dodoma.map.zoom);
    expect(content.map.language).toBe(dodoma.map.language);
  });

  it("keeps Jinja without invented coordinates", () => {
    const locations = canonical("locations.json");
    const jinja = locations.locations.find((l: { id: string }) => l.id === "loc-jinja-primary");
    expect(jinja.map).toBeUndefined();
    expect(jinja.organizational_role).toContain("primary");
  });

  it("declares no hard-coded map or WhatsApp constants in the generator", () => {
    for (const needle of ["MAP_LATITUDE", "MAP_LONGITUDE", "WHATSAPP_NUMBER ="]) {
      expect(generatorSource, `generator still declares ${needle}`).not.toContain(needle);
    }
    expect(generatorSource).toContain("dodoma.map");
    expect(generatorSource).toContain("settings.whatsapp_number");
  });

  it("records owner approval for the public WhatsApp number in canonical settings", () => {
    const settings = canonical("site-settings.json");
    expect(settings.whatsapp_confirmation_state).toBe("confirmed_by_owner_for_public_site");
    expect(settings.whatsapp_number).toBe("+256 782 318 727");
    expect(content.contacts.whatsapp.number).toBe("256782318727");

    const locations = canonical("locations.json");
    for (const loc of locations.locations) {
      expect(loc.whatsapp_status).toBe("confirmed_by_owner_for_public_site");
      expect((loc.unresolved_fields ?? []).join(" ")).not.toMatch(/WhatsApp/i);
    }
    expect(settings.unresolved_settings.join(" ")).not.toMatch(/WhatsApp/i);
  });

  it("has removed the contact-form and thank-you fields from canonical files", () => {
    const settings = canonical("site-settings.json");
    for (const key of [
      "thank_you_heading",
      "thank_you_supporting",
      "thank_you_other_work",
      "thank_you_return_home",
      "thank_you_return_contact",
      "form_internal_error_message",
      "form_timeout_message",
      "form_network_error_message",
      "form_submitting_message",
    ]) {
      expect(settings, `site-settings.json still has ${key}`).not.toHaveProperty(key);
    }

    const copy = canonical("public-copy.json");
    expect(copy).not.toHaveProperty("thankYou");
    for (const key of [
      "formUnavailableMessage",
      "formRateLimitedMessage",
      "formAttachmentUnavailableMessage",
      "formInvalidMessage",
      "formInternalErrorMessage",
      "formTimeoutMessage",
      "formNetworkErrorMessage",
      "formSubmittingMessage",
    ]) {
      expect(copy.contact, `public-copy.json still has contact.${key}`).not.toHaveProperty(key);
    }
  });

  it("keeps the active contact copy that the pages still render", () => {
    const copy = canonical("public-copy.json");
    for (const key of [
      "heading",
      "introduction",
      "telephoneAlternativeText",
      "emailAlternativeText",
      "whatsappAlternativeText",
      "jinjaLocationLabel",
      "tanzaniaBranchLabel",
      "mapHeading",
      "mapLinkLabel",
      "mapEmbedTitle",
      "mapCaption",
    ]) {
      expect(copy.contact, `public-copy.json is missing contact.${key}`).toHaveProperty(key);
    }
    expect(copy.home).toHaveProperty("locationHeading");
    expect(copy.home).toHaveProperty("locationSupporting");
  });

  it("compiles homepage and contact map copy from canonical text", () => {
    const copy = canonical("public-copy.json");
    expect(content.map.homeHeading).toBe(copy.home.locationHeading.text);
    expect(content.map.homeSupporting).toBe(copy.home.locationSupporting.text);
    expect(content.map.linkLabel).toBe(copy.contact.mapLinkLabel.text);
    expect(content.map.title).toBe(copy.contact.mapEmbedTitle.text);
    expect(content.map.label).toBe(copy.contact.mapCaption.text);
    expect(content.contact.mapHeading).toBe(copy.contact.mapHeading.text);
  });

  it("emits no legacy mapCoordinates property", () => {
    expect(content).not.toHaveProperty("mapCoordinates");
    expect(JSON.stringify(content)).not.toContain("mapCoordinates");
  });

  it("never presents Dodoma as a head office", () => {
    const serialized = JSON.stringify(content);
    expect(serialized).not.toMatch(/head office|headquarters/i);
  });
});
