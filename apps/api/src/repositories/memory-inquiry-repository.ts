import { randomUUID } from "node:crypto";
import type { InquiryStatus } from "@ats/contracts";
import {
  compareInquiryDesc,
  encodeInquiryCursor,
  isBeforeCursor,
} from "../lib/inquiry-cursor.js";
import type {
  CreatedInquiry,
  InquiryListPage,
  InquiryRepository,
  InquirySummaryRecord,
  ListInquiriesQuery,
  NewInquiryRecord,
  StoredInquiry,
} from "./inquiry-repository.js";
import { InquiryPersistenceUnavailableError } from "./inquiry-repository.js";

function toSummary(row: StoredInquiry): InquirySummaryRecord {
  return {
    id: row.id,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    hasAttachment: Boolean(row.attachmentOriginalName),
  };
}

export class MemoryInquiryRepository implements InquiryRepository {
  readonly records: StoredInquiry[] = [];
  failNext: "unavailable" | "unexpected" | null = null;

  private failIfRequested(): void {
    if (this.failNext === "unavailable") {
      this.failNext = null;
      throw new InquiryPersistenceUnavailableError();
    }
    if (this.failNext === "unexpected") {
      this.failNext = null;
      throw new Error("repository failure");
    }
  }

  seed(record: StoredInquiry): void {
    this.records.push({ ...record });
  }

  async createInquiry(input: NewInquiryRecord): Promise<CreatedInquiry> {
    this.failIfRequested();
    const now = new Date();
    const created: StoredInquiry = {
      id: randomUUID(),
      status: "new",
      createdAt: now,
      updatedAt: now,
      attachmentOriginalName: null,
      attachmentMimeType: null,
      attachmentByteSize: null,
      ...input,
    };
    this.records.push(created);
    return { id: created.id, status: created.status, createdAt: created.createdAt };
  }

  async listInquiries(query: ListInquiriesQuery): Promise<InquiryListPage> {
    this.failIfRequested();
    let rows = query.status ? this.records.filter((row) => row.status === query.status) : [...this.records];
    rows.sort(compareInquiryDesc);
    if (query.cursor) {
      const cursor = query.cursor;
      rows = rows.filter((row) => isBeforeCursor(row, cursor));
    }
    const pageRows = rows.slice(0, query.limit);
    const hasMore = rows.length > query.limit;
    const last = pageRows[pageRows.length - 1];
    return {
      inquiries: pageRows.map(toSummary),
      nextCursor: hasMore && last ? encodeInquiryCursor(last.createdAt, last.id) : null,
    };
  }

  async getInquiry(id: string): Promise<StoredInquiry | null> {
    this.failIfRequested();
    return this.records.find((row) => row.id === id) ?? null;
  }

  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<StoredInquiry | null> {
    this.failIfRequested();
    const record = this.records.find((row) => row.id === id);
    if (!record) return null;
    record.status = status;
    record.updatedAt = new Date();
    return record;
  }
}
