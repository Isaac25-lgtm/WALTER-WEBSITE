import type { ContentDraftRepository } from "./content-draft-repository.js";
import { createContentPersistence } from "./create-content-persistence.js";

export function createContentDraftRepository(databaseUrl: string | undefined): ContentDraftRepository {
  return createContentPersistence(databaseUrl).contentDraftRepository;
}
