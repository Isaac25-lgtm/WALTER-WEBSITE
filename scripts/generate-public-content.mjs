import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const declaredRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = fs.realpathSync.native(declaredRoot);
const canonicalDir = path.join(root, "context", "canonical");
const generatedDir = path.join(root, "apps", "web", "src", "generated");

// Developer-managed constants. Edit here, then run `npm run content:generate`.
const WHATSAPP_NUMBER = "256782318727";
const WHATSAPP_MESSAGE = "Hello Active Technical Services, I would like to make an enquiry about your services.";
const MAP_LATITUDE = -6.1683199;
const MAP_LONGITUDE = 35.7260943;

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
  const companyMedia = readCanonical("company-media.json");

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
  assert(publicProjects.length === 0, "unapproved named projects must not be emitted");

  assert(Array.isArray(companyMedia.assets) && companyMedia.assets.length >= 18, "company media shortlist is incomplete");
  const mediaById = new Map();
  for (const asset of companyMedia.assets) {
    assert(typeof asset.id === "string" && asset.id.startsWith("media-"), "company media id is invalid");
    assert(!mediaById.has(asset.id), `duplicate company media id: ${asset.id}`);
    assert(typeof asset.file === "string" && /^[a-z0-9-]+\.jpg$/.test(asset.file), `${asset.id} has an invalid public file`);
    assert(typeof asset.source_file === "string" && /^IMG-[0-9A-Z-]+\.jpg$/.test(asset.source_file), `${asset.id} has an invalid source file`);
    assert(Number.isInteger(asset.width) && asset.width > 0, `${asset.id} width is invalid`);
    assert(Number.isInteger(asset.height) && asset.height > 0, `${asset.id} height is invalid`);
    assert(typeof asset.alt === "string" && asset.alt.trim().length >= 12, `${asset.id} alt text is missing`);
    assert(typeof asset.object_position === "string" && asset.object_position.trim(), `${asset.id} object position is missing`);
    // source_file is provenance for the locally archived raw photograph. Runtime
    // builds must depend only on the curated copy committed under public/.
    assert(
      fs.existsSync(path.join(root, "apps", "web", "public", "media", "company", asset.file)),
      `${asset.id} public image is missing`,
    );
    mediaById.set(asset.id, asset);
  }

  function publicMedia(assetId) {
    const asset = mediaById.get(assetId);
    assert(asset, `unknown company media id: ${assetId}`);
    return {
      id: asset.id,
      src: `${companyMedia.public_asset_root}${asset.file}`,
      alt: asset.alt,
      width: asset.width,
      height: asset.height,
      objectPosition: asset.object_position,
    };
  }

  const serviceMediaEntries = Object.entries(companyMedia.service_media ?? {});
  assert(serviceMediaEntries.length === servicesFile.services.length, "every service must have one selected image");

  const publicServices = servicesFile.services.map((service) => ({
    id: service.id,
    slug: service.slug,
    name: service.name,
    shortDescription: service.short_description,
    image: publicMedia(companyMedia.service_media[service.id]),
  }));

  const featuredWork = companyMedia.featured_work.map((item) => ({
    id: item.id,
    title: item.title,
    href: `/portfolio/#${item.portfolio_anchor}`,
    image: publicMedia(item.asset_id),
  }));
  assert(featuredWork.length === 6, "homepage must contain exactly six featured-work tiles");

  const portfolioGroups = companyMedia.portfolio_groups.map((group) => ({
    id: group.id,
    title: group.title,
    items: group.items.map((item) => ({
      id: item.id,
      title: item.title,
      image: publicMedia(item.asset_id),
    })),
  }));
  const portfolioMedia = portfolioGroups.flatMap((group) =>
    group.items.map((item) => ({ ...item, groupId: group.id, groupTitle: group.title })),
  );
  assert(portfolioGroups.length === 5, "portfolio capability grouping is incomplete");
  assert(portfolioMedia.length >= 18, "portfolio image selection is too small");

  const siteMedia = {
    hero: publicMedia(companyMedia.site_media.hero),
    about: publicMedia(companyMedia.site_media.about),
    closingCta: publicMedia(companyMedia.site_media.closing_cta),
  };

  const homepageCopy = publicCopy.homepage;
  assert(homepageCopy, "canonical homepage copy is missing");
  const contactCopy = publicCopy.contact;
  assert(contactCopy, "canonical contact copy is missing");
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
      secondaryPhoneHref: `tel:${settings.secondary_phone.replaceAll(" ", "")}`,
      tanzaniaLocalPhone: settings.tanzania_local_phone,
      tanzaniaLocalPhoneHref: `tel:${settings.tanzania_local_phone.replaceAll(" ", "")}`,
      email: settings.email,
      emailHref: `mailto:${settings.email}`,
      whatsapp: {
        number: WHATSAPP_NUMBER,
        url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
        message: WHATSAPP_MESSAGE,
        label: "WhatsApp",
        ariaLabel: "Chat with Active Technical Services on WhatsApp",
      },
    },
    map: {
      latitude: MAP_LATITUDE,
      longitude: MAP_LONGITUDE,
      title: "Active Technical Services Tanzania branch location",
      label: "Tanzania branch location",
      linkUrl: `https://www.google.com/maps?q=${MAP_LATITUDE},${MAP_LONGITUDE}&z=17&hl=en`,
      embedUrl: `https://www.google.com/maps?q=${MAP_LATITUDE},${MAP_LONGITUDE}&z=17&hl=en&output=embed`,
      linkLabel: "Open in Google Maps",
      homeHeading: "Where to find us",
      homeSupporting:
        "The primary operation is in Jinja, Uganda. The Tanzania branch is in Dodoma.",
    },
    services: publicServices,
    projects: featuredWork,
    projectMedia: portfolioMedia,
    siteMedia,
    portfolio: {
      heading: "Our work",
      introduction: "Explore a selection of fabrication, construction and industrial installation work delivered by Active Technical Services.",
      groups: portfolioGroups,
    },
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
      whatsappAlternativeText: assertPublicText(contactCopy.whatsappAlternativeText, "contact.whatsappAlternativeText"),
      emailAlternativeText: assertPublicText(contactCopy.emailAlternativeText, "contact.emailAlternativeText"),
      jinjaLocationLabel: assertPublicText(contactCopy.jinjaLocationLabel, "contact.jinjaLocationLabel"),
      tanzaniaBranchLabel,
      whatsappHeading: "Chat on WhatsApp",
      telephoneHeading: "Telephone",
      emailHeading: "Email",
      locationsHeading: "Where we work",
      mapHeading: "Tanzania branch location",
    },
    navigation: [
      { label: "Services", href: "/#what-we-do" },
      { label: "Portfolio", href: "/portfolio/" },
      { label: "Contact", href: "/contact/" },
    ],
    routes: ["/", "/contact/", "/portfolio/"],
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
  assert(
    !/24-hour|response time|same day|within \d+ (hour|day)/i.test(content.contact.introduction),
    "contact copy must not promise a response time",
  );
  assert(content.contacts.whatsapp.number === "256782318727", "WhatsApp number must be the approved Uganda primary line");
  assert(content.contacts.whatsapp.url.startsWith("https://wa.me/256782318727?text="), "WhatsApp URL is malformed");
  assert(content.map.latitude === -6.1683199 && content.map.longitude === 35.7260943, "map coordinates must match the supplied location");
  assert(content.map.embedUrl.endsWith("&output=embed"), "map embed URL must request the embed output");
  assert(!/head office|headquarters/i.test(content.map.label), "map must not be labelled as headquarters");
  assert(
    !/head office|headquarters/i.test(`${content.map.homeHeading} ${content.map.homeSupporting}`),
    "homepage map copy must not imply a headquarters",
  );
  assert(/Jinja/.test(content.map.homeSupporting) && /Dodoma/.test(content.map.homeSupporting), "homepage map copy must name both sites");
  assert(!content.routes.includes("/thank-you/"), "thank-you route must not be emitted");
  assert(!content.routes.some((route) => route.includes("walter")), "management routes must not be emitted");
  assert(content.projects.length === 6, "homepage featured-work selection is incomplete");
  assert(content.projectMedia.length >= 18, "portfolio media selection is incomplete");
  assert(content.latestWork.length === 0, "unapproved latest-work items must not be emitted");
  assert(content.navigation.length === 3, "visible primary navigation must have exactly three items");
  assert(content.navigation[0].label === "Services", "first nav item must be Services");
  assert(content.navigation.every((item) => item.label !== "Home"), "Home must not be a visible nav item");
  assert(content.identity.branch.role === "branch", "Tanzania must remain a branch");
  assert(content.identity.primaryOperation.displayName.startsWith("Jinja"), "Jinja must be primary");

  return content;
}

export function renderPublicContentFiles(content) {
  const json = `${JSON.stringify(content, null, 2)}\n`;
  const ts = `export const publicContent = ${JSON.stringify(content, null, 2)} as const;\n\nexport type PublicContent = typeof publicContent;\n`;
  return { json, ts };
}

export function writePublicContent(content = buildPublicContent()) {
  fs.mkdirSync(generatedDir, { recursive: true });
  const files = renderPublicContentFiles(content);
  fs.writeFileSync(path.join(generatedDir, "public-content.json"), files.json, "utf8");
  fs.writeFileSync(path.join(generatedDir, "public-content.ts"), files.ts, "utf8");
  return {
    jsonPath: "apps/web/src/generated/public-content.json",
    tsPath: "apps/web/src/generated/public-content.ts",
    files,
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
- context/canonical/company-media.json

All inputs are committed developer-managed files. The build reads nothing outside
the repository and requires no environment variable, database or network access.

## Public records emitted

- Identity: Active Technical Services / ATS / Gift of God
- Locations: Jinja primary operation; Dodoma branch
- Contacts: two Uganda telephones, one Tanzania telephone, one email, one WhatsApp action
- Services: ${result.content.services.length}
- Homepage copy slots: hero, services, about, portfolio CTA, closing CTA
- Curated company photography: hero, about, closing CTA, nine service cards, six featured-work tiles, and grouped portfolio gallery
- Contact copy slots: heading, introduction, alternatives, location labels, section headings
- Map: Tanzania branch location embed and external link
- Featured work: ${result.content.projects.length}
- Portfolio media: ${result.content.projectMedia.length}
- Routes: ${result.content.routes.join(", ")}

## Records withheld

- All 21 named canonical project records and their extracted source media
- Identifiable people
- Named clients
- Client logos
- Testimonials
- Social links
- Public prices

## Withholding reasons

Publication controls mark the named project collections as draft with
public_allowed=false. No reviewer, consent, or client permission has been
recorded for those records. The separately supplied company-image folder is
curated through context/canonical/company-media.json using generic capability
labels and no client names. Only the curated photographs committed under
apps/web/public/media/company/ are validated and published.

## Generated output paths

- ${result.jsonPath}
- ${result.tsPath}

## Validation result

Passed.
`;
  fs.writeFileSync(path.join(root, "project", "CONTENT-BUILD-REPORT.md"), report, "utf8");
}

if (process.argv[1] && path.basename(process.argv[1]) === "generate-public-content.mjs") {
  writeBuildReport(writePublicContent());
}
