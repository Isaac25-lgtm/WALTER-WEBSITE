import { randomUUID } from "node:crypto";
import { compilePreparedPublication } from "../content/overlay-drafts.js";
import { compareInquiryDesc, encodeInquiryCursor, isBeforeCursor } from "../lib/inquiry-cursor.js";
import type { ContentDraftKey, ContentPublicationEntry } from "@ats/contracts";
import { MemoryContentDraftRepository } from "./memory-content-draft-repository.js";
import type {
  ListPublicationsQuery,
  PreparePublicationInput,
  PublicationListPage,
  PublicationRepository,
  PublicationSummaryRecord,
  StoredPublication,
} from "./publication-repository.js";
import { PublicationPersistenceUnavailableError } from "./publication-repository.js";

function toSummary(row: StoredPublication): PublicationSummaryRecord {
  return {
    id: row.id,
    status: row.status,
    contentHash: row.contentHash,
    entryCount: row.entryCount,
    createdAt: row.createdAt,
  };
}

function clonePublications(rows: StoredPublication[]): StoredPublication[] {
  return rows.map((row) => ({
    ...row,
    entries: row.entries.map((entry) => ({ ...entry })),
  }));
}

export class MemoryPublicationRepository implements PublicationRepository {
  readonly records: StoredPublication[] = [];
  readonly entryRows: Array<{ publicationId: string; entry: ContentPublicationEntry }> = [];
  failNext = false;
  failAfterParentInsert = false;
  failDuringEntryInsert = false;
  failAfterPartialEntryInsert = false;
  private readonly drafts: MemoryContentDraftRepository;

  constructor(drafts: MemoryContentDraftRepository = new MemoryContentDraftRepository()) {
    this.drafts = drafts;
  }

  seed(row: StoredPublication): void {
    this.records.push({
      ...row,
      entries: row.entries.map((entry) => ({ ...entry })),
    });
    for (const entry of row.entries) {
      this.entryRows.push({ publicationId: row.id, entry: { ...entry } });
    }
  }

  private failIfRequested(): void {
    if (!this.failNext) return;
    this.failNext = false;
    throw new PublicationPersistenceUnavailableError();
  }

  async listPublications(query: ListPublicationsQuery): Promise<PublicationListPage> {
    this.failIfRequested();
    let rows = [...this.records].sort(compareInquiryDesc);
    if (query.cursor) {
      rows = rows.filter((row) => isBeforeCursor(row, query.cursor!));
    }
    const pageRows = rows.slice(0, query.limit);
    const hasMore = rows.length > query.limit;
    const last = pageRows[pageRows.length - 1];
    return {
      publications: pageRows.map(toSummary),
      nextCursor: hasMore && last ? encodeInquiryCursor(last.createdAt, last.id) : null,
    };
  }

  async getPublication(id: string): Promise<StoredPublication | null> {
    this.failIfRequested();
    return this.records.find((row) => row.id === id) ?? null;
  }

  async preparePublication(input: PreparePublicationInput): Promise<StoredPublication> {
    return this.drafts.withExclusive(() => {
      this.failIfRequested();
      const requestedKeys = Object.keys(input.expectedDraftVersions) as ContentDraftKey[];
      const locked = this.drafts.peekDrafts(requestedKeys);
      const prepared = compilePreparedPublication(input.expectedDraftVersions, locked);
      const snapshotRecords = clonePublications(this.records);
      const snapshotEntries = this.entryRows.map((row) => ({
        publicationId: row.publicationId,
        entry: { ...row.entry },
      }));
      try {
        const stored: StoredPublication = {
          id: randomUUID(),
          status: "prepared",
          contentHash: prepared.contentHash,
          entryCount: prepared.entries.length,
          createdAt: new Date(),
          createdBySubject: input.createdBySubject,
          entries: [],
        };
        this.records.push(stored);
        if (this.failAfterParentInsert) {
          this.failAfterParentInsert = false;
          throw new PublicationPersistenceUnavailableError();
        }
        for (let index = 0; index < prepared.entries.length; index += 1) {
          const entry = prepared.entries[index];
          if (!entry) continue;
          if (this.failDuringEntryInsert && index === 0) {
            this.failDuringEntryInsert = false;
            throw new PublicationPersistenceUnavailableError();
          }
          stored.entries.push({ ...entry });
          this.entryRows.push({ publicationId: stored.id, entry: { ...entry } });
          if (this.failAfterPartialEntryInsert && index === 0) {
            this.failAfterPartialEntryInsert = false;
            throw new PublicationPersistenceUnavailableError();
          }
        }
        return stored;
      } catch (error) {
        this.records.length = 0;
        this.records.push(...snapshotRecords);
        this.entryRows.length = 0;
        this.entryRows.push(...snapshotEntries);
        throw error;
      }
    });
  }
}
