import { createDb, isDatabaseConfigured } from "../db/client.js";
import type { ContentDraftRepository } from "./content-draft-repository.js";
import { DrizzleContentDraftRepository } from "./drizzle-content-draft-repository.js";
import { UnavailableContentDraftRepository } from "./unavailable-content-draft-repository.js";
import type { InquiryRepository } from "./inquiry-repository.js";
import { DrizzleInquiryRepository } from "./drizzle-inquiry-repository.js";
import { UnavailableInquiryRepository } from "./unavailable-inquiry-repository.js";
import type { PublicationRepository } from "./publication-repository.js";
import { DrizzlePublicationRepository } from "./drizzle-publication-repository.js";
import { UnavailablePublicationRepository } from "./unavailable-publication-repository.js";

export type AppPersistence = {
  inquiryRepository: InquiryRepository;
  contentDraftRepository: ContentDraftRepository;
  publicationRepository: PublicationRepository;
  end: () => Promise<void>;
};

export function createAppPersistence(databaseUrl: string | undefined): AppPersistence {
  if (!isDatabaseConfigured(databaseUrl) || !databaseUrl) {
    return {
      inquiryRepository: new UnavailableInquiryRepository(),
      contentDraftRepository: new UnavailableContentDraftRepository(),
      publicationRepository: new UnavailablePublicationRepository(),
      end: async () => undefined,
    };
  }
  const handle = createDb(databaseUrl);
  return {
    inquiryRepository: new DrizzleInquiryRepository(handle.db),
    contentDraftRepository: new DrizzleContentDraftRepository(handle.db),
    publicationRepository: new DrizzlePublicationRepository(handle.db),
    end: handle.end,
  };
}

export function createContentPersistence(databaseUrl: string | undefined): {
  contentDraftRepository: ContentDraftRepository;
  publicationRepository: PublicationRepository;
  end: () => Promise<void>;
} {
  const persistence = createAppPersistence(databaseUrl);
  return {
    contentDraftRepository: persistence.contentDraftRepository,
    publicationRepository: persistence.publicationRepository,
    end: persistence.end,
  };
}
