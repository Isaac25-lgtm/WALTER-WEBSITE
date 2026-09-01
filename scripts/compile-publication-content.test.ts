import { describe, expect, it } from "vitest";
import {
  compilePublicationContent,
  hashPublicationEntries,
  runCompilePublicationTest,
} from "./compile-publication-content.mjs";
import { buildContentDraftFields, buildPublicContent } from "./generate-public-content.mjs";

function validPublication() {
  const entries = buildContentDraftFields()
    .map((field) => ({
      key: field.key,
      value: field.canonicalValue,
      source: "canonical" as const,
      sourceDraftVersion: null,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
  return {
    status: "prepared" as const,
    contentHash: hashPublicationEntries(entries),
    entryCount: entries.length,
    entries,
  };
}

describe("publication public-content compiler", () => {
  it("runs the temporary compile test without rewriting official content", () => {
    expect(() => runCompilePublicationTest()).not.toThrow();
    const official = buildPublicContent();
    expect(official.homepage.heroHeading).toBe("Engineering, fabrication and construction solutions");
    expect(official.homepage.heroHeading).not.toBe("Local compiled heading");
  });

  it("rejects a publication that is not prepared", () => {
    expect(() =>
      compilePublicationContent(buildPublicContent(), {
        status: "draft",
        contentHash: "a".repeat(64),
        entryCount: 0,
        entries: [],
      }),
    ).toThrow(/prepared/);
  });

  it("rejects duplicate, unknown, and missing controlled entries", () => {
    const canonical = buildPublicContent();
    const duplicate = validPublication();
    duplicate.entries[1] = { ...duplicate.entries[0] };
    duplicate.contentHash = hashPublicationEntries(duplicate.entries);
    expect(() => compilePublicationContent(canonical, duplicate)).toThrow(/duplicate/);

    const unknown = validPublication();
    unknown.entries[0] = { ...unknown.entries[0], key: "unknown.copyKey" };
    unknown.contentHash = hashPublicationEntries(unknown.entries);
    expect(() => compilePublicationContent(canonical, unknown)).toThrow(/unknown/);

    const missing = validPublication();
    missing.entries.pop();
    missing.entryCount = missing.entries.length;
    missing.contentHash = hashPublicationEntries(missing.entries);
    expect(() => compilePublicationContent(canonical, missing)).toThrow(/every controlled key/);
  });

  it("rejects HTML, invalid lengths, and invalid source versions", () => {
    const canonical = buildPublicContent();
    const html = validPublication();
    html.entries[0] = { ...html.entries[0], value: "<strong>Unsafe</strong>" };
    html.contentHash = hashPublicationEntries(html.entries);
    expect(() => compilePublicationContent(canonical, html)).toThrow(/plain text/);

    const tooLong = validPublication();
    tooLong.entries[0] = { ...tooLong.entries[0], value: "x".repeat(121) };
    tooLong.contentHash = hashPublicationEntries(tooLong.entries);
    expect(() => compilePublicationContent(canonical, tooLong)).toThrow(/length/);

    const badVersion = validPublication();
    badVersion.entries[0] = {
      ...badVersion.entries[0],
      source: "draft",
      sourceDraftVersion: 0,
    };
    badVersion.contentHash = hashPublicationEntries(badVersion.entries);
    expect(() => compilePublicationContent(canonical, badVersion)).toThrow(/draft version/);
  });

  it("rejects a mismatched publication hash", () => {
    const publication = validPublication();
    publication.contentHash = "a".repeat(64);
    expect(() => compilePublicationContent(buildPublicContent(), publication)).toThrow(/contentHash/);
  });

  it("derives exact keys from the generated field registry and rejects duplicate registry keys", () => {
    const fields = buildContentDraftFields();
    const publication = validPublication();
    expect(() => compilePublicationContent(buildPublicContent(), publication, [...fields, fields[0]])).toThrow(
      /unique keys/,
    );
  });

  it("refuses to create a value at a missing canonical selector", () => {
    const fields = buildContentDraftFields();
    const publication = validPublication();
    const brokenFields = fields.map((field, index) =>
      index === 0 ? { ...field, canonicalSelector: "homepage.missingHeading" } : field,
    );
    expect(() => compilePublicationContent(buildPublicContent(), publication, brokenFields)).toThrow(/selector/);
  });
});
