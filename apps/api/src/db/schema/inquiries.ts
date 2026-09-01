import { index, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const inquiryStatusEnum = pgEnum("inquiry_status", ["new", "in_progress", "closed"]);

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: inquiryStatusEnum("status").notNull().default("new"),
    firstName: varchar("first_name", { length: 80 }).notNull(),
    lastName: varchar("last_name", { length: 80 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    message: text("message").notNull(),
    attachmentObjectKey: varchar("attachment_object_key", { length: 512 }),
    attachmentOriginalName: varchar("attachment_original_name", { length: 255 }),
    attachmentMimeType: varchar("attachment_mime_type", { length: 100 }),
    attachmentByteSize: integer("attachment_byte_size"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("inquiries_created_at_idx").on(table.createdAt),
    index("inquiries_status_idx").on(table.status),
    index("inquiries_status_created_at_idx").on(table.status, table.createdAt),
  ],
);
