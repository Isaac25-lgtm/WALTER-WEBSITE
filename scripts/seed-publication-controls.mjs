import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const canonicalDir = path.join(root, "context", "canonical");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(canonicalDir, name), "utf8"));
}

function record(id, reason, sourceReference = null) {
  return {
    id,
    state: "draft",
    public_allowed: false,
    reason,
    source_reference: sourceReference,
    reviewed_by: null,
    reviewed_at: null,
  };
}

const projectsFile = readJson("projects.json");
const peopleFile = readJson("people.json");

const projects = projectsFile.projects.map((project) =>
  record(
    project.id,
    "Publication review required before any project record may appear on the public site.",
    project.source_provenance ?? null,
  ),
);

const mediaIds = [];
for (const project of projectsFile.projects) {
  if (project.primary_image_asset_id) mediaIds.push(project.primary_image_asset_id);
  for (const id of project.gallery_image_asset_ids ?? []) mediaIds.push(id);
}

const project_media = [...new Set(mediaIds)].sort().map((id) =>
  record(id, "Project media remains draft until publication rights are confirmed.", id),
);

const identifiable_people = peopleFile.people.map((person) =>
  record(
    person.id,
    "Identifiable people are not public until consent and role confirmation exist.",
    person.provenance ?? null,
  ),
);

const clientNames = [
  ...new Set(projectsFile.projects.map((project) => project.client).filter(Boolean)),
].sort();

const client_names = clientNames.map((name) =>
  record(
    `client:${name}`,
    "Named clients are not public until permission is confirmed.",
    name,
  ),
);

const payload = {
  pricing_mode: "quote_only",
  collections: {
    projects,
    project_media,
    identifiable_people,
    client_names,
    client_logos: [],
    testimonials: [],
    social_links: [],
    map_coordinates: [],
    public_prices: [],
  },
};

const outPath = path.join(canonicalDir, "publication-controls.json");
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log("Wrote", outPath);
