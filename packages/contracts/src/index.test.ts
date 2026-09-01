import { describe, expect, it } from "vitest";
import {
  API_ERROR_CODES,
  inquiryCreateErrorSchema,
  inquiryCreatedResponseSchema,
  inquiryInternalErrorSchema,
  inquiryBadRequestErrorSchema,
  inquiryUnsupportedMediaTypeErrorSchema,
  inquiryAttachmentNotAvailableErrorSchema,
  inquiryRateLimitErrorSchema,
  inquiryServiceUnavailableErrorSchema,
  managementInquiryListResponseSchema,
  managementSessionResponseSchema,
  parseManagementInquiryListQuery,
  contentDraftValueSchema,
  contentDraftKeySchema,
  contentDraftUpsertSchema,
  contentPublicationPrepareSchema,
  contentPublicationSummarySchema,
  parseManagementPublicationListQuery,
} from "@ats/contracts";

const validCreated = {
  id: "11111111-1111-4111-8111-111111111111",
  createdAt: "2026-08-31T16:00:00.000Z",
  acknowledgement: "accepted" as const,
};

describe("inquiry created response contract", () => {
  it("accepts a valid UUID, ISO datetime, and acknowledgement", () => {
    expect(inquiryCreatedResponseSchema.parse(validCreated)).toEqual(validCreated);
    expect(
      inquiryCreatedResponseSchema.parse({
        ...validCreated,
        createdAt: "2026-08-31T19:00:00+03:00",
      }).createdAt,
    ).toBe("2026-08-31T19:00:00+03:00");
  });

  it("rejects an invalid UUID, invalid datetime, wrong acknowledgement, and extra properties", () => {
    expect(inquiryCreatedResponseSchema.safeParse({ ...validCreated, id: "not-a-uuid" }).success).toBe(false);
    expect(inquiryCreatedResponseSchema.safeParse({ ...validCreated, createdAt: "tomorrow" }).success).toBe(false);
    expect(inquiryCreatedResponseSchema.safeParse({ ...validCreated, createdAt: "" }).success).toBe(false);
    expect(inquiryCreatedResponseSchema.safeParse({ ...validCreated, createdAt: "2026-08-31" }).success).toBe(false);
    expect(
      inquiryCreatedResponseSchema.safeParse({ ...validCreated, acknowledgement: "ok" }).success,
    ).toBe(false);
    expect(inquiryCreatedResponseSchema.safeParse({ ...validCreated, extra: true }).success).toBe(false);
  });
});

describe("inquiry create error union", () => {
  const statusSchemas = [
    [API_ERROR_CODES.bad_request, inquiryBadRequestErrorSchema],
    [API_ERROR_CODES.unsupported_media_type, inquiryUnsupportedMediaTypeErrorSchema],
    [API_ERROR_CODES.attachment_not_available, inquiryAttachmentNotAvailableErrorSchema],
    [API_ERROR_CODES.rate_limited, inquiryRateLimitErrorSchema],
    [API_ERROR_CODES.service_unavailable, inquiryServiceUnavailableErrorSchema],
    [API_ERROR_CODES.internal_error, inquiryInternalErrorSchema],
  ] as const;

  it("accepts every literal inquiry-create error code and rejects wrong codes, empty messages, and extra keys", () => {
    for (const [code, schema] of statusSchemas) {
      const envelope = { error: { code, message: "safe" } };
      expect(schema.parse(envelope).error.code).toBe(code);
      expect(inquiryCreateErrorSchema.parse(envelope).error.code).toBe(code);
      expect(schema.safeParse({ error: { code: "other", message: "safe" } }).success).toBe(false);
      expect(schema.safeParse({ error: { code, message: "" } }).success).toBe(false);
      expect(schema.safeParse({ error: { code, message: "safe" }, extra: true }).success).toBe(false);
    }
  });

  it("parses the union and rejects unknown envelopes", () => {
    expect(
      inquiryCreateErrorSchema.safeParse({
        error: { code: API_ERROR_CODES.not_found, message: "Not found" },
      }).success,
    ).toBe(false);
    expect(inquiryCreateErrorSchema.safeParse({ error: { code: "nope", message: "safe" } }).success).toBe(
      false,
    );
  });
});

describe("management session contract", () => {
  it("accepts authenticated administrator payloads and rejects the retired status field", () => {
    expect(
      managementSessionResponseSchema.parse({ authenticated: true, role: "administrator" }),
    ).toEqual({ authenticated: true, role: "administrator" });
    expect(managementSessionResponseSchema.safeParse({ status: "ok", role: "administrator" }).success).toBe(
      false,
    );
    expect(
      managementSessionResponseSchema.safeParse({ authenticated: true, role: "administrator", extra: true })
        .success,
    ).toBe(false);
  });
});

describe("management inquiry list contract", () => {
  it("accepts bounded queries and rejects unknown, repeated, and invalid values", () => {
    expect(parseManagementInquiryListQuery(undefined)).toEqual({ limit: 20 });
    expect(parseManagementInquiryListQuery({ limit: "20" })?.limit).toBe(20);
    expect(parseManagementInquiryListQuery({ status: "new", limit: 1 })?.status).toBe("new");
    expect(parseManagementInquiryListQuery({ foo: "1" })).toBeNull();
    expect(parseManagementInquiryListQuery({ status: ["new", "closed"] })).toBeNull();
    expect(parseManagementInquiryListQuery({ status: "open" })).toBeNull();
    expect(parseManagementInquiryListQuery({ limit: 0 })).toBeNull();
    expect(parseManagementInquiryListQuery({ limit: 51 })).toBeNull();
    expect(parseManagementInquiryListQuery({ limit: 1.5 })).toBeNull();
    expect(parseManagementInquiryListQuery({ limit: "1.5" })).toBeNull();
    expect(parseManagementInquiryListQuery({ limit: "-1" })).toBeNull();
  });

  it("rejects list payloads that include the inquiry message", () => {
    expect(
      managementInquiryListResponseSchema.safeParse({
        inquiries: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            firstName: "Ada",
            lastName: "Okello",
            email: "ada@example.com",
            phone: "+256 700 000 000",
            status: "new",
            createdAt: "2026-09-01T06:00:00.000Z",
            updatedAt: "2026-09-01T06:00:00.000Z",
            hasAttachment: false,
            message: "secret",
          },
        ],
        nextCursor: null,
      }).success,
    ).toBe(false);
  });
});

describe("content draft contracts", () => {
  it("accepts registry keys and rejects HTML values", () => {
    expect(contentDraftKeySchema.parse("homepage.heroHeading")).toBe("homepage.heroHeading");
    expect(contentDraftKeySchema.safeParse("prices.secret").success).toBe(false);
    expect(contentDraftValueSchema.safeParse("Local draft heading").success).toBe(true);
    expect(contentDraftValueSchema.safeParse("<p>no</p>").success).toBe(false);
    expect(contentDraftUpsertSchema.safeParse({ value: "Local draft heading" }).success).toBe(false);
    expect(contentDraftUpsertSchema.safeParse({ value: "Local draft heading", expectedVersion: 0 }).success).toBe(
      true,
    );
  });
});

describe("publication contracts", () => {
  it("accepts version-safe prepare bodies and rejects unknown keys or administrator subjects in summaries", () => {
    expect(contentPublicationPrepareSchema.parse({}).expectedDraftVersions).toEqual({});
    expect(
      contentPublicationPrepareSchema.parse({ expectedDraftVersions: { "homepage.heroHeading": 2 } })
        .expectedDraftVersions,
    ).toEqual({ "homepage.heroHeading": 2 });
    expect(
      contentPublicationPrepareSchema.safeParse({ expectedDraftVersions: { "homepage.heroHeading": 0 } }).success,
    ).toBe(false);
    expect(contentPublicationPrepareSchema.safeParse({ expectedDraftVersions: { "prices.secret": 1 } }).success).toBe(
      false,
    );
    expect(parseManagementPublicationListQuery(undefined)).toEqual({ limit: 20 });
    expect(parseManagementPublicationListQuery({ limit: 51 })).toBeNull();
    expect(
      contentPublicationSummarySchema.safeParse({
        id: "33333333-3333-4333-8333-333333333333",
        status: "prepared",
        contentHash: "a".repeat(64),
        entryCount: 14,
        createdAt: "2026-09-01T08:00:00.000Z",
        createdBySubject: "admin-subject-1",
      }).success,
    ).toBe(false);
  });
});
