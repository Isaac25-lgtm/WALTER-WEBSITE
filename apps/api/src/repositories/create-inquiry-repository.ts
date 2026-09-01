import type { InquiryRepository } from "./inquiry-repository.js";
import { createAppPersistence } from "./create-content-persistence.js";

export function createInquiryRepository(databaseUrl: string | undefined): InquiryRepository {
  return createAppPersistence(databaseUrl).inquiryRepository;
}
