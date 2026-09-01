import type { InquiryStatus } from "@ats/contracts";
import type { InquiryListPage, InquiryRepository, StoredInquiry } from "./inquiry-repository.js";
import { InquiryPersistenceUnavailableError } from "./inquiry-repository.js";

export class UnavailableInquiryRepository implements InquiryRepository {
  async createInquiry(): Promise<never> {
    throw new InquiryPersistenceUnavailableError();
  }

  async listInquiries(): Promise<InquiryListPage> {
    throw new InquiryPersistenceUnavailableError();
  }

  async getInquiry(): Promise<StoredInquiry | null> {
    throw new InquiryPersistenceUnavailableError();
  }

  async updateInquiryStatus(_id: string, _status: InquiryStatus): Promise<StoredInquiry | null> {
    throw new InquiryPersistenceUnavailableError();
  }
}
