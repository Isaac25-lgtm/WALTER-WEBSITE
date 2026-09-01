import { and, desc, eq, lt, or } from "drizzle-orm";
import type { InquiryStatus } from "@ats/contracts";
import { inquiries } from "../db/schema/index.js";
import type { AppDatabase } from "../db/client.js";
import { encodeInquiryCursor } from "../lib/inquiry-cursor.js";
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

const summaryColumns = {
  id: inquiries.id,
  status: inquiries.status,
  createdAt: inquiries.createdAt,
  updatedAt: inquiries.updatedAt,
  firstName: inquiries.firstName,
  lastName: inquiries.lastName,
  email: inquiries.email,
  phone: inquiries.phone,
  attachmentOriginalName: inquiries.attachmentOriginalName,
};

const detailColumns = {
  ...summaryColumns,
  message: inquiries.message,
  attachmentMimeType: inquiries.attachmentMimeType,
  attachmentByteSize: inquiries.attachmentByteSize,
};

function toSummary(row: {
  id: string;
  status: InquiryStatus;
  createdAt: Date;
  updatedAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  attachmentOriginalName: string | null;
}): InquirySummaryRecord {
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

export class DrizzleInquiryRepository implements InquiryRepository {
  private readonly db: AppDatabase;

  constructor(database: AppDatabase) {
    this.db = database;
  }

  async createInquiry(input: NewInquiryRecord): Promise<CreatedInquiry> {
    try {
      const [row] = await this.db
        .insert(inquiries)
        .values({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          message: input.message,
          status: "new",
        })
        .returning({
          id: inquiries.id,
          status: inquiries.status,
          createdAt: inquiries.createdAt,
        });
      if (!row) throw new InquiryPersistenceUnavailableError();
      return row;
    } catch (error) {
      if (error instanceof InquiryPersistenceUnavailableError) throw error;
      throw new InquiryPersistenceUnavailableError();
    }
  }

  async listInquiries(query: ListInquiriesQuery): Promise<InquiryListPage> {
    try {
      const filters = [];
      if (query.status) filters.push(eq(inquiries.status, query.status));
      if (query.cursor) {
        filters.push(
          or(
            lt(inquiries.createdAt, query.cursor.createdAt),
            and(eq(inquiries.createdAt, query.cursor.createdAt), lt(inquiries.id, query.cursor.id)),
          )!,
        );
      }
      const rows = await this.db
        .select(summaryColumns)
        .from(inquiries)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(inquiries.createdAt), desc(inquiries.id))
        .limit(query.limit + 1);
      const hasMore = rows.length > query.limit;
      const pageRows = hasMore ? rows.slice(0, query.limit) : rows;
      const last = pageRows[pageRows.length - 1];
      return {
        inquiries: pageRows.map(toSummary),
        nextCursor: hasMore && last ? encodeInquiryCursor(last.createdAt, last.id) : null,
      };
    } catch {
      throw new InquiryPersistenceUnavailableError();
    }
  }

  async getInquiry(id: string): Promise<StoredInquiry | null> {
    try {
      const [row] = await this.db.select(detailColumns).from(inquiries).where(eq(inquiries.id, id)).limit(1);
      return row ?? null;
    } catch {
      throw new InquiryPersistenceUnavailableError();
    }
  }

  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<StoredInquiry | null> {
    try {
      const [row] = await this.db
        .update(inquiries)
        .set({ status, updatedAt: new Date() })
        .where(eq(inquiries.id, id))
        .returning(detailColumns);
      return row ?? null;
    } catch {
      throw new InquiryPersistenceUnavailableError();
    }
  }
}
