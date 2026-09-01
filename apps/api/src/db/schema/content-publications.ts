import {
  check,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const contentPublicationStatusEnum = pgEnum("content_publication_status", ["prepared"]);
export const contentPublicationSourceEnum = pgEnum("content_publication_source", ["canonical", "draft"]);

export const contentPublications = pgTable(
  "content_publications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: contentPublicationStatusEnum("status").notNull().default("prepared"),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    entryCount: integer("entry_count").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBySubject: varchar("created_by_subject", { length: 128 }).notNull(),
  },
  (table) => [
    check("content_publications_status_prepared", sql`${table.status} = 'prepared'`),
    check("content_publications_entry_count_positive", sql`${table.entryCount} > 0`),
    check("content_publications_hash_sha256", sql`${table.contentHash} ~ '^[a-f0-9]{64}$'`),
  ],
);

export const contentPublicationEntries = pgTable(
  "content_publication_entries",
  {
    publicationId: uuid("publication_id").notNull(),
    key: varchar("key", { length: 128 }).notNull(),
    value: text("value").notNull(),
    source: contentPublicationSourceEnum("source").notNull(),
    sourceDraftVersion: integer("source_draft_version"),
  },
  (table) => [
    primaryKey({ columns: [table.publicationId, table.key], name: "content_publication_entries_pk" }),
    foreignKey({
      columns: [table.publicationId],
      foreignColumns: [contentPublications.id],
      name: "content_publication_entries_publication_id_fk",
    }),
    check(
      "content_publication_entries_source_version",
      sql`(${table.source} = 'canonical' AND ${table.sourceDraftVersion} IS NULL) OR (${table.source} = 'draft' AND ${table.sourceDraftVersion} > 0)`,
    ),
  ],
);
