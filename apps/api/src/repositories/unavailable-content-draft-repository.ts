import type { ContentDraftKey } from "@ats/contracts";
import type { ContentDraftRepository, StoredContentDraft } from "./content-draft-repository.js";
import { ContentDraftPersistenceUnavailableError } from "./content-draft-repository.js";

export class UnavailableContentDraftRepository implements ContentDraftRepository {
  async listDrafts(): Promise<StoredContentDraft[]> {
    throw new ContentDraftPersistenceUnavailableError();
  }

  async getDraft(_key: ContentDraftKey): Promise<StoredContentDraft | null> {
    throw new ContentDraftPersistenceUnavailableError();
  }

  async saveDraft(
    _key: ContentDraftKey,
    _value: string,
    _expectedVersion: number,
    _updatedBySubject: string,
  ): Promise<StoredContentDraft> {
    throw new ContentDraftPersistenceUnavailableError();
  }

  async resetDraft(_key: ContentDraftKey, _expectedVersion: number): Promise<void> {
    throw new ContentDraftPersistenceUnavailableError();
  }
}
