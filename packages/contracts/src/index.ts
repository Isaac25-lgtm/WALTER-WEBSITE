import { z } from "zod";

export const PUBLIC_ROUTES = ["/", "/contact/", "/portfolio/", "/thank-you/"] as const;

export const PUBLIC_NAV = [
  { label: "Services", href: "/#what-we-do" },
  { label: "Portfolio", href: "/portfolio/" },
  { label: "Contact", href: "/contact/" },
] as const;

/** Frontend convenience limit. The API must re-check size, MIME, extension, and file signatures. */
export const INQUIRY_MAX_ATTACHMENT_BYTES = 1_000_000;

export const INQUIRY_ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"] as const;

export const INQUIRY_ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

const PHONE_PATTERN = /^[+]?[\d\s()./-]{7,32}$/;

export function inquiryAttachmentExtension(filename: string): string {
  const trimmed = filename.trim().toLowerCase();
  const dot = trimmed.lastIndexOf(".");
  return dot >= 0 ? trimmed.slice(dot) : "";
}

export const inquiryAttachmentMetaSchema = z
  .object({
    originalName: z.string().trim().min(1).max(255),
    mimeType: z.enum(INQUIRY_ACCEPTED_MIME_TYPES),
    byteSize: z.number().int().positive().max(INQUIRY_MAX_ATTACHMENT_BYTES),
  })
  .strict()
  .superRefine((value, ctx) => {
    const extension = inquiryAttachmentExtension(value.originalName);
    if (!INQUIRY_ACCEPTED_EXTENSIONS.includes(extension as (typeof INQUIRY_ACCEPTED_EXTENSIONS)[number])) {
      ctx.addIssue({
        code: "custom",
        path: ["originalName"],
        message: "unsupported_extension",
      });
    }
  });

const inquiryCoreShape = {
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(32).regex(PHONE_PATTERN),
  message: z.string().trim().min(1).max(4000),
  attachment: inquiryAttachmentMetaSchema.optional(),
};

export const inquiryInputSchema = z.object(inquiryCoreShape).strict();

/** Public POST body. `website` is a honeypot and is never persisted. */
export const inquiryCreateRequestSchema = z
  .object({
    ...inquiryCoreShape,
    website: z.string().max(500).optional(),
  })
  .strict();

export const inquiryStatusSchema = z.enum(["new", "in_progress", "closed"]);

export const inquiryCreatedResponseSchema = z
  .object({
    id: z.string().uuid(),
    createdAt: z.iso.datetime({ offset: true }),
    acknowledgement: z.literal("accepted"),
  })
  .strict();

export const healthResponseSchema = z
  .object({
    status: z.literal("ok"),
  })
  .strict();

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const apiErrorSchema = z
  .object({
    error: z
      .object({
        code: z.string().min(1),
        message: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export type ApiError = z.infer<typeof apiErrorSchema>;

export const API_ERROR_CODES = {
  bad_request: "bad_request",
  unsupported_media_type: "unsupported_media_type",
  attachment_not_available: "attachment_not_available",
  rate_limited: "rate_limited",
  service_unavailable: "service_unavailable",
  internal_error: "internal_error",
  not_found: "not_found",
  unauthorized: "unauthorized",
  forbidden: "forbidden",
  conflict: "conflict",
  management_auth_unavailable: "management_auth_unavailable",
  management_storage_unavailable: "management_storage_unavailable",
  content_version_conflict: "content_version_conflict",
  malformed_response: "malformed_response",
} as const;

function inquiryStatusErrorSchema<Code extends (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]>(code: Code) {
  return z
    .object({
      error: z
        .object({
          code: z.literal(code),
          message: z.string().min(1),
        })
        .strict(),
    })
    .strict();
}

export const inquiryBadRequestErrorSchema = inquiryStatusErrorSchema(API_ERROR_CODES.bad_request);
export const inquiryUnsupportedMediaTypeErrorSchema = inquiryStatusErrorSchema(
  API_ERROR_CODES.unsupported_media_type,
);
export const inquiryAttachmentNotAvailableErrorSchema = inquiryStatusErrorSchema(
  API_ERROR_CODES.attachment_not_available,
);
export const inquiryRateLimitErrorSchema = inquiryStatusErrorSchema(API_ERROR_CODES.rate_limited);
export const inquiryServiceUnavailableErrorSchema = inquiryStatusErrorSchema(API_ERROR_CODES.service_unavailable);
export const inquiryInternalErrorSchema = inquiryStatusErrorSchema(API_ERROR_CODES.internal_error);
export const inquiryNotFoundErrorSchema = inquiryStatusErrorSchema(API_ERROR_CODES.not_found);
export const unauthorizedErrorSchema = inquiryStatusErrorSchema(API_ERROR_CODES.unauthorized);
export const forbiddenErrorSchema = inquiryStatusErrorSchema(API_ERROR_CODES.forbidden);
export const conflictErrorSchema = inquiryStatusErrorSchema(API_ERROR_CODES.conflict);
export const managementAuthUnavailableErrorSchema = inquiryStatusErrorSchema(
  API_ERROR_CODES.management_auth_unavailable,
);
export const managementStorageUnavailableErrorSchema = inquiryStatusErrorSchema(
  API_ERROR_CODES.management_storage_unavailable,
);
export const contentVersionConflictErrorSchema = inquiryStatusErrorSchema(API_ERROR_CODES.content_version_conflict);
export const malformedResponseErrorSchema = inquiryStatusErrorSchema(API_ERROR_CODES.malformed_response);

export const inquiryCreateErrorSchema = z.union([
  inquiryBadRequestErrorSchema,
  inquiryUnsupportedMediaTypeErrorSchema,
  inquiryAttachmentNotAvailableErrorSchema,
  inquiryRateLimitErrorSchema,
  inquiryServiceUnavailableErrorSchema,
  inquiryInternalErrorSchema,
]);

/** @deprecated Use inquiryBadRequestErrorSchema. Kept as a named alias for the 400 envelope. */
export const inquiryValidationErrorSchema = inquiryBadRequestErrorSchema;

export const inquiryErrorSchemaByCode = {
  bad_request: inquiryBadRequestErrorSchema,
  unsupported_media_type: inquiryUnsupportedMediaTypeErrorSchema,
  attachment_not_available: inquiryAttachmentNotAvailableErrorSchema,
  rate_limited: inquiryRateLimitErrorSchema,
  service_unavailable: inquiryServiceUnavailableErrorSchema,
  internal_error: inquiryInternalErrorSchema,
  not_found: inquiryNotFoundErrorSchema,
} as const;

export type InquiryInput = z.infer<typeof inquiryInputSchema>;
export type InquiryCreateRequest = z.infer<typeof inquiryCreateRequestSchema>;
export type InquiryAttachmentMeta = z.infer<typeof inquiryAttachmentMetaSchema>;
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;
export type InquiryCreatedResponse = z.infer<typeof inquiryCreatedResponseSchema>;
export type InquiryBadRequestError = z.infer<typeof inquiryBadRequestErrorSchema>;
export type InquiryUnsupportedMediaTypeError = z.infer<typeof inquiryUnsupportedMediaTypeErrorSchema>;
export type InquiryAttachmentNotAvailableError = z.infer<typeof inquiryAttachmentNotAvailableErrorSchema>;
export type InquiryRateLimitError = z.infer<typeof inquiryRateLimitErrorSchema>;
export type InquiryServiceUnavailableError = z.infer<typeof inquiryServiceUnavailableErrorSchema>;
export type InquiryInternalError = z.infer<typeof inquiryInternalErrorSchema>;
export type InquiryCreateError = z.infer<typeof inquiryCreateErrorSchema>;

export const managementSessionResponseSchema = z
  .object({
    authenticated: z.literal(true),
    role: z.literal("administrator"),
  })
  .strict();

export type ManagementSessionResponse = z.infer<typeof managementSessionResponseSchema>;

export const managementInquiryAttachmentSchema = z
  .object({
    originalName: z.string().min(1).max(255),
    mimeType: z.string().min(1).max(100),
    byteSize: z.number().int().positive(),
  })
  .strict();

export const managementInquirySummarySchema = z
  .object({
    id: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().min(1),
    phone: z.string().min(1),
    status: inquiryStatusSchema,
    createdAt: z.iso.datetime({ offset: true }),
    updatedAt: z.iso.datetime({ offset: true }),
    hasAttachment: z.boolean(),
  })
  .strict();

export const managementInquiryListResponseSchema = z
  .object({
    inquiries: z.array(managementInquirySummarySchema),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();

export const managementInquiryDetailSchema = z
  .object({
    id: z.string().uuid(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().min(1),
    phone: z.string().min(1),
    status: inquiryStatusSchema,
    createdAt: z.iso.datetime({ offset: true }),
    updatedAt: z.iso.datetime({ offset: true }),
    hasAttachment: z.boolean(),
    message: z.string().min(1),
    attachment: managementInquiryAttachmentSchema.nullable(),
  })
  .strict();

export const managementInquiryStatusUpdateSchema = z
  .object({
    status: inquiryStatusSchema,
  })
  .strict();

export const MANAGEMENT_INQUIRY_LIST_DEFAULT_LIMIT = 20;
export const MANAGEMENT_INQUIRY_LIST_MIN_LIMIT = 1;
export const MANAGEMENT_INQUIRY_LIST_MAX_LIMIT = 50;
export const MANAGEMENT_INQUIRY_CURSOR_MAX_LENGTH = 256;
export const MANAGEMENT_PUBLICATION_LIST_DEFAULT_LIMIT = 20;
export const MANAGEMENT_PUBLICATION_LIST_MIN_LIMIT = 1;
export const MANAGEMENT_PUBLICATION_LIST_MAX_LIMIT = 50;

export const managementInquiryListQuerySchema = z
  .object({
    status: inquiryStatusSchema.optional(),
    cursor: z.string().min(1).max(MANAGEMENT_INQUIRY_CURSOR_MAX_LENGTH).optional(),
    limit: z
      .number()
      .int()
      .min(MANAGEMENT_INQUIRY_LIST_MIN_LIMIT)
      .max(MANAGEMENT_INQUIRY_LIST_MAX_LIMIT)
      .optional(),
  })
  .strict();

export type ManagementInquiryListQuery = {
  status?: z.infer<typeof inquiryStatusSchema>;
  cursor?: string;
  limit: number;
};

function isPlainQueryObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseManagementInquiryListQuery(query: unknown): ManagementInquiryListQuery | null {
  if (query === undefined) {
    return { limit: MANAGEMENT_INQUIRY_LIST_DEFAULT_LIMIT };
  }
  if (!isPlainQueryObject(query)) return null;
  const allowed = new Set(["status", "cursor", "limit"]);
  for (const [key, value] of Object.entries(query)) {
    if (!allowed.has(key)) return null;
    if (Array.isArray(value)) return null;
  }

  let limit = MANAGEMENT_INQUIRY_LIST_DEFAULT_LIMIT;
  if (query.limit !== undefined) {
    if (typeof query.limit === "number") {
      if (!Number.isInteger(query.limit)) return null;
      limit = query.limit;
    } else if (typeof query.limit === "string") {
      if (!/^[0-9]+$/.test(query.limit)) return null;
      limit = Number(query.limit);
    } else {
      return null;
    }
  }

  const parsed = managementInquiryListQuerySchema.safeParse({
    status: query.status,
    cursor: query.cursor,
    limit,
  });
  if (!parsed.success) return null;
  return {
    status: parsed.data.status,
    cursor: parsed.data.cursor,
    limit: parsed.data.limit ?? MANAGEMENT_INQUIRY_LIST_DEFAULT_LIMIT,
  };
}

export type ManagementInquiryAttachment = z.infer<typeof managementInquiryAttachmentSchema>;
export type ManagementInquirySummary = z.infer<typeof managementInquirySummarySchema>;
export type ManagementInquiryListResponse = z.infer<typeof managementInquiryListResponseSchema>;
export type ManagementInquiryDetail = z.infer<typeof managementInquiryDetailSchema>;
export type ManagementInquiryStatusUpdate = z.infer<typeof managementInquiryStatusUpdateSchema>;

export const CONTENT_DRAFT_KEYS = [
  "homepage.heroHeading",
  "homepage.heroSupporting",
  "homepage.servicesHeading",
  "homepage.servicesIntroduction",
  "homepage.aboutEyebrow",
  "homepage.aboutHeading",
  "homepage.aboutParagraph1",
  "homepage.aboutParagraph2",
  "homepage.closingCtaHeading",
  "homepage.closingCtaSupporting",
  "contact.heading",
  "contact.introduction",
  "thankYou.heading",
  "thankYou.supporting",
] as const;

export type ContentDraftKey = (typeof CONTENT_DRAFT_KEYS)[number];

export const contentDraftKeySchema = z.enum(CONTENT_DRAFT_KEYS);

export const CONTENT_DRAFT_PLAIN_TEXT_POLICY = "plain_text_no_html" as const;

export const contentDraftValueSchema = z
  .string()
  .trim()
  .min(1)
  .max(2000)
  .refine((value) => !value.includes("<") && !value.includes(">"), { message: "html_not_allowed" });

export const contentDraftUpsertSchema = z
  .object({
    value: contentDraftValueSchema,
    expectedVersion: z.number().int().min(0),
  })
  .strict();

export const contentDraftResetSchema = z
  .object({
    expectedVersion: z.number().int().min(0),
  })
  .strict();

export const contentDraftItemSchema = z
  .object({
    key: contentDraftKeySchema,
    page: z.string().min(1),
    section: z.string().min(1),
    label: z.string().min(1),
    description: z.string().min(1),
    value: z.string(),
    canonicalValue: z.string().min(1),
    version: z.number().int().min(0),
    createdAt: z.iso.datetime({ offset: true }).nullable(),
    updatedAt: z.iso.datetime({ offset: true }).nullable(),
    updatedBySubject: z.string().min(1).nullable(),
    isDraft: z.boolean(),
    minLength: z.number().int().positive(),
    maxLength: z.number().int().positive(),
    multiline: z.boolean(),
    canonicalSelector: z.string().min(1),
    plainTextPolicy: z.literal(CONTENT_DRAFT_PLAIN_TEXT_POLICY),
  })
  .strict();

export const contentDraftListResponseSchema = z
  .object({
    drafts: z.array(contentDraftItemSchema),
  })
  .strict();

export const contentPublicationStatusSchema = z.literal("prepared");
export const contentPublicationEntrySourceSchema = z.enum(["canonical", "draft"]);

export const contentPublicationEntrySchema = z
  .object({
    key: contentDraftKeySchema,
    value: z.string().min(1),
    source: contentPublicationEntrySourceSchema,
    sourceDraftVersion: z.number().int().positive().nullable(),
  })
  .strict();

export const contentPublicationSummarySchema = z
  .object({
    id: z.string().uuid(),
    status: contentPublicationStatusSchema,
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    entryCount: z.number().int().positive(),
    createdAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const contentPublicationDetailSchema = contentPublicationSummarySchema
  .extend({
    entries: z.array(contentPublicationEntrySchema),
  })
  .strict();

export const contentPublicationListResponseSchema = z
  .object({
    publications: z.array(contentPublicationSummarySchema),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();

export const contentPublicationPrepareSchema = z
  .object({
    expectedDraftVersions: z.record(z.string(), z.number().int().positive()).default({}),
  })
  .strict()
  .superRefine((value, ctx) => {
    for (const key of Object.keys(value.expectedDraftVersions)) {
      if (!contentDraftKeySchema.safeParse(key).success) {
        ctx.addIssue({ code: "custom", path: ["expectedDraftVersions", key], message: "unknown_content_key" });
      }
    }
  });

export const managementPublicationListQuerySchema = z
  .object({
    cursor: z.string().min(1).max(MANAGEMENT_INQUIRY_CURSOR_MAX_LENGTH).optional(),
    limit: z
      .number()
      .int()
      .min(MANAGEMENT_PUBLICATION_LIST_MIN_LIMIT)
      .max(MANAGEMENT_PUBLICATION_LIST_MAX_LIMIT)
      .optional(),
  })
  .strict();

export type ManagementPublicationListQuery = {
  cursor?: string;
  limit: number;
};

export function parseManagementPublicationListQuery(query: unknown): ManagementPublicationListQuery | null {
  if (query === undefined) {
    return { limit: MANAGEMENT_PUBLICATION_LIST_DEFAULT_LIMIT };
  }
  if (!isPlainQueryObject(query)) return null;
  const allowed = new Set(["cursor", "limit"]);
  for (const [key, value] of Object.entries(query)) {
    if (!allowed.has(key)) return null;
    if (Array.isArray(value)) return null;
  }
  let limit = MANAGEMENT_PUBLICATION_LIST_DEFAULT_LIMIT;
  if (query.limit !== undefined) {
    if (typeof query.limit === "number") {
      if (!Number.isInteger(query.limit)) return null;
      limit = query.limit;
    } else if (typeof query.limit === "string") {
      if (!/^[0-9]+$/.test(query.limit)) return null;
      limit = Number(query.limit);
    } else {
      return null;
    }
  }
  const parsed = managementPublicationListQuerySchema.safeParse({
    cursor: query.cursor,
    limit,
  });
  if (!parsed.success) return null;
  return {
    cursor: parsed.data.cursor,
    limit: parsed.data.limit ?? MANAGEMENT_PUBLICATION_LIST_DEFAULT_LIMIT,
  };
}

export type ContentDraftUpsert = z.infer<typeof contentDraftUpsertSchema>;
export type ContentDraftReset = z.infer<typeof contentDraftResetSchema>;
export type ContentDraftItem = z.infer<typeof contentDraftItemSchema>;
export type ContentDraftListResponse = z.infer<typeof contentDraftListResponseSchema>;
export type ContentPublicationEntry = z.infer<typeof contentPublicationEntrySchema>;
export type ContentPublicationSummary = z.infer<typeof contentPublicationSummarySchema>;
export type ContentPublicationDetail = z.infer<typeof contentPublicationDetailSchema>;
export type ContentPublicationListResponse = z.infer<typeof contentPublicationListResponseSchema>;
export type ContentPublicationPrepare = z.infer<typeof contentPublicationPrepareSchema>;

export const publicationStateSchema = z.enum(["draft", "published", "archived"]);

export type PublicationState = z.infer<typeof publicationStateSchema>;
