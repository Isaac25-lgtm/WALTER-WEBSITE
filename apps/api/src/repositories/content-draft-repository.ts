import type { ContentDraftKey } from "@ats/contracts";

export class ContentDraftPersistenceUnavailableError extends Error {
  override readonly name = "ContentDraftPersistenceUnavailableError";
}

export class ContentDraftVersionConflictError extends Error {
  override readonly name = "ContentDraftVersionConflictError";
  readonly current: StoredContentDraft | null;

  constructor(current: StoredContentDraft | null) {
    super("Content draft version conflict");
    this.current = current;
  }
}

export type StoredContentDraft = {
  key: ContentDraftKey;
  value: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  updatedBySubject: string;
};

export type ContentDraftRepository = {
  listDrafts(): Promise<StoredContentDraft[]>;
  // eslint-disable-next-line no-unused-vars -- interface method argument
  getDraft(key: ContentDraftKey): Promise<StoredContentDraft | null>;
  saveDraft(
    // eslint-disable-next-line no-unused-vars -- interface method argument
    key: ContentDraftKey,
    // eslint-disable-next-line no-unused-vars -- interface method argument
    value: string,
    // eslint-disable-next-line no-unused-vars -- interface method argument
    expectedVersion: number,
    // eslint-disable-next-line no-unused-vars -- interface method argument
    updatedBySubject: string,
  ): Promise<StoredContentDraft>;
  resetDraft(
    // eslint-disable-next-line no-unused-vars -- interface method argument
    key: ContentDraftKey,
    // eslint-disable-next-line no-unused-vars -- interface method argument
    expectedVersion: number,
  ): Promise<void>;
};
