import "./setup-env.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  API_ERROR_CODES,
  inquiryNotFoundErrorSchema,
  managementInquiryDetailSchema,
  managementInquiryListResponseSchema,
} from "@ats/contracts";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config/env.js";
import { encodeInquiryCursor } from "../src/lib/inquiry-cursor.js";
import type { StoredInquiry } from "../src/repositories/inquiry-repository.js";
import { MemoryInquiryRepository } from "../src/repositories/memory-inquiry-repository.js";
import { createTestAuthVerifier, expectManagementHeaders, signTestToken, TEST_ADMIN_SUBJECT } from "./auth-test-helpers.js";

const baseConfig = loadConfig();
const validInquiry = {
  firstName: "Ada",
  lastName: "Okello",
  email: "ada@example.com",
  phone: "+256 700 000 000",
  message: "Please quote a warehouse frame in Jinja.",
};

const apps: Array<{ close: () => Promise<void> }> = [];

afterEach(async () => {
  while (apps.length > 0) {
    const app = apps.pop();
    if (app) await app.close();
  }
});

function seedRow(id: string, createdAt: Date, overrides: Partial<StoredInquiry> = {}): StoredInquiry {
  return {
    id,
    status: "new",
    createdAt,
    updatedAt: createdAt,
    firstName: "Ada",
    lastName: "Okello",
    email: "ada@example.com",
    phone: "+256 700 000 000",
    message: "Please quote a warehouse frame in Jinja.",
    attachmentOriginalName: null,
    attachmentMimeType: null,
    attachmentByteSize: null,
    ...overrides,
  };
}

describe("authenticated inquiry management", () => {
  it("lists, reads, and updates inquiry status without public reads or deletion", async () => {
    const repository = new MemoryInquiryRepository();
    const { verifier, privateKey } = await createTestAuthVerifier();
    const token = await signTestToken(privateKey, { subject: TEST_ADMIN_SUBJECT });
    const app = await buildApp({
      config: { ...baseConfig },
      logger: false,
      inquiryRepository: repository,
      authVerifier: verifier,
    });
    apps.push(app);

    const created = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: validInquiry,
    });
    expect(created.statusCode).toBe(201);
    const id = created.json().id as string;

    const list = await app.inject({
      method: "GET",
      url: "/management/inquiries",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(list.statusCode).toBe(200);
    expectManagementHeaders(list);
    const listed = managementInquiryListResponseSchema.parse(list.json());
    expect(listed.inquiries).toHaveLength(1);
    expect(listed.nextCursor).toBeNull();
    expect(listed.inquiries[0]?.id).toBe(id);
    expect(listed.inquiries[0]?.phone).toBe(validInquiry.phone);
    expect(listed.inquiries[0]?.hasAttachment).toBe(false);
    expect(listed.inquiries[0]?.status).toBe("new");
    expect(JSON.stringify(listed)).not.toContain(validInquiry.message);
    expect(listed.inquiries[0]).not.toHaveProperty("message");

    const filtered = await app.inject({
      method: "GET",
      url: "/management/inquiries?status=closed",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(managementInquiryListResponseSchema.parse(filtered.json()).inquiries).toHaveLength(0);

    const detail = await app.inject({
      method: "GET",
      url: `/management/inquiries/${id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(detail.statusCode).toBe(200);
    expectManagementHeaders(detail);
    const body = managementInquiryDetailSchema.parse(detail.json());
    expect(body.message).toBe(validInquiry.message);
    expect(body.phone).toBe(validInquiry.phone);
    expect(body.attachment).toBeNull();

    const retired = await app.inject({
      method: "PATCH",
      url: `/management/inquiries/${id}`,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      payload: { status: "in_progress" },
    });
    expect(retired.statusCode).toBe(404);

    const patched = await app.inject({
      method: "PATCH",
      url: `/management/inquiries/${id}/status`,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      payload: { status: "in_progress" },
    });
    expect(patched.statusCode).toBe(200);
    expect(managementInquiryDetailSchema.parse(patched.json()).status).toBe("in_progress");
    expect(repository.records[0]?.status).toBe("in_progress");

    const extra = await app.inject({
      method: "PATCH",
      url: `/management/inquiries/${id}/status`,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      payload: { status: "closed", extra: true },
    });
    expect(extra.statusCode).toBe(400);

    const missing = await app.inject({
      method: "GET",
      url: "/management/inquiries/00000000-0000-4000-8000-000000000000",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(missing.statusCode).toBe(404);
    expect(inquiryNotFoundErrorSchema.parse(missing.json()).error.code).toBe(API_ERROR_CODES.not_found);

    const publicGet = await app.inject({ method: "GET", url: `/inquiries/${id}` });
    expect(publicGet.statusCode).toBe(404);
    const publicDelete = await app.inject({ method: "DELETE", url: `/management/inquiries/${id}` });
    expect(publicDelete.statusCode).toBe(404);
  }, 15_000);

  it("rejects unknown, repeated, and malformed list query values", async () => {
    const { verifier, privateKey } = await createTestAuthVerifier();
    const token = await signTestToken(privateKey, { subject: TEST_ADMIN_SUBJECT });
    const app = await buildApp({
      config: { ...baseConfig },
      logger: false,
      inquiryRepository: new MemoryInquiryRepository(),
      authVerifier: verifier,
    });
    apps.push(app);
    const headers = { authorization: `Bearer ${token}` };

    const unknown = await app.inject({ method: "GET", url: "/management/inquiries?foo=1", headers });
    expect(unknown.statusCode).toBe(400);
    expectManagementHeaders(unknown);

    const repeated = await app.inject({
      method: "GET",
      url: "/management/inquiries?status=new&status=closed",
      headers,
    });
    expect(repeated.statusCode).toBe(400);

    const invalidStatus = await app.inject({ method: "GET", url: "/management/inquiries?status=open", headers });
    expect(invalidStatus.statusCode).toBe(400);

    const zero = await app.inject({ method: "GET", url: "/management/inquiries?limit=0", headers });
    expect(zero.statusCode).toBe(400);
    const over = await app.inject({ method: "GET", url: "/management/inquiries?limit=51", headers });
    expect(over.statusCode).toBe(400);
    const fractional = await app.inject({ method: "GET", url: "/management/inquiries?limit=1.5", headers });
    expect(fractional.statusCode).toBe(400);
    const negative = await app.inject({ method: "GET", url: "/management/inquiries?limit=-1", headers });
    expect(negative.statusCode).toBe(400);
    const cursor = await app.inject({ method: "GET", url: "/management/inquiries?cursor=not-a-cursor", headers });
    expect(cursor.statusCode).toBe(400);
  }, 15_000);

  it("paginates identical timestamps through the management list route", async () => {
    const repository = new MemoryInquiryRepository();
    const stamp = new Date("2026-09-01T12:00:00.000Z");
    repository.seed(seedRow("00000000-0000-4000-8000-000000000001", stamp));
    repository.seed(seedRow("00000000-0000-4000-8000-000000000002", stamp));
    repository.seed(seedRow("00000000-0000-4000-8000-000000000003", stamp));
    const { verifier, privateKey } = await createTestAuthVerifier();
    const token = await signTestToken(privateKey, { subject: TEST_ADMIN_SUBJECT });
    const app = await buildApp({
      config: { ...baseConfig },
      logger: false,
      inquiryRepository: repository,
      authVerifier: verifier,
    });
    apps.push(app);

    const first = await app.inject({
      method: "GET",
      url: "/management/inquiries?limit=2",
      headers: { authorization: `Bearer ${token}` },
    });
    const firstBody = managementInquiryListResponseSchema.parse(first.json());
    expect(firstBody.inquiries.map((item) => item.id)).toEqual([
      "00000000-0000-4000-8000-000000000003",
      "00000000-0000-4000-8000-000000000002",
    ]);
    expect(firstBody.nextCursor).toBe(encodeInquiryCursor(stamp, "00000000-0000-4000-8000-000000000002"));

    const second = await app.inject({
      method: "GET",
      url: `/management/inquiries?limit=2&cursor=${encodeURIComponent(firstBody.nextCursor ?? "")}`,
      headers: { authorization: `Bearer ${token}` },
    });
    const secondBody = managementInquiryListResponseSchema.parse(second.json());
    expect(secondBody.inquiries.map((item) => item.id)).toEqual(["00000000-0000-4000-8000-000000000001"]);
    expect(secondBody.nextCursor).toBeNull();
  }, 15_000);

  it("rejects unauthenticated management inquiry reads", async () => {
    const app = await buildApp({
      config: { ...baseConfig },
      logger: false,
      inquiryRepository: new MemoryInquiryRepository(),
    });
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/management/inquiries" });
    expect(response.statusCode).toBe(503);
    expectManagementHeaders(response);
  });

  it("selects only summary columns in the Drizzle list query", () => {
    const source = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/repositories/drizzle-inquiry-repository.ts"),
      "utf8",
    );
    const listFn = source.slice(source.indexOf("async listInquiries"), source.indexOf("async getInquiry"));
    expect(listFn).toContain("select(summaryColumns)");
    expect(listFn).toContain("orderBy(desc(inquiries.createdAt), desc(inquiries.id))");
    expect(listFn).not.toContain("select(detailColumns)");
    expect(listFn).not.toContain("inquiries.message");
  });
});
