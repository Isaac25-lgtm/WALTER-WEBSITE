import { describe, expect, it } from "vitest";
import {
  API_ERROR_CODES,
  contentVersionConflictErrorSchema,
  forbiddenErrorSchema,
  inquiryAttachmentNotAvailableErrorSchema,
  inquiryBadRequestErrorSchema,
  inquiryInternalErrorSchema,
  inquiryRateLimitErrorSchema,
  inquiryServiceUnavailableErrorSchema,
  inquiryUnsupportedMediaTypeErrorSchema,
  inquiryValidationErrorSchema,
  managementAuthUnavailableErrorSchema,
  managementStorageUnavailableErrorSchema,
  malformedResponseErrorSchema,
  unauthorizedErrorSchema,
  apiErrorSchema,
} from "@ats/contracts";

const schemas = [
  [API_ERROR_CODES.bad_request, inquiryBadRequestErrorSchema],
  [API_ERROR_CODES.unsupported_media_type, inquiryUnsupportedMediaTypeErrorSchema],
  [API_ERROR_CODES.attachment_not_available, inquiryAttachmentNotAvailableErrorSchema],
  [API_ERROR_CODES.rate_limited, inquiryRateLimitErrorSchema],
  [API_ERROR_CODES.service_unavailable, inquiryServiceUnavailableErrorSchema],
  [API_ERROR_CODES.internal_error, inquiryInternalErrorSchema],
  [API_ERROR_CODES.unauthorized, unauthorizedErrorSchema],
  [API_ERROR_CODES.forbidden, forbiddenErrorSchema],
  [API_ERROR_CODES.management_auth_unavailable, managementAuthUnavailableErrorSchema],
  [API_ERROR_CODES.management_storage_unavailable, managementStorageUnavailableErrorSchema],
  [API_ERROR_CODES.content_version_conflict, contentVersionConflictErrorSchema],
  [API_ERROR_CODES.malformed_response, malformedResponseErrorSchema],
] as const;

describe("status-specific inquiry error contracts", () => {
  it("requires the literal error code and a non-empty message", () => {
    for (const [code, schema] of schemas) {
      const parsed = schema.parse({ error: { code, message: "safe" } });
      expect(parsed.error.code).toBe(code);
      expect(parsed.error.message.length).toBeGreaterThan(0);
      expect(schema.safeParse({ error: { code, message: "" } }).success).toBe(false);
      expect(schema.safeParse({ error: { code: "other", message: "safe" } }).success).toBe(false);
      expect(schema.safeParse({ error: { code, message: "safe" }, extra: true }).success).toBe(false);
      expect(schema.safeParse({ error: { code, message: "safe", extra: true } }).success).toBe(false);
    }
  });

  it("does not alias the 400 schema to the generic envelope", () => {
    expect(inquiryValidationErrorSchema).toBe(inquiryBadRequestErrorSchema);
    const generic = apiErrorSchema.parse({ error: { code: "anything", message: "safe" } });
    expect(generic.error.code).toBe("anything");
    expect(inquiryBadRequestErrorSchema.safeParse(generic).success).toBe(false);
  });
});
