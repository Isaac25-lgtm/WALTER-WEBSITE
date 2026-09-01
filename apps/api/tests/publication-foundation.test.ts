import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CONTENT_DRAFT_KEYS } from "@ats/contracts";
import { MemoryContentDraftRepository } from "../src/repositories/memory-content-draft-repository.js";
import { MemoryPublicationRepository } from "../src/repositories/memory-publication-repository.js";
import { PublicationPersistenceUnavailableError } from "../src/repositories/publication-repository.js";
import type { StoredPublication } from "../src/repositories/publication-repository.js";
import { CONTENT_DRAFT_REGISTRY } from "../src/content/registry.js";
import { hashPublicationEntries } from "../src/content/overlay-drafts.js";

const stamp = new Date("2026-09-01T12:00:00.000Z");
const subject = "admin-subject-1";

function emptyPublication(id: string, createdAt = stamp): StoredPublication {
  return {
    id,
    status: "prepared",
    contentHash: "a".repeat(64),
    entryCount: CONTENT_DRAFT_KEYS.length,
    createdAt,
    createdBySubject: subject,
    entries: [],
  };
}

describe("memory publication rollback", () => {
  it("rolls back after parent insertion", async () => {
    const drafts = new MemoryContentDraftRepository();
    const publications = new MemoryPublicationRepository(drafts);
    publications.failAfterParentInsert = true;
    await expect(
      publications.preparePublication({ createdBySubject: subject, expectedDraftVersions: {} }),
    ).rejects.toBeInstanceOf(PublicationPersistenceUnavailableError);
    expect(publications.records).toHaveLength(0);
    expect(publications.entryRows).toHaveLength(0);
  });

  it("rolls back during entry insertion", async () => {
    const drafts = new MemoryContentDraftRepository();
    const publications = new MemoryPublicationRepository(drafts);
    publications.failDuringEntryInsert = true;
    await expect(
      publications.preparePublication({ createdBySubject: subject, expectedDraftVersions: {} }),
    ).rejects.toBeInstanceOf(PublicationPersistenceUnavailableError);
    expect(publications.records).toHaveLength(0);
    expect(publications.entryRows).toHaveLength(0);
  });

  it("rolls back after a partial entry insert", async () => {
    const drafts = new MemoryContentDraftRepository();
    const publications = new MemoryPublicationRepository(drafts);
    publications.failAfterPartialEntryInsert = true;
    await expect(
      publications.preparePublication({ createdBySubject: subject, expectedDraftVersions: {} }),
    ).rejects.toBeInstanceOf(PublicationPersistenceUnavailableError);
    expect(publications.records).toHaveLength(0);
    expect(publications.entryRows).toHaveLength(0);
    expect(publications.entryRows.some((row) => row.entry.key === "homepage.heroHeading")).toBe(false);
  });
});

describe("memory publication pagination", () => {
  it("pages identical timestamps by id descending without duplicates or omissions", async () => {
    const repository = new MemoryPublicationRepository();
    repository.seed(emptyPublication("00000000-0000-4000-8000-000000000001"));
    repository.seed(emptyPublication("00000000-0000-4000-8000-000000000002"));
    repository.seed(emptyPublication("00000000-0000-4000-8000-000000000003"));
    const first = await repository.listPublications({ limit: 2 });
    expect(first.publications.map((item) => item.id)).toEqual([
      "00000000-0000-4000-8000-000000000003",
      "00000000-0000-4000-8000-000000000002",
    ]);
    expect(first.nextCursor).toEqual(expect.any(String));
    const second = await repository.listPublications({
      limit: 2,
      cursor: { createdAt: stamp, id: "00000000-0000-4000-8000-000000000002" },
    });
    expect(second.publications.map((item) => item.id)).toEqual(["00000000-0000-4000-8000-000000000001"]);
    expect(second.nextCursor).toBeNull();
    const ids = [...first.publications, ...second.publications].map((item) => item.id);
    expect(new Set(ids).size).toBe(3);
  });
});

describe("simultaneous publication prepares", () => {
  it("serializes two all-canonical prepares without losing either publication", async () => {
    const drafts = new MemoryContentDraftRepository();
    const publications = new MemoryPublicationRepository(drafts);
    const [first, second] = await Promise.all([
      publications.preparePublication({ createdBySubject: subject, expectedDraftVersions: {} }),
      publications.preparePublication({ createdBySubject: subject, expectedDraftVersions: {} }),
    ]);
    expect(first.id).not.toBe(second.id);
    expect(publications.records).toHaveLength(2);
    expect(first.contentHash).toBe(second.contentHash);
    expect(first.contentHash).toBe(hashPublicationEntries(first.entries));
  });
});

describe("publication hash stability", () => {
  it("keeps SHA-256 stable for the same sorted entries", () => {
    const drafts = new MemoryContentDraftRepository();
    const left = CONTENT_DRAFT_KEYS.map((key) => ({
      key,
      value: CONTENT_DRAFT_REGISTRY[key].canonicalValue,
      source: "canonical" as const,
      sourceDraftVersion: null,
    }));
    const right = [...left].reverse();
    expect(hashPublicationEntries(left)).toBe(hashPublicationEntries(right));
    expect(hashPublicationEntries(left)).toMatch(/^[a-f0-9]{64}$/);
    expect(createHash("sha256").update("not-the-publication").digest("hex")).not.toBe(hashPublicationEntries(left));
    expect(drafts.records.size).toBe(0);
  });
});
