import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPublicContent, renderPublicContentFiles } from "./generate-public-content.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generatedDir = path.join(root, "apps", "web", "src", "generated");

const FORBIDDEN = [
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
];

function fail(message) {
  throw new Error(message);
}

const expected = renderPublicContentFiles(buildPublicContent());
const jsonPath = path.join(generatedDir, "public-content.json");
const tsPath = path.join(generatedDir, "public-content.ts");

if (!fs.existsSync(jsonPath) || !fs.existsSync(tsPath)) {
  fail("Generated public content is missing. Run npm run content:generate.");
}

const actualJson = fs.readFileSync(jsonPath, "utf8");
const actualTs = fs.readFileSync(tsPath, "utf8");

if (actualJson !== expected.json) fail("Generated public-content.json is stale.");
if (actualTs !== expected.ts) fail("Generated public-content.ts is stale.");

const combined = `${actualJson}\n${actualTs}`;
for (const needle of FORBIDDEN) {
  if (combined.includes(needle)) fail(`Generated content contains forbidden token: ${needle}`);
}

const parsed = JSON.parse(actualJson);
if (parsed.services.length !== 9) fail("Service count is not exactly nine.");
if (parsed.projects.length !== 6) fail("Featured-work selection is incomplete.");
if (parsed.clientNames.length !== 0) fail("Unapproved client names leaked.");
if (parsed.projectMedia.length < 18) fail("Portfolio media selection is incomplete.");
if (parsed.prices.length !== 0) fail("Public prices leaked.");
for (const asset of [
  parsed.siteMedia.hero,
  parsed.siteMedia.about,
  parsed.siteMedia.closingCta,
  ...parsed.services.map((service) => service.image),
  ...parsed.projects.map((project) => project.image),
  ...parsed.projectMedia.map((item) => item.image),
]) {
  if (!asset.src.startsWith("/media/company/") || !asset.alt || !asset.width || !asset.height) {
    fail(`Invalid public company media record: ${asset.id ?? "unknown"}`);
  }
  if (!fs.existsSync(path.join(root, "apps", "web", "public", asset.src))) {
    fail(`Public company media file is missing: ${asset.src}`);
  }
}
if (!parsed.homepage || parsed.homepage.heroHeading !== "Engineering, fabrication and construction solutions") {
  fail("Homepage copy is missing from the public snapshot.");
}
if (!parsed.contact || parsed.contact.heading !== "Contact Us") {
  fail("Contact copy is missing from the public snapshot.");
}
if (/head office|headquarters/i.test(`${parsed.contact.tanzaniaBranchLabel} ${parsed.map.label}`)) {
  fail("Tanzania must not be presented as the head office.");
}
if (parsed.contacts.whatsapp.number !== "256782318727") fail("WhatsApp number is not the approved Uganda primary line.");
if (!parsed.contacts.whatsapp.url.startsWith("https://wa.me/256782318727?text=")) fail("WhatsApp URL is malformed.");
if (parsed.map.latitude !== -6.1683199 || parsed.map.longitude !== 35.7260943) fail("Map coordinates do not match the supplied location.");
if (!parsed.map.embedUrl.endsWith("&output=embed")) fail("Map embed URL must request the embed output.");
if (parsed.routes.includes("/thank-you/")) fail("The thank-you route must not be published.");
if (parsed.routes.some((route) => route.includes("walter"))) fail("Management routes must not be published.");
if (JSON.stringify(parsed).includes("canonical_field") || JSON.stringify(parsed).includes("editorial_note")) {
  fail("Homepage provenance leaked into the public snapshot.");
}
if (parsed.navigation.length !== 3) fail("Visible primary navigation must have exactly three items.");
if (parsed.navigation[0].label !== "Services" || parsed.navigation[1].label !== "Portfolio" || parsed.navigation[2].label !== "Contact") {
  fail("Visible primary navigation must be Services, Portfolio, Contact.");
}
if (parsed.navigation.some((item) => item.label === "Home")) fail("Home must not appear as a visible nav item.");
if (parsed.identity.primaryOperation.displayName !== "Jinja, Uganda") {
  fail("Jinja is not the primary operation.");
}
if (parsed.identity.branch.role !== "branch") fail("Tanzania is not represented as a branch.");
if (!fs.existsSync(path.join(root, "context", "canonical", "publication-controls.json"))) {
  fail("canonical publication controls are missing");
}

console.log("Public content is fresh and leak-free.");
