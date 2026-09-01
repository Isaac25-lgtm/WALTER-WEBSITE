import type { ContentDraftKey } from "@ats/contracts";
import type { ContentDraftRepository, StoredContentDraft } from "./content-draft-repository.js";
import {
  ContentDraftPersistenceUnavailableError,
  ContentDraftVersionConflictError,
} from "./content-draft-repository.js";

export class MemoryContentDraftRepository implements ContentDraftRepository {
  readonly records = new Map<ContentDraftKey, StoredContentDraft>();
  failNext = false;
  private tail: Promise<void> = Promise.resolve();

  private failIfRequested(): void {
    if (!this.failNext) return;
    this.failNext = false;
    throw new ContentDraftPersistenceUnavailableError();
  }

  private runExclusive<T>(fn: () => T): Promise<T> {
    const next = this.tail.then(fn, fn);
    this.tail = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  withExclusive<T>(fn: () => T): Promise<T> {
    return this.runExclusive(fn);
  }

  peekDrafts(keys: ContentDraftKey[]): StoredContentDraft[] {
    return keys.flatMap((key) => {
      const row = this.records.get(key);
      return row ? [row] : [];
    });
  }

  async listDrafts(): Promise<StoredContentDraft[]> {
    return this.runExclusive(() => {
      this.failIfRequested();
      return [...this.records.values()];
    });
  }

  async getDraft(key: ContentDraftKey): Promise<StoredContentDraft | null> {
    return this.runExclusive(() => {
      this.failIfRequested();
      return this.records.get(key) ?? null;
    });
  }

  async saveDraft(
    key: ContentDraftKey,
    value: string,
    expectedVersion: number,
    updatedBySubject: string,
  ): Promise<StoredContentDraft> {
    return this.runExclusive(() => {
      this.failIfRequested();
      const current = this.records.get(key) ?? null;
      const currentVersion = current?.version ?? 0;
      if (currentVersion !== expectedVersion) {
        throw new ContentDraftVersionConflictError(current);
      }
      const now = new Date();
      const stored: StoredContentDraft = {
        key,
        value,
        version: expectedVersion + 1,
        createdAt: current?.createdAt ?? now,
        updatedAt: now,
        updatedBySubject,
      };
      this.records.set(key, stored);
      return stored;
    });
  }

  async resetDraft(key: ContentDraftKey, expectedVersion: number): Promise<void> {
    return this.runExclusive(() => {
      this.failIfRequested();
      const current = this.records.get(key) ?? null;
      const currentVersion = current?.version ?? 0;
      if (currentVersion !== expectedVersion) {
        throw new ContentDraftVersionConflictError(current);
      }
      if (expectedVersion === 0) return;
      if (!current) throw new ContentDraftVersionConflictError(null);
      this.records.delete(key);
    });
  }
}
