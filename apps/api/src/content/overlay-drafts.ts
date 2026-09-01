import { createHash } from "node:crypto";
import {
  CONTENT_DRAFT_KEYS,
  contentDraftValueSchema,
  type ContentDraftKey,
  type ContentPublicationEntry,
} from "@ats/contracts";
import { CONTENT_DRAFT_REGISTRY } from "./registry.js";
import {
  ContentDraftVersionConflictError,
  type StoredContentDraft,
} from "../repositories/content-draft-repository.js";

export class PublicationEntryValidationError extends Error {
  override readonly name = "PublicationEntryValidationError";
}

function canonicalEntry(key: ContentDraftKey): ContentPublicationEntry {
  return {
    key,
    value: CONTENT_DRAFT_REGISTRY[key].canonicalValue,
    source: "canonical",
    sourceDraftVersion: null,
  };
}

function validatePublicationEntry(entry: ContentPublicationEntry): void {
  const definition = CONTENT_DRAFT_REGISTRY[entry.key];
  const parsed = contentDraftValueSchema.safeParse(entry.value);
  if (!parsed.success) throw new PublicationEntryValidationError();
  if (entry.value.length < definition.minLength || entry.value.length > definition.maxLength) {
    throw new PublicationEntryValidationError();
  }
  if (entry.source === "draft") {
    if (entry.sourceDraftVersion == null || entry.sourceDraftVersion < 1) {
      throw new PublicationEntryValidationError();
    }
    return;
  }
  if (entry.sourceDraftVersion != null) throw new PublicationEntryValidationError();
}

export function compilePreparedPublication(
  expectedDraftVersions: Record<string, number>,
  lockedDrafts: readonly StoredContentDraft[],
): { entries: ContentPublicationEntry[]; contentHash: string } {
  const byKey = new Map(lockedDrafts.map((item) => [item.key, item]));
  const entries = CONTENT_DRAFT_KEYS.map((key) => {
    if (!Object.prototype.hasOwnProperty.call(expectedDraftVersions, key)) {
      return canonicalEntry(key);
    }
    const expectedVersion = expectedDraftVersions[key];
    if (expectedVersion == null || expectedVersion < 1) {
      throw new PublicationEntryValidationError();
    }
    const draft = byKey.get(key) ?? null;
    const liveVersion = draft?.version ?? 0;
    if (liveVersion !== expectedVersion || !draft) {
      throw new ContentDraftVersionConflictError(draft);
    }
    return {
      key,
      value: draft.value,
      source: "draft" as const,
      sourceDraftVersion: draft.version,
    };
  });
  entries.sort((left, right) => left.key.localeCompare(right.key));
  for (const entry of entries) validatePublicationEntry(entry);
  return { entries, contentHash: hashPublicationEntries(entries) };
}

export function hashPublicationEntries(entries: ContentPublicationEntry[]): string {
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
