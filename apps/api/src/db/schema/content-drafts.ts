import { check, integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const contentDrafts = pgTable(
  "content_drafts",
  {
    key: varchar("key", { length: 128 }).primaryKey(),
    value: jsonb("value").$type<{ text: string }>().notNull(),
    version: integer("version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    updatedBySubject: varchar("updated_by_subject", { length: 128 }).notNull(),
  },
  (table) => [
    check("content_drafts_version_positive", sql`${table.version} > 0`),
    check(
      "content_drafts_value_text",
      sql`jsonb_typeof(${table.value}) = 'object' AND ${table.value} ? 'text' AND jsonb_typeof(${table.value} -> 'text') = 'string' AND char_length(${table.value} ->> 'text') > 0`,
    ),
  ],
);
