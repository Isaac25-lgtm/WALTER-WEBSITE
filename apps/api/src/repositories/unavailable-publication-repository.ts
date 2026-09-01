import type {
  ListPublicationsQuery,
  PreparePublicationInput,
  PublicationListPage,
  PublicationRepository,
  StoredPublication,
} from "./publication-repository.js";
import { PublicationPersistenceUnavailableError } from "./publication-repository.js";

export class UnavailablePublicationRepository implements PublicationRepository {
  async listPublications(_query: ListPublicationsQuery): Promise<PublicationListPage> {
    throw new PublicationPersistenceUnavailableError();
  }

  async getPublication(_id: string): Promise<StoredPublication | null> {
    throw new PublicationPersistenceUnavailableError();
  }

  async preparePublication(_input: PreparePublicationInput): Promise<StoredPublication> {
    throw new PublicationPersistenceUnavailableError();
  }
}
