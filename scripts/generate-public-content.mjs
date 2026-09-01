import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const declaredRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = fs.realpathSync.native(declaredRoot);
const canonicalDir = path.join(root, "context", "canonical");
const generatedDir = path.join(root, "apps", "web", "src", "generated");
const apiGeneratedDir = path.join(root, "apps", "api", "src", "generated");
const webDraftFieldsPath = path.join(generatedDir, "content-draft-fields.ts");
const apiDraftFieldsPath = path.join(apiGeneratedDir, "content-draft-fields.ts");
const CONTENT_DRAFT_KEYS = [
  "homepage.heroHeading",
  "homepage.heroSupporting",
  "homepage.servicesHeading",
  "homepage.servicesIntroduction",
  "homepage.aboutEyebrow",
  "homepage.aboutHeading",
  "homepage.aboutParagraph1",
  "homepage.aboutParagraph2",
  "homepage.closingCtaHeading",
  "homepage.closingCtaSupporting",
  "contact.heading",
  "contact.introduction",
  "thankYou.heading",
  "thankYou.supporting",
];

const FORBIDDEN_SUBSTRINGS = [
  "Walter",
  "Metalworks",
  "metalfabrication.ie",
  "metalworksdublin",
  "5847177",
  "015847177",
  "hello@metalworksdublin",
  "active company profile new 2025",
  "COMPANY CONTEXT.pdf",
  "context/assets",
  "context\\assets",
  "F:\\",
  "W:\\",
  "/walter",
  "WhatsApp",
  "whatsapp",
];

function readCanonical(name) {
  const filePath = path.join(canonicalDir, name);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing canonical file: ${name}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function controlMap(records) {
  return new Map(records.map((item) => [item.id, item]));
}

function isPublic(control) {
  return Boolean(control && control.public_allowed === true && control.state === "published");
}

function assertPublicText(block, label) {
  assert(block && typeof block.text === "string" && block.text.trim().length > 0, `${label} is missing`);
  assert(typeof block.source_file === "string" && block.source_file.startsWith("context/canonical/"), `${label} must cite a canonical file`);
  assert(typeof block.canonical_field === "string" && block.canonical_field.trim(), `${label} must cite a canonical field`);
  assert(typeof block.editorial_note === "string" && block.editorial_note.trim(), `${label} must include an editorial note`);
  const text = block.text.trim();
  const forbiddenClaims = [
    "100+ years",
    "industry-leading",
    "best",
    "number one",
    "award-winning",
    "state-of-the-art",
    "cutting-edge",
    "guaranteed",
  ];
  for (const claim of forbiddenClaims) {
    assert(!text.toLowerCase().includes(claim), `${label} contains unverified claim: ${claim}`);
  }
  return text;
}

export function buildPublicContent() {
  const company = readCanonical("company.json");
  const settings = readCanonical("site-settings.json");
  const locations = readCanonical("locations.json");
  const servicesFile = readCanonical("services.json");
  const projectsFile = readCanonical("projects.json");
  const controls = readCanonical("publication-controls.json");
  const publicCopy = readCanonical("public-copy.json");

  assert(controls, "canonical publication controls are missing");
  assert(controls.pricing_mode === "quote_only" || settings.pricing_mode?.startsWith("quote_only"), "pricing must be quote only");
  assert(Array.isArray(servicesFile.services) && servicesFile.services.length === 9, "service count must be exactly nine");
  assert(Array.isArray(projectsFile.projects) && projectsFile.projects.length === 21, "expected 21 canonical projects");

  const jinja = locations.locations.find((item) => item.id === "loc-jinja-primary");
  const dodoma = locations.locations.find((item) => item.id === "loc-dodoma-branch");
  assert(jinja, "Jinja primary location is missing");
  assert(dodoma, "Dodoma branch location is missing");
  assert(
    jinja.organizational_role.includes("primary"),
    "Jinja must be the primary operation",
  );
  assert(
    dodoma.organizational_role.includes("branch"),
    "Tanzania must be modelled as a branch",
  );
  assert(
    company.geographic_coverage.primary_operation === "Jinja, Uganda",
    "Jinja is not the primary operation",
  );
  assert(
    company.geographic_coverage.branch === "Dodoma, Tanzania",
    "Dodoma branch label missing",
  );

  const projectControls = controlMap(controls.collections.projects);
  const mediaControls = controlMap(controls.collections.project_media);
  const peopleControls = controlMap(controls.collections.identifiable_people);
  const clientControls = controlMap(controls.collections.client_names);

  assert(
    [...peopleControls.values()].every((control) => !isPublic(control)),
    "identifiable people must not be public in this baseline",
  );

  for (const project of projectsFile.projects) {
    const control = projectControls.get(project.id);
    assert(control, `publication control missing for project ${project.id}`);
    const mediaIds = [
      project.primary_image_asset_id,
      ...(project.gallery_image_asset_ids ?? []),
    ].filter(Boolean);
    for (const mediaId of mediaIds) {
      assert(mediaControls.has(mediaId), `publication control missing for media ${mediaId}`);
      if (isPublic(control) && !isPublic(mediaControls.get(mediaId))) {
        throw new Error(`Project ${project.id} cannot be public while media ${mediaId} is unresolved`);
      }
    }
    if (project.client) {
      const clientId = `client:${project.client}`;
      assert(clientControls.has(clientId), `publication control missing for client ${project.client}`);
      if (isPublic(control) && !isPublic(clientControls.get(clientId))) {
        throw new Error(`Project ${project.id} cannot be public while client permission remains unresolved`);
      }
    }
    if (isPublic(control) && !control.reviewed_by) {
      throw new Error(`Published project ${project.id} lacks explicit approval`);
    }
  }

  const publicProjects = projectsFile.projects.filter((project) => isPublic(projectControls.get(project.id)));
  assert(publicProjects.length === 0, "unapproved projects must not be emitted in this baseline");

  const publicServices = servicesFile.services.map((service) => ({
    id: service.id,
    slug: service.slug,
    name: service.name,
    shortDescription: service.short_description,
  }));

  const homepageCopy = publicCopy.homepage;
  assert(homepageCopy, "canonical homepage copy is missing");
  const contactCopy = publicCopy.contact;
  assert(contactCopy, "canonical contact copy is missing");
  const thankYouCopy = publicCopy.thankYou;
  assert(thankYouCopy, "canonical thank-you copy is missing");
  const aboutParagraphs = Array.isArray(homepageCopy.aboutParagraphs) ? homepageCopy.aboutParagraphs.map((block, index) => assertPublicText(block, `aboutParagraphs[${index}]`)) : null;
  assert(aboutParagraphs && aboutParagraphs.length >= 1, "about paragraphs are required");

  const tanzaniaBranchLabel = assertPublicText(contactCopy.tanzaniaBranchLabel, "contact.tanzaniaBranchLabel");
  assert(!/head office|headquarters/i.test(tanzaniaBranchLabel), "Tanzania must not be described as head office");

  const content = {
    identity: {
      publicName: company.public_name,
      abbreviation: company.abbreviation,
      mark: company.slogan,
      legalFooterName: settings.legal_footer_name,
      tanzaniaBranchLegalName: settings.tanzania_branch_legal_name,
      shortDescription: company.short_company_description,
      primaryOperation: {
        role: "primary_operation",
        id: jinja.id,
        displayName: jinja.display_name,
        country: jinja.country,
        physicalAddress: jinja.physical_address,
        postalAddress: jinja.postal_address,
      },
      branch: {
        role: "branch",
        id: dodoma.id,
        displayName: dodoma.display_name,
        country: dodoma.country,
        publicLabel: dodoma.public_label ?? "Tanzania branch",
        postalAddress: dodoma.postal_address,
      },
    },
    logo: {
      headerSrc: "/media/brand/ats-logo-header.png",
      footerSrc: "/media/brand/ats-logo-footer.png",
      alt: company.public_name,
    },
    contacts: {
      primaryPhone: settings.primary_phone,
      primaryPhoneHref: `tel:${settings.primary_phone.replaceAll(" ", "")}`,
      secondaryPhone: settings.secondary_phone,
      tanzaniaLocalPhone: settings.tanzania_local_phone,
      email: settings.email,
    },
    services: publicServices,
    projects: [],
    projectMedia: [],
    people: [],
    latestWork: [],
    clientNames: [],
    clientLogos: [],
    testimonials: [],
    socialLinks: [],
    mapCoordinates: [],
    prices: [],
    pricingMode: "quote_only",
    homepage: {
      heroHeading: assertPublicText(homepageCopy.heroHeading, "heroHeading"),
      heroSupporting: assertPublicText(homepageCopy.heroSupporting, "heroSupporting"),
      servicesHeading: assertPublicText(homepageCopy.servicesHeading, "servicesHeading"),
      servicesIntroduction: assertPublicText(homepageCopy.servicesIntroduction, "servicesIntroduction"),
      aboutEyebrow: assertPublicText(homepageCopy.aboutEyebrow, "aboutEyebrow"),
      aboutHeading: assertPublicText(homepageCopy.aboutHeading, "aboutHeading"),
      aboutParagraphs,
      portfolioCtaLabel: assertPublicText(homepageCopy.portfolioCtaLabel, "portfolioCtaLabel"),
      closingCtaHeading: assertPublicText(homepageCopy.closingCtaHeading, "closingCtaHeading"),
      closingCtaSupporting: assertPublicText(homepageCopy.closingCtaSupporting, "closingCtaSupporting"),
      contactCtaLabel: assertPublicText(homepageCopy.contactCtaLabel, "contactCtaLabel"),
    },
    contact: {
      heading: assertPublicText(contactCopy.heading, "contact.heading"),
      introduction: assertPublicText(contactCopy.introduction, "contact.introduction"),
      telephoneAlternativeText: assertPublicText(contactCopy.telephoneAlternativeText, "contact.telephoneAlternativeText"),
      emailAlternativeText: assertPublicText(contactCopy.emailAlternativeText, "contact.emailAlternativeText"),
      formUnavailableMessage: assertPublicText(contactCopy.formUnavailableMessage, "contact.formUnavailableMessage"),
      jinjaLocationLabel: assertPublicText(contactCopy.jinjaLocationLabel, "contact.jinjaLocationLabel"),
      tanzaniaBranchLabel,
      formRateLimitedMessage: assertPublicText(contactCopy.formRateLimitedMessage, "contact.formRateLimitedMessage"),
      formAttachmentUnavailableMessage: assertPublicText(
        contactCopy.formAttachmentUnavailableMessage,
        "contact.formAttachmentUnavailableMessage",
      ),
      formInvalidMessage: assertPublicText(contactCopy.formInvalidMessage, "contact.formInvalidMessage"),
      formInternalErrorMessage: assertPublicText(contactCopy.formInternalErrorMessage, "contact.formInternalErrorMessage"),
      formTimeoutMessage: assertPublicText(contactCopy.formTimeoutMessage, "contact.formTimeoutMessage"),
      formNetworkErrorMessage: assertPublicText(contactCopy.formNetworkErrorMessage, "contact.formNetworkErrorMessage"),
      formSubmittingMessage: assertPublicText(contactCopy.formSubmittingMessage, "contact.formSubmittingMessage"),
    },
    thankYou: {
      heading: assertPublicText(thankYouCopy.heading, "thankYou.heading"),
      supporting: assertPublicText(thankYouCopy.supporting, "thankYou.supporting"),
      otherWork: assertPublicText(thankYouCopy.otherWork, "thankYou.otherWork"),
      returnHomeLabel: assertPublicText(thankYouCopy.returnHomeLabel, "thankYou.returnHomeLabel"),
      returnContactLabel: assertPublicText(thankYouCopy.returnContactLabel, "thankYou.returnContactLabel"),
    },
    navigation: [
      { label: "Services", href: "/#what-we-do" },
      { label: "Portfolio", href: "/portfolio/" },
      { label: "Contact", href: "/contact/" },
    ],
    routes: ["/", "/contact/", "/portfolio/", "/thank-you/"],
  };

  const serialized = JSON.stringify(content);
  for (const needle of FORBIDDEN_SUBSTRINGS) {
    assert(!serialized.includes(needle), `public content leaked forbidden token: ${needle}`);
  }
  assert(!serialized.includes("evidence_strength"), "evidence fields must not leak");
  assert(!serialized.includes("source_file"), "source PDF paths must not leak");
  assert(!serialized.includes("editorial_notes"), "editorial notes must not leak");
  assert(!serialized.includes("editorial_note"), "homepage provenance must not leak");
  assert(!serialized.includes("canonical_field"), "homepage provenance must not leak");
  assert(content.services.length === 9, "service count must be exactly nine");
  assert(content.homepage.heroHeading.length > 0, "homepage hero heading is required");
  assert(content.homepage.aboutParagraphs.length >= 1, "homepage about paragraphs are required");
  assert(content.contact.heading === "Contact Us", "contact heading must be Contact Us");
  assert(content.thankYou.heading === "Thank you", "thank-you heading must be Thank you");
  assert(!/whatsapp/i.test(content.contact.formUnavailableMessage), "contact copy must not claim WhatsApp");
  assert(
    !/24-hour|response time|whatsapp/i.test(
      `${content.contact.introduction} ${content.contact.formUnavailableMessage} ${content.thankYou.supporting} ${content.thankYou.otherWork}`,
    ),
    "contact and thank-you copy must not promise availability",
  );
  assert(content.navigation.every((item) => item.href !== "/thank-you/"), "thank-you must not be a visible nav item");
  assert(content.projects.length === 0, "unapproved projects must not be emitted in this baseline");
  assert(content.latestWork.length === 0, "unapproved latest-work items must not be emitted");
  assert(content.navigation.length === 3, "visible primary navigation must have exactly three items");
  assert(content.navigation[0].label === "Services", "first nav item must be Services");
  assert(content.navigation.every((item) => item.label !== "Home"), "Home must not be a visible nav item");
  assert(content.identity.branch.role === "branch", "Tanzania must remain a branch");
  assert(content.identity.primaryOperation.displayName.startsWith("Jinja"), "Jinja must be primary");

  return content;
}

function readBySelector(source, selector) {
  const parts = selector.split(".");
  let current = source;
  for (const part of parts) {
    if (current == null) return undefined;
    current = /^\d+$/.test(part) ? current[Number(part)] : current[part];
  }
  return current;
}

export function buildContentDraftFields() {
  const publicCopy = readCanonical("public-copy.json");
  const fieldFile = readCanonical("content-draft-fields.json");
  assert(fieldFile.plain_text_policy === "plain_text_no_html", "plain-text policy must reject HTML");
  assert(
    Array.isArray(fieldFile.fields) && fieldFile.fields.length === CONTENT_DRAFT_KEYS.length,
    "controlled field count mismatch",
  );
  const fields = fieldFile.fields.map((field, index) => {
    assert(field.key === CONTENT_DRAFT_KEYS[index], `field order must match ${CONTENT_DRAFT_KEYS[index]}`);
    assert(typeof field.page === "string" && field.page.trim(), `${field.key} page is required`);
    assert(typeof field.section === "string" && field.section.trim(), `${field.key} section is required`);
    assert(typeof field.label === "string" && field.label.trim(), `${field.key} label is required`);
    assert(typeof field.description === "string" && field.description.trim(), `${field.key} description is required`);
    assert(Number.isInteger(field.min_length) && field.min_length >= 1, `${field.key} min_length is invalid`);
    assert(Number.isInteger(field.max_length) && field.max_length >= field.min_length, `${field.key} max_length is invalid`);
    assert(typeof field.multiline === "boolean", `${field.key} multiline is required`);
    assert(
      typeof field.canonical_selector === "string" && field.canonical_selector.trim(),
      `${field.key} canonical_selector is required`,
    );
    const block = readBySelector(publicCopy, field.canonical_selector);
    const canonicalValue = assertPublicText(block, field.key);
    assert(!field.description.includes("<") && !canonicalValue.includes("<"), `${field.key} must remain plain text`);
    return {
      key: field.key,
      page: field.page,
      section: field.section,
      label: field.label,
      description: field.description,
      minLength: field.min_length,
      maxLength: field.max_length,
      multiline: field.multiline,
      canonicalSelector: field.canonical_selector,
      plainTextPolicy: fieldFile.plain_text_policy,
      canonicalValue,
    };
  });
  return fields;
}

export function renderContentDraftFieldFiles(fields = buildContentDraftFields()) {
  const ts = `export const CONTENT_DRAFT_FIELDS = ${JSON.stringify(fields, null, 2)} as const;\n\nexport type GeneratedContentDraftField = (typeof CONTENT_DRAFT_FIELDS)[number];\n`;
  return { ts };
}

export function renderPublicContentFiles(content) {
  const json = `${JSON.stringify(content, null, 2)}\n`;
  const ts = `export const publicContent = ${JSON.stringify(content, null, 2)} as const;\n\nexport type PublicContent = typeof publicContent;\n`;
  return { json, ts };
}

export function writePublicContent(content = buildPublicContent()) {
  fs.mkdirSync(generatedDir, { recursive: true });
  fs.mkdirSync(apiGeneratedDir, { recursive: true });
  const files = renderPublicContentFiles(content);
  const draftFields = renderContentDraftFieldFiles();
  fs.writeFileSync(path.join(generatedDir, "public-content.json"), files.json, "utf8");
  fs.writeFileSync(path.join(generatedDir, "public-content.ts"), files.ts, "utf8");
  fs.writeFileSync(webDraftFieldsPath, draftFields.ts, "utf8");
  fs.writeFileSync(apiDraftFieldsPath, draftFields.ts, "utf8");
  return {
    jsonPath: "apps/web/src/generated/public-content.json",
    tsPath: "apps/web/src/generated/public-content.ts",
    webDraftFieldsPath: "apps/web/src/generated/content-draft-fields.ts",
    apiDraftFieldsPath: "apps/api/src/generated/content-draft-fields.ts",
    files,
    draftFields,
    content,
  };
}

function writeBuildReport(result) {
  const now = new Date().toISOString();
  const report = `# Content build report

Generated at ${now}

## Canonical inputs read

- context/canonical/company.json
- context/canonical/site-settings.json
- context/canonical/locations.json
- context/canonical/services.json
- context/canonical/projects.json
- context/canonical/publication-controls.json
- context/canonical/public-copy.json
- context/canonical/content-draft-fields.json

## Public records emitted

- Identity: Active Technical Services / ATS / Gift of God
- Locations: Jinja primary operation; Dodoma branch
- Contacts: canonical phones and email
- Services: ${result.content.services.length}
- Homepage copy slots: hero, services, about, portfolio CTA, closing CTA
- Contact copy slots: heading, introduction, alternatives, unavailable/rate-limit/attachment/invalid/internal/timeout/network/submitting messages, location labels
- Thank-you copy slots: heading, supporting, other work, return-home, return-contact
- Projects: ${result.content.projects.length}
- Project media: ${result.content.projectMedia.length}
- People: ${result.content.people.length}
- Client names: ${result.content.clientNames.length}
- Client logos: ${result.content.clientLogos.length}
- Testimonials: ${result.content.testimonials.length}
- Social links: ${result.content.socialLinks.length}
- Map coordinates: ${result.content.mapCoordinates.length}
- Prices: ${result.content.prices.length}
- Pricing mode: ${result.content.pricingMode}

## Records withheld

- All 21 canonical projects
- All project media
- Identifiable people
- Named clients
- Client logos
- Testimonials
- Social links
- Map coordinates
- Public prices

## Withholding reasons

Publication controls mark these collections as draft with public_allowed=false. No reviewer, consent, or client permission has been recorded.

## Generated output paths

- ${result.jsonPath}
- ${result.tsPath}
- ${result.webDraftFieldsPath}
- ${result.apiDraftFieldsPath}

## Validation result

Passed.
`;
  fs.writeFileSync(path.join(root, "project", "CONTENT-BUILD-REPORT.md"), report, "utf8");
}

if (process.argv[1] && path.basename(process.argv[1]) === "generate-public-content.mjs") {
  writeBuildReport(writePublicContent());
}
