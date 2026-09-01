import { and, desc, eq, inArray, lt, or } from "drizzle-orm";
import {
  contentPublicationEntrySchema,
  type ContentDraftKey,
  type ContentPublicationEntry,
} from "@ats/contracts";
import { compilePreparedPublication, PublicationEntryValidationError } from "../content/overlay-drafts.js";
import { contentDrafts, contentPublicationEntries, contentPublications } from "../db/schema/index.js";
import type { AppDatabase } from "../db/client.js";
import { encodeInquiryCursor } from "../lib/inquiry-cursor.js";
import {
  ContentDraftPersistenceUnavailableError,
  ContentDraftVersionConflictError,
  type StoredContentDraft,
} from "./content-draft-repository.js";
import type {
  ListPublicationsQuery,
  PreparePublicationInput,
  PublicationListPage,
  PublicationRepository,
  StoredPublication,
} from "./publication-repository.js";
import { PublicationPersistenceUnavailableError } from "./publication-repository.js";

function textFromJson(value: unknown): string {
  if (typeof value === "object" && value !== null && "text" in value && typeof value.text === "string") {
    return value.text;
  }
  throw new ContentDraftPersistenceUnavailableError();
}

function toDraft(row: {
  key: string;
  value: unknown;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  updatedBySubject: string;
}): StoredContentDraft {
  return {
    key: row.key as ContentDraftKey,
    value: textFromJson(row.value),
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    updatedBySubject: row.updatedBySubject,
  };
}

function toEntry(row: {
  key: string;
  value: string;
  source: "canonical" | "draft";
  sourceDraftVersion: number | null;
}): ContentPublicationEntry {
  return contentPublicationEntrySchema.parse({
    key: row.key as ContentDraftKey,
    value: row.value,
    source: row.source,
    sourceDraftVersion: row.sourceDraftVersion,
  });
}

export class DrizzlePublicationRepository implements PublicationRepository {
  private readonly db: AppDatabase;

  constructor(database: AppDatabase) {
    this.db = database;
  }

  async listPublications(query: ListPublicationsQuery): Promise<PublicationListPage> {
    try {
      const filters = [];
      if (query.cursor) {
        filters.push(
          or(
            lt(contentPublications.createdAt, query.cursor.createdAt),
            and(eq(contentPublications.createdAt, query.cursor.createdAt), lt(contentPublications.id, query.cursor.id)),
          )!,
        );
      }
      const rows = await this.db
        .select({
          id: contentPublications.id,
          status: contentPublications.status,
          contentHash: contentPublications.contentHash,
          entryCount: contentPublications.entryCount,
          createdAt: contentPublications.createdAt,
        })
        .from(contentPublications)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(contentPublications.createdAt), desc(contentPublications.id))
        .limit(query.limit + 1);
      const hasMore = rows.length > query.limit;
      const pageRows = hasMore ? rows.slice(0, query.limit) : rows;
      const last = pageRows[pageRows.length - 1];
      return {
        publications: pageRows.map((row) => ({
          id: row.id,
          status: "prepared" as const,
          contentHash: row.contentHash,
          entryCount: row.entryCount,
          createdAt: row.createdAt,
        })),
        nextCursor: hasMore && last ? encodeInquiryCursor(last.createdAt, last.id) : null,
      };
    } catch {
      throw new PublicationPersistenceUnavailableError();
    }
  }

  async getPublication(id: string): Promise<StoredPublication | null> {
    try {
      const [row] = await this.db
        .select()
        .from(contentPublications)
        .where(eq(contentPublications.id, id))
        .limit(1);
      if (!row) return null;
      const entryRows = await this.db
        .select()
        .from(contentPublicationEntries)
        .where(eq(contentPublicationEntries.publicationId, id));
      return {
        id: row.id,
        status: "prepared",
        contentHash: row.contentHash,
        entryCount: row.entryCount,
        createdAt: row.createdAt,
        createdBySubject: row.createdBySubject,
        entries: entryRows.map(toEntry).sort((left, right) => left.key.localeCompare(right.key)),
      };
    } catch {
      throw new PublicationPersistenceUnavailableError();
    }
  }

  async preparePublication(input: PreparePublicationInput): Promise<StoredPublication> {
    try {
      return await this.db.transaction(async (tx) => {
        const requestedKeys = Object.keys(input.expectedDraftVersions) as ContentDraftKey[];
        const lockedRows =
          requestedKeys.length === 0
            ? []
            : await tx
                .select()
                .from(contentDrafts)
                .where(inArray(contentDrafts.key, requestedKeys))
                .for("update");
        const prepared = compilePreparedPublication(input.expectedDraftVersions, lockedRows.map(toDraft));
        const [row] = await tx
          .insert(contentPublications)
          .values({
            status: "prepared",
            contentHash: prepared.contentHash,
            entryCount: prepared.entries.length,
            createdBySubject: input.createdBySubject,
          })
          .returning();
        if (!row) throw new PublicationPersistenceUnavailableError();
        await tx.insert(contentPublicationEntries).values(
          prepared.entries.map((entry) => ({
            publicationId: row.id,
            key: entry.key,
            value: entry.value,
            source: entry.source,
            sourceDraftVersion: entry.sourceDraftVersion,
          })),
        );
        return {
          id: row.id,
          status: "prepared" as const,
          contentHash: row.contentHash,
          entryCount: row.entryCount,
          createdAt: row.createdAt,
          createdBySubject: row.createdBySubject,
          entries: prepared.entries.map((entry) => ({ ...entry })),
        };
      });
    } catch (error) {
      if (
        error instanceof ContentDraftVersionConflictError ||
        error instanceof ContentDraftPersistenceUnavailableError ||
        error instanceof PublicationPersistenceUnavailableError ||
        error instanceof PublicationEntryValidationError
      ) {
        throw error;
      }
      throw new PublicationPersistenceUnavailableError();
    }
  }
}
