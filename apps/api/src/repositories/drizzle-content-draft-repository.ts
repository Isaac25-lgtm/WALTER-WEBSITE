import { and, eq } from "drizzle-orm";
import type { ContentDraftKey } from "@ats/contracts";
import { contentDrafts } from "../db/schema/index.js";
import type { AppDatabase } from "../db/client.js";
import type { ContentDraftRepository, StoredContentDraft } from "./content-draft-repository.js";
import {
  ContentDraftPersistenceUnavailableError,
  ContentDraftVersionConflictError,
} from "./content-draft-repository.js";

function textFromJson(value: unknown): string {
  if (typeof value === "object" && value !== null && "text" in value && typeof value.text === "string") {
    return value.text;
  }
  throw new ContentDraftPersistenceUnavailableError();
}

function toStored(row: {
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

export class DrizzleContentDraftRepository implements ContentDraftRepository {
  private readonly db: AppDatabase;

  constructor(database: AppDatabase) {
    this.db = database;
  }

  async listDrafts(): Promise<StoredContentDraft[]> {
    try {
      const rows = await this.db.select().from(contentDrafts);
      return rows.map(toStored);
    } catch {
      throw new ContentDraftPersistenceUnavailableError();
    }
  }

  async getDraft(key: ContentDraftKey): Promise<StoredContentDraft | null> {
    try {
      const [row] = await this.db.select().from(contentDrafts).where(eq(contentDrafts.key, key)).limit(1);
      return row ? toStored(row) : null;
    } catch {
      throw new ContentDraftPersistenceUnavailableError();
    }
  }

  async saveDraft(
    key: ContentDraftKey,
    value: string,
    expectedVersion: number,
    updatedBySubject: string,
  ): Promise<StoredContentDraft> {
    try {
      const now = new Date();
      if (expectedVersion === 0) {
        const [row] = await this.db
          .insert(contentDrafts)
          .values({
            key,
            value: { text: value },
            version: 1,
            createdAt: now,
            updatedAt: now,
            updatedBySubject,
          })
          .onConflictDoNothing()
          .returning();
        if (!row) throw new ContentDraftVersionConflictError(null);
        return toStored(row);
      }
      const [row] = await this.db
        .update(contentDrafts)
        .set({
          value: { text: value },
          version: expectedVersion + 1,
          updatedAt: now,
          updatedBySubject,
        })
        .where(and(eq(contentDrafts.key, key), eq(contentDrafts.version, expectedVersion)))
        .returning();
      if (!row) throw new ContentDraftVersionConflictError(null);
      return toStored(row);
    } catch (error) {
      if (
        error instanceof ContentDraftVersionConflictError ||
        error instanceof ContentDraftPersistenceUnavailableError
      ) {
        throw error;
      }
      throw new ContentDraftPersistenceUnavailableError();
    }
  }

  async resetDraft(key: ContentDraftKey, expectedVersion: number): Promise<void> {
    try {
      const deleted = await this.db
        .delete(contentDrafts)
        .where(and(eq(contentDrafts.key, key), eq(contentDrafts.version, expectedVersion)))
        .returning({ key: contentDrafts.key });
      if (deleted.length > 0) return;
      if (expectedVersion === 0) {
        const [existing] = await this.db
          .select({ key: contentDrafts.key })
          .from(contentDrafts)
          .where(eq(contentDrafts.key, key))
          .limit(1);
        if (!existing) return;
      }
      throw new ContentDraftVersionConflictError(null);
    } catch (error) {
      if (
        error instanceof ContentDraftVersionConflictError ||
        error instanceof ContentDraftPersistenceUnavailableError
      ) {
        throw error;
      }
      throw new ContentDraftPersistenceUnavailableError();
    }
  }
}
