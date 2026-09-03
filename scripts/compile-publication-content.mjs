import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildContentDraftFields, buildPublicContent } from "./generate-public-content.mjs";

export class PublicationCompileError extends Error {
  constructor(message) {
    super(message);
    this.name = "PublicationCompileError";
  }
}

function assert(condition, message) {
  if (!condition) throw new PublicationCompileError(message);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function setBySelector(target, selector, value) {
  const parts = selector.split(".");
  let current = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    const key = /^\d+$/.test(part) ? Number(part) : part;
    current = current[key];
    assert(current != null, `canonical selector ${selector} is missing`);
  }
  const last = parts[parts.length - 1];
  const key = /^\d+$/.test(last) ? Number(last) : last;
  assert(current != null && Object.prototype.hasOwnProperty.call(current, key), `canonical selector ${selector} is missing`);
  current[key] = value;
}

export function hashPublicationEntries(entries) {
  const ordered = [...entries].sort((left, right) => left.key.localeCompare(right.key));
  const payload = JSON.stringify({
    entries: ordered.map((entry) => ({
      key: entry.key,
      value: entry.value,
      source: entry.source,
      sourceDraftVersion: entry.sourceDraftVersion,
    })),
  });
  return createHash("sha256").update(payload).digest("hex");
}

export function compilePublicationContent(canonical, publication, fields = buildContentDraftFields()) {
  assert(publication && publication.status === "prepared", "publication status must be prepared");
  assert(Array.isArray(publication.entries), "publication entries are required");
  assert(publication.entryCount === publication.entries.length, "entryCount must match entries");

  const seen = new Set();
  const fieldByKey = new Map(fields.map((field) => [field.key, field]));
  const controlledKeys = fields.map((field) => field.key);
  assert(fields.length > 0 && fieldByKey.size === fields.length, "controlled field registry must contain unique keys");
  assert(publication.entries.length === controlledKeys.length, "publication must include every controlled key");
  for (const entry of publication.entries) {
    assert(typeof entry.key === "string" && fieldByKey.has(entry.key), `unknown publication entry ${entry.key}`);
    assert(!seen.has(entry.key), `duplicate publication entry ${entry.key}`);
    seen.add(entry.key);
    const field = fieldByKey.get(entry.key);
    assert(field.plainTextPolicy === "plain_text_no_html", `${entry.key} plain-text policy is invalid`);
    assert(typeof entry.value === "string" && entry.value.length > 0, `${entry.key} value is required`);
    assert(!entry.value.includes("<") && !entry.value.includes(">"), `${entry.key} must remain plain text`);
    assert(entry.value.length >= field.minLength && entry.value.length <= field.maxLength, `${entry.key} length is invalid`);
    assert(entry.source === "canonical" || entry.source === "draft", `${entry.key} source is invalid`);
    if (entry.source === "canonical") {
      assert(entry.sourceDraftVersion == null, `${entry.key} canonical sourceDraftVersion must be null`);
    } else {
      assert(Number.isInteger(entry.sourceDraftVersion) && entry.sourceDraftVersion >= 1, `${entry.key} draft version is invalid`);
    }
  }
  for (const key of controlledKeys) {
    assert(seen.has(key), `missing publication entry ${key}`);
  }

  const expectedHash = hashPublicationEntries(publication.entries);
  assert(publication.contentHash === expectedHash, "publication contentHash does not match SHA-256");

  const compiled = cloneJson(canonical);
  for (const entry of publication.entries) {
    const field = fieldByKey.get(entry.key);
    setBySelector(compiled, field.canonicalSelector, entry.value);
  }

  assert(!("contentHash" in compiled), "publication metadata must not leak");
  assert(!("createdBySubject" in compiled), "publication metadata must not leak");
  assert(!("entries" in compiled), "publication entries must not leak into public content");
  assert(compiled.status !== "prepared", "publication status must not leak into public content");
  return compiled;
}

function canonicalEntries(fields) {
  return fields.map((field) => ({
    key: field.key,
    value: field.canonicalValue,
    source: "canonical",
    sourceDraftVersion: null,
  }));
}

export function runCompilePublicationTest() {
  const canonical = buildPublicContent();
  const fields = buildContentDraftFields();
  const allCanonicalEntries = canonicalEntries(fields).sort((left, right) => left.key.localeCompare(right.key));
  const allCanonicalPublication = {
    id: "33333333-3333-4333-8333-333333333333",
    status: "prepared",
    contentHash: hashPublicationEntries(allCanonicalEntries),
    entryCount: allCanonicalEntries.length,
    createdAt: "2026-09-01T08:00:00.000Z",
    createdBySubject: "admin-subject-1",
    entries: allCanonicalEntries,
  };
  const allCanonicalCompiled = compilePublicationContent(canonical, allCanonicalPublication, fields);
  assert(allCanonicalCompiled.homepage.heroHeading === canonical.homepage.heroHeading, "canonical compile changed hero heading");
  assert(allCanonicalCompiled.identity.publicName === canonical.identity.publicName, "locked identity was rewritten");
  assert(allCanonicalCompiled.homepage.portfolioCtaLabel === canonical.homepage.portfolioCtaLabel, "locked homepage field was rewritten");
  assert(allCanonicalCompiled.contact.formUnavailableMessage === canonical.contact.formUnavailableMessage, "locked contact field was rewritten");
  assert(!JSON.stringify(allCanonicalCompiled).includes("admin-subject-1"), "administrator subject leaked");

  const overlayEntries = allCanonicalEntries.map((entry) =>
    entry.key === "homepage.heroHeading"
      ? {
          key: entry.key,
          value: "Local compiled heading",
          source: "draft",
          sourceDraftVersion: 1,
        }
      : entry,
  );
  const overlayPublication = {
    ...allCanonicalPublication,
    contentHash: hashPublicationEntries(overlayEntries),
    entries: overlayEntries,
  };
  const overlayCompiled = compilePublicationContent(canonical, overlayPublication, fields);
  assert(overlayCompiled.homepage.heroHeading === "Local compiled heading", "selected draft was not applied");
  assert(overlayCompiled.contact.heading === canonical.contact.heading, "omitted contact heading must stay canonical");
  assert(overlayCompiled.services.length === 9, "locked services were rewritten");
  assert(overlayCompiled.projects.length === canonical.projects.length, "locked featured work was rewritten");
  assert(overlayCompiled.clientNames.length === 0, "withheld client names leaked");

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ats-compile-publication-"));
  const tempFile = path.join(tempDir, "compiled-public-content.json");
  try {
    fs.writeFileSync(tempFile, `${JSON.stringify(overlayCompiled, null, 2)}\n`, "utf8");
    const roundTrip = JSON.parse(fs.readFileSync(tempFile, "utf8"));
    assert(roundTrip.homepage.heroHeading === "Local compiled heading", "temporary compile output was not readable");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  const official = JSON.parse(
    fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../apps/web/src/generated/public-content.json"), "utf8"),
  );
  assert(official.homepage.heroHeading === canonical.homepage.heroHeading, "official generated content is no longer canonical");
  assert(official.homepage.heroHeading !== "Local compiled heading", "compiled draft leaked into official content");
}

if (process.argv.includes("--test")) {
  runCompilePublicationTest();
  console.log("content:compile-publication:test passed");
}
