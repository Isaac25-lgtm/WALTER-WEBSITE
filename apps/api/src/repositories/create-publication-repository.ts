import { createContentPersistence } from "./create-content-persistence.js";
import type { PublicationRepository } from "./publication-repository.js";

export function createPublicationRepository(databaseUrl: string | undefined): PublicationRepository {
  return createContentPersistence(databaseUrl).publicationRepository;
}
