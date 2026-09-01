import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getTableColumns, getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { contentDrafts, contentPublicationEntries, contentPublications, inquiries } from "../src/db/schema/index.js";

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const drizzleDir = path.join(apiRoot, "drizzle");

describe("inquiry and content-draft schema", () => {
  it("defines inquiries with UUID, new status default, timestamps, and nullable attachments", () => {
    expect(getTableName(inquiries)).toBe("inquiries");
    const columns = getTableColumns(inquiries);
    expect(columns.id?.dataType).toBe("string");
    expect(columns.status?.hasDefault).toBe(true);
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
    expect(columns.message).toBeDefined();
    expect(columns.attachmentObjectKey?.notNull).toBe(false);
    expect(columns.attachmentOriginalName?.notNull).toBe(false);
    expect(columns.attachmentMimeType?.notNull).toBe(false);
    expect(columns.attachmentByteSize?.notNull).toBe(false);
    expect(columns).not.toHaveProperty("ip");
    expect(columns).not.toHaveProperty("userAgent");
    expect(columns).not.toHaveProperty("password");
    expect(Object.values(columns).some((column) => column.dataType === "buffer" || column.columnType.includes("bytea"))).toBe(
      false,
    );

    const config = getTableConfig(inquiries);
    const indexNames = config.indexes.map((entry) => {
      const configValue = "config" in entry ? entry.config : entry;
      return (configValue as { name?: string }).name ?? "";
    });
    expect(indexNames).toEqual(
      expect.arrayContaining([
        "inquiries_created_at_idx",
        "inquiries_status_idx",
        "inquiries_status_created_at_idx",
      ]),
    );
    expect(indexNames.join(" ")).not.toMatch(/message/);
  });

  it("defines content_drafts with JSONB values, a positive-version check, and no HTML or credential columns", () => {
    expect(getTableName(contentDrafts)).toBe("content_drafts");
    const columns = getTableColumns(contentDrafts);
    expect(columns.key).toBeDefined();
    expect(columns.value).toBeDefined();
    expect(String(columns.value.columnType).toLowerCase()).toMatch(/jsonb/);
    expect(columns.version).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
    expect(columns.updatedBySubject).toBeDefined();
    expect(columns).not.toHaveProperty("html");
    expect(columns).not.toHaveProperty("password");
  });

  it("defines immutable prepared publications and entries without unpublished project columns", () => {
    expect(getTableName(contentPublications)).toBe("content_publications");
    expect(getTableName(contentPublicationEntries)).toBe("content_publication_entries");
    const publicationColumns = getTableColumns(contentPublications);
    expect(publicationColumns.id).toBeDefined();
    expect(publicationColumns.status).toBeDefined();
    expect(publicationColumns.contentHash).toBeDefined();
    expect(publicationColumns.entryCount).toBeDefined();
    expect(publicationColumns.createdAt).toBeDefined();
    expect(publicationColumns.createdBySubject).toBeDefined();
    expect(publicationColumns).not.toHaveProperty("payload");
    expect(publicationColumns).not.toHaveProperty("projects");
    expect(publicationColumns).not.toHaveProperty("prices");
    expect(publicationColumns).not.toHaveProperty("deployHook");
    const entryColumns = getTableColumns(contentPublicationEntries);
    expect(entryColumns.publicationId).toBeDefined();
    expect(entryColumns.key).toBeDefined();
    expect(entryColumns.value).toBeDefined();
    expect(entryColumns.source).toBeDefined();
    expect(entryColumns.sourceDraftVersion).toBeDefined();
  });

  it("keeps generated SQL limited to inquiries, JSONB drafts, and publications and free of credentials", () => {
    const sqlFiles = readdirSync(drizzleDir).filter((name) => name.endsWith(".sql"));
    expect(sqlFiles.length).toBeGreaterThan(0);
    const sql = sqlFiles.map((name) => readFileSync(path.join(drizzleDir, name), "utf8")).join("\n");
    expect(sql).toMatch(/CREATE TABLE\s+"inquiries"/i);
    expect(sql).toMatch(/CREATE TABLE\s+"content_drafts"/i);
    expect(sql).toMatch(/CREATE TABLE\s+"content_publications"/i);
    expect(sql).toMatch(/CREATE TABLE\s+"content_publication_entries"/i);
    expect(sql).toMatch(/jsonb/i);
    expect(sql).toMatch(/content_drafts_version_positive/);
    expect(sql).not.toMatch(/CREATE TABLE\s+"publication_snapshots"/i);
    expect(sql).toMatch(/"id"/);
    expect(sql).toMatch(/"status"/);
    expect(sql).toMatch(/"created_at"/);
    expect(sql).toMatch(/inquiries_created_at_idx/);
    expect(sql).toMatch(/inquiries_status_idx/);
    expect(sql).toMatch(/inquiries_status_created_at_idx/);
    expect(sql).not.toMatch(/bytea|BLOB|password|user_agent|ip_address|DATABASE_URL|neon\.tech|sk_live/i);
    expect(sql).not.toMatch(/CREATE TABLE\s+"(products|orders|prices|admin_users|users)"/i);
  });
});
