import { describe, expect, it } from "vitest";
import { CONTENT_DRAFT_KEYS } from "@ats/contracts";
import {
  compilePreparedPublication,
  hashPublicationEntries,
  PublicationEntryValidationError,
} from "../src/content/overlay-drafts.js";
import { ContentDraftVersionConflictError, type StoredContentDraft } from "../src/repositories/content-draft-repository.js";
import { MemoryContentDraftRepository } from "../src/repositories/memory-content-draft-repository.js";
import { MemoryPublicationRepository } from "../src/repositories/memory-publication-repository.js";
import { CONTENT_DRAFT_REGISTRY } from "../src/content/registry.js";

function draft(key: StoredContentDraft["key"], value: string, version: number): StoredContentDraft {
  const now = new Date("2026-09-01T08:00:00.000Z");
  return {
    key,
    value,
    version,
    createdAt: now,
    updatedAt: now,
    updatedBySubject: "admin-subject-1",
  };
}

describe("selected-draft publication compile", () => {
  it("uses canonical copy for omitted keys even when other drafts are locked", () => {
    const prepared = compilePreparedPublication(
      { "homepage.heroHeading": 1 },
      [
        draft("homepage.heroHeading", "Local draft heading", 1),
        draft("contact.heading", "Ignored contact heading", 1),
      ],
    );
    expect(prepared.entries).toHaveLength(CONTENT_DRAFT_KEYS.length);
    expect(prepared.entries.map((entry) => entry.key)).toEqual(
      [...CONTENT_DRAFT_KEYS].sort((left, right) => left.localeCompare(right)),
    );
    expect(prepared.entries.find((entry) => entry.key === "homepage.heroHeading")).toEqual({
      key: "homepage.heroHeading",
      value: "Local draft heading",
      source: "draft",
      sourceDraftVersion: 1,
    });
    expect(prepared.entries.find((entry) => entry.key === "contact.heading")).toEqual({
      key: "contact.heading",
      value: CONTENT_DRAFT_REGISTRY["contact.heading"].canonicalValue,
      source: "canonical",
      sourceDraftVersion: null,
    });
    expect(prepared.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("treats an empty selection as an all-canonical publication", () => {
    const prepared = compilePreparedPublication({}, [draft("homepage.heroHeading", "Local draft heading", 1)]);
    expect(prepared.entries.every((entry) => entry.source === "canonical")).toBe(true);
    expect(prepared.entries.find((entry) => entry.key === "homepage.heroHeading")?.value).toBe(
      CONTENT_DRAFT_REGISTRY["homepage.heroHeading"].canonicalValue,
    );
  });

  it("conflicts when a selected draft version does not match", () => {
    expect(() =>
      compilePreparedPublication({ "homepage.heroHeading": 2 }, [
        draft("homepage.heroHeading", "Local draft heading", 1),
      ]),
    ).toThrow(ContentDraftVersionConflictError);
  });

  it("rejects listed version 0 instead of treating it as a missing draft", () => {
    expect(() =>
      compilePreparedPublication({ "homepage.heroHeading": 0 }, [
        draft("homepage.heroHeading", "Local draft heading", 1),
      ]),
    ).toThrow(PublicationEntryValidationError);
    expect(() => compilePreparedPublication({ "homepage.heroHeading": 0 }, [])).toThrow(
      PublicationEntryValidationError,
    );
  });

  it("rejects invalid compiled values and hashes entries in key order", () => {
    expect(() =>
      compilePreparedPublication({ "homepage.heroHeading": 1 }, [
        draft("homepage.heroHeading", "<p>no</p>", 1),
      ]),
    ).toThrow(PublicationEntryValidationError);
    const prepared = compilePreparedPublication({}, []);
    expect(hashPublicationEntries([...prepared.entries].reverse())).toBe(prepared.contentHash);
  });
});

describe("memory publication prepare", () => {
  it("commits nothing when a selected draft version conflicts", async () => {
    const drafts = new MemoryContentDraftRepository();
    await drafts.saveDraft("homepage.heroHeading", "Local draft heading", 0, "admin-subject-1");
    const publications = new MemoryPublicationRepository(drafts);
    await expect(
      publications.preparePublication({
        createdBySubject: "admin-subject-1",
        expectedDraftVersions: { "homepage.heroHeading": 2 },
      }),
    ).rejects.toBeInstanceOf(ContentDraftVersionConflictError);
    expect(publications.records).toHaveLength(0);
  });
});
