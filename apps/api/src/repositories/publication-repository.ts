import type { ContentPublicationEntry } from "@ats/contracts";

export class PublicationPersistenceUnavailableError extends Error {
  override readonly name = "PublicationPersistenceUnavailableError";
}

export type StoredPublication = {
  id: string;
  status: "prepared";
  contentHash: string;
  entryCount: number;
  createdAt: Date;
  createdBySubject: string;
  entries: ContentPublicationEntry[];
};

export type PublicationSummaryRecord = {
  id: string;
  status: "prepared";
  contentHash: string;
  entryCount: number;
  createdAt: Date;
};

export type PublicationListPage = {
  publications: PublicationSummaryRecord[];
  nextCursor: string | null;
};

export type PreparePublicationInput = {
  createdBySubject: string;
  expectedDraftVersions: Record<string, number>;
};

export type ListPublicationsQuery = {
  cursor?: { createdAt: Date; id: string };
  limit: number;
};

export type PublicationRepository = {
  listPublications(_query: ListPublicationsQuery): Promise<PublicationListPage>;
  // eslint-disable-next-line no-unused-vars -- interface method argument
  getPublication(id: string): Promise<StoredPublication | null>;
  // eslint-disable-next-line no-unused-vars -- interface method argument
  preparePublication(input: PreparePublicationInput): Promise<StoredPublication>;
};
