import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPublicContent,
  renderContentDraftFieldFiles,
  renderPublicContentFiles,
} from "./generate-public-content.mjs";

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
  "WhatsApp",
  "whatsapp",
];

function fail(message) {
  throw new Error(message);
}

const expected = renderPublicContentFiles(buildPublicContent());
const expectedDraftFields = renderContentDraftFieldFiles();
const jsonPath = path.join(generatedDir, "public-content.json");
const tsPath = path.join(generatedDir, "public-content.ts");
const webDraftFieldsPath = path.join(generatedDir, "content-draft-fields.ts");
const apiDraftFieldsPath = path.join(root, "apps", "api", "src", "generated", "content-draft-fields.ts");

if (!fs.existsSync(jsonPath) || !fs.existsSync(tsPath)) {
  fail("Generated public content is missing. Run npm.cmd run content:generate.");
}
if (!fs.existsSync(webDraftFieldsPath) || !fs.existsSync(apiDraftFieldsPath)) {
  fail("Generated content-draft fields are missing. Run npm.cmd run content:generate.");
}

const actualJson = fs.readFileSync(jsonPath, "utf8");
const actualTs = fs.readFileSync(tsPath, "utf8");
const actualWebFields = fs.readFileSync(webDraftFieldsPath, "utf8");
const actualApiFields = fs.readFileSync(apiDraftFieldsPath, "utf8");

if (actualJson !== expected.json) fail("Generated public-content.json is stale.");
if (actualTs !== expected.ts) fail("Generated public-content.ts is stale.");
if (actualWebFields !== expectedDraftFields.ts) fail("Generated web content-draft-fields.ts is stale.");
if (actualApiFields !== expectedDraftFields.ts) fail("Generated API content-draft-fields.ts is stale.");
if (actualWebFields !== actualApiFields) fail("Generated content-draft field artifacts have diverged.");

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
if (/whatsapp/i.test(parsed.contact.formUnavailableMessage) || /head office/i.test(parsed.contact.tanzaniaBranchLabel)) {
  fail("Contact copy contains forbidden claims.");
}
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
