import type { InquiryStatus } from "@ats/contracts";

export class InquiryPersistenceUnavailableError extends Error {
  override readonly name = "InquiryPersistenceUnavailableError";
}

export type NewInquiryRecord = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

export type CreatedInquiry = {
  id: string;
  status: InquiryStatus;
  createdAt: Date;
};

export type StoredInquiry = {
  id: string;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  attachmentOriginalName: string | null;
  attachmentMimeType: string | null;
  attachmentByteSize: number | null;
};

export type InquirySummaryRecord = {
  id: string;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hasAttachment: boolean;
};

export type ListInquiriesQuery = {
  status?: InquiryStatus;
  cursor?: {
    createdAt: Date;
    id: string;
  };
  limit: number;
};

export type InquiryListPage = {
  inquiries: InquirySummaryRecord[];
  nextCursor: string | null;
};

export type InquiryRepository = {
  // eslint-disable-next-line no-unused-vars -- interface method argument
  createInquiry(input: NewInquiryRecord): Promise<CreatedInquiry>;
  // eslint-disable-next-line no-unused-vars -- interface method argument
  listInquiries(query: ListInquiriesQuery): Promise<InquiryListPage>;
  // eslint-disable-next-line no-unused-vars -- interface method argument
  getInquiry(id: string): Promise<StoredInquiry | null>;
  updateInquiryStatus(
    // eslint-disable-next-line no-unused-vars -- interface method argument
    id: string,
    // eslint-disable-next-line no-unused-vars -- interface method argument
    status: InquiryStatus,
  ): Promise<StoredInquiry | null>;
};
