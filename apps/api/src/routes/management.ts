import { z } from "zod";
import type { FastifyInstance, FastifyReply } from "fastify";
import {
  API_ERROR_CODES,
  CONTENT_DRAFT_KEYS,
  CONTENT_DRAFT_PLAIN_TEXT_POLICY,
  contentDraftKeySchema,
  contentDraftItemSchema,
  contentDraftListResponseSchema,
  contentDraftResetSchema,
  contentDraftUpsertSchema,
  contentDraftValueSchema,
  contentPublicationDetailSchema,
  contentPublicationListResponseSchema,
  contentPublicationPrepareSchema,
  contentVersionConflictErrorSchema,
  inquiryBadRequestErrorSchema,
  inquiryNotFoundErrorSchema,
  inquiryUnsupportedMediaTypeErrorSchema,
  managementInquiryDetailSchema,
  managementInquiryListResponseSchema,
  managementInquiryStatusUpdateSchema,
  managementSessionResponseSchema,
  managementStorageUnavailableErrorSchema,
  parseManagementInquiryListQuery,
  parseManagementPublicationListQuery,
  type ContentDraftItem,
  type ContentDraftKey,
} from "@ats/contracts";
import { isJsonMediaType } from "../lib/json-content-type.js";
import { decodeInquiryCursor } from "../lib/inquiry-cursor.js";
import { applyManagementCacheControl, authorizeManagementRequest } from "../auth/require-management.js";
import type { AuthVerifier } from "../auth/types.js";
import { CONTENT_DRAFT_REGISTRY } from "../content/registry.js";
import type { ContentDraftRepository } from "../repositories/content-draft-repository.js";
import {
  ContentDraftPersistenceUnavailableError,
  ContentDraftVersionConflictError,
} from "../repositories/content-draft-repository.js";
import type { PublicationRepository } from "../repositories/publication-repository.js";
import { PublicationPersistenceUnavailableError } from "../repositories/publication-repository.js";
import { PublicationEntryValidationError } from "../content/overlay-drafts.js";
import type { InquiryRepository, InquirySummaryRecord, StoredInquiry } from "../repositories/inquiry-repository.js";
import { InquiryPersistenceUnavailableError } from "../repositories/inquiry-repository.js";

export type ManagementRouteOptions = {
  verifier: AuthVerifier;
  repository: InquiryRepository;
  contentDraftRepository: ContentDraftRepository;
  publicationRepository: PublicationRepository;
};

const inquiryIdSchema = z.string().uuid();

function sendBadRequest(reply: FastifyReply, message: string) {
  applyManagementCacheControl(reply);
  return reply.code(400).send(
    inquiryBadRequestErrorSchema.parse({
      error: { code: API_ERROR_CODES.bad_request, message },
    }),
  );
}

function sendNotFound(reply: FastifyReply) {
  applyManagementCacheControl(reply);
  return reply.code(404).send(
    inquiryNotFoundErrorSchema.parse({
      error: { code: API_ERROR_CODES.not_found, message: "Not found" },
    }),
  );
}

function sendUnsupportedMediaType(reply: FastifyReply) {
  applyManagementCacheControl(reply);
  return reply.code(415).send(
    inquiryUnsupportedMediaTypeErrorSchema.parse({
      error: { code: API_ERROR_CODES.unsupported_media_type, message: "Unsupported media type" },
    }),
  );
}

function sendConflict(reply: FastifyReply) {
  applyManagementCacheControl(reply);
  return reply.code(409).send(
    contentVersionConflictErrorSchema.parse({
      error: { code: API_ERROR_CODES.content_version_conflict, message: "Content draft version conflict" },
    }),
  );
}

function sendStorageUnavailable(reply: FastifyReply, message = "Management storage is unavailable") {
  applyManagementCacheControl(reply);
  return reply.code(503).send(
    managementStorageUnavailableErrorSchema.parse({
      error: { code: API_ERROR_CODES.management_storage_unavailable, message },
    }),
  );
}

function toIso(value: Date): string {
  return value.toISOString();
}

function toSummary(row: InquirySummaryRecord) {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    status: row.status,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    hasAttachment: row.hasAttachment,
  };
}

function toDetail(row: StoredInquiry) {
  const attachment =
    row.attachmentOriginalName && row.attachmentMimeType && row.attachmentByteSize
      ? {
          originalName: row.attachmentOriginalName,
          mimeType: row.attachmentMimeType,
          byteSize: row.attachmentByteSize,
        }
      : null;
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    status: row.status,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    hasAttachment: Boolean(row.attachmentOriginalName),
    message: row.message,
    attachment,
  };
}

function toDraftItem(
  key: ContentDraftKey,
  stored: {
    value: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    updatedBySubject: string;
  } | null,
): ContentDraftItem {
  const definition = CONTENT_DRAFT_REGISTRY[key];
  const isDraft = Boolean(stored);
  return {
    key,
    page: definition.page,
    section: definition.section,
    label: definition.label,
    description: definition.description,
    value: stored?.value ?? definition.canonicalValue,
    canonicalValue: definition.canonicalValue,
    version: stored?.version ?? 0,
    createdAt: stored ? toIso(stored.createdAt) : null,
    updatedAt: stored ? toIso(stored.updatedAt) : null,
    updatedBySubject: stored?.updatedBySubject ?? null,
    isDraft,
    minLength: definition.minLength,
    maxLength: definition.maxLength,
    multiline: definition.multiline,
    canonicalSelector: definition.canonicalSelector,
    plainTextPolicy: CONTENT_DRAFT_PLAIN_TEXT_POLICY,
  };
}

function toPublicationSummary(row: {
  id: string;
  status: "prepared";
  contentHash: string;
  entryCount: number;
  createdAt: Date;
}) {
  return {
    id: row.id,
    status: row.status,
    contentHash: row.contentHash,
    entryCount: row.entryCount,
    createdAt: toIso(row.createdAt),
  };
}

export async function managementRoutes(app: FastifyInstance, options: ManagementRouteOptions): Promise<void> {
  const { verifier, repository, contentDraftRepository, publicationRepository } = options;

  app.get("/management/session", async (request, reply) => {
    const principal = await authorizeManagementRequest(request, reply, verifier);
    if (!principal) return;
    return reply.code(200).send(
      managementSessionResponseSchema.parse({
        authenticated: true,
        role: principal.role,
      }),
    );
  });

  app.get("/management/inquiries", async (request, reply) => {
    const principal = await authorizeManagementRequest(request, reply, verifier);
    if (!principal) return;

    const parsedQuery = parseManagementInquiryListQuery(request.query);
    if (!parsedQuery) return sendBadRequest(reply, "Invalid inquiry filter");
    const cursor = parsedQuery.cursor ? decodeInquiryCursor(parsedQuery.cursor) : undefined;
    if (parsedQuery.cursor && !cursor) return sendBadRequest(reply, "Invalid inquiry filter");

    try {
      const page = await repository.listInquiries({
        status: parsedQuery.status,
        cursor: cursor ?? undefined,
        limit: parsedQuery.limit,
      });
      return reply.code(200).send(
        managementInquiryListResponseSchema.parse({
          inquiries: page.inquiries.map(toSummary),
          nextCursor: page.nextCursor,
        }),
      );
    } catch (error) {
      if (error instanceof InquiryPersistenceUnavailableError) {
        return sendStorageUnavailable(reply);
      }
      throw error;
    }
  });

  app.get("/management/inquiries/:id", async (request, reply) => {
    const principal = await authorizeManagementRequest(request, reply, verifier);
    if (!principal) return;

    const { id } = request.params as { id: string };
    if (!inquiryIdSchema.safeParse(id).success) return sendBadRequest(reply, "Invalid inquiry");

    try {
      const row = await repository.getInquiry(id);
      if (!row) return sendNotFound(reply);
      return reply.code(200).send(managementInquiryDetailSchema.parse(toDetail(row)));
    } catch (error) {
      if (error instanceof InquiryPersistenceUnavailableError) {
        return sendStorageUnavailable(reply);
      }
      throw error;
    }
  });

  app.patch("/management/inquiries/:id/status", async (request, reply) => {
    const principal = await authorizeManagementRequest(request, reply, verifier);
    if (!principal) return;

    const { id } = request.params as { id: string };
    if (!inquiryIdSchema.safeParse(id).success) return sendBadRequest(reply, "Invalid inquiry");
    if (!isJsonMediaType(request.headers["content-type"])) {
      return sendUnsupportedMediaType(reply);
    }

    const parsed = managementInquiryStatusUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendBadRequest(reply, "Invalid inquiry");
    }

    try {
      const row = await repository.updateInquiryStatus(id, parsed.data.status);
      if (!row) return sendNotFound(reply);
      return reply.code(200).send(managementInquiryDetailSchema.parse(toDetail(row)));
    } catch (error) {
      if (error instanceof InquiryPersistenceUnavailableError) {
        return sendStorageUnavailable(reply);
      }
      throw error;
    }
  });

  app.get("/management/content/drafts", async (request, reply) => {
    const principal = await authorizeManagementRequest(request, reply, verifier);
    if (!principal) return;
    try {
      const stored = await contentDraftRepository.listDrafts();
      const byKey = new Map(stored.map((item) => [item.key, item]));
      return reply.code(200).send(
        contentDraftListResponseSchema.parse({
          drafts: CONTENT_DRAFT_KEYS.map((key) => toDraftItem(key, byKey.get(key) ?? null)),
        }),
      );
    } catch (error) {
      if (error instanceof ContentDraftPersistenceUnavailableError) {
        return sendStorageUnavailable(reply, "Content draft storage is unavailable");
      }
      throw error;
    }
  });

  app.get("/management/content/drafts/:key", async (request, reply) => {
    const principal = await authorizeManagementRequest(request, reply, verifier);
    if (!principal) return;
    const { key } = request.params as { key: string };
    const parsedKey = contentDraftKeySchema.safeParse(key);
    if (!parsedKey.success) return sendNotFound(reply);
    try {
      const stored = await contentDraftRepository.getDraft(parsedKey.data);
      return reply.code(200).send(contentDraftItemSchema.parse(toDraftItem(parsedKey.data, stored)));
    } catch (error) {
      if (error instanceof ContentDraftPersistenceUnavailableError) {
        return sendStorageUnavailable(reply, "Content draft storage is unavailable");
      }
      throw error;
    }
  });

  app.put("/management/content/drafts/:key", async (request, reply) => {
    const principal = await authorizeManagementRequest(request, reply, verifier);
    if (!principal) return;
    const { key } = request.params as { key: string };
    const parsedKey = contentDraftKeySchema.safeParse(key);
    if (!parsedKey.success) return sendNotFound(reply);
    if (!isJsonMediaType(request.headers["content-type"])) {
      return sendUnsupportedMediaType(reply);
    }
    const parsedBody = contentDraftUpsertSchema.safeParse(request.body);
    if (!parsedBody.success) return sendBadRequest(reply, "Invalid content draft");
    const definition = CONTENT_DRAFT_REGISTRY[parsedKey.data];
    if (
      parsedBody.data.value.length < definition.minLength ||
      parsedBody.data.value.length > definition.maxLength
    ) {
      return sendBadRequest(reply, "Invalid content draft");
    }
    const bounded = contentDraftValueSchema.safeParse(parsedBody.data.value);
    if (!bounded.success) return sendBadRequest(reply, "Invalid content draft");
    try {
      const stored = await contentDraftRepository.saveDraft(
        parsedKey.data,
        bounded.data,
        parsedBody.data.expectedVersion,
        principal.subject,
      );
      return reply.code(200).send(contentDraftItemSchema.parse(toDraftItem(parsedKey.data, stored)));
    } catch (error) {
      if (error instanceof ContentDraftVersionConflictError) {
        return sendConflict(reply);
      }
      if (error instanceof ContentDraftPersistenceUnavailableError) {
        return sendStorageUnavailable(reply, "Content draft storage is unavailable");
      }
      throw error;
    }
  });

  app.post("/management/content/drafts/:key/reset", async (request, reply) => {
    const principal = await authorizeManagementRequest(request, reply, verifier);
    if (!principal) return;
    const { key } = request.params as { key: string };
    const parsedKey = contentDraftKeySchema.safeParse(key);
    if (!parsedKey.success) return sendNotFound(reply);
    if (!isJsonMediaType(request.headers["content-type"])) {
      return sendUnsupportedMediaType(reply);
    }
    const parsedBody = contentDraftResetSchema.safeParse(request.body);
    if (!parsedBody.success) return sendBadRequest(reply, "Invalid content draft");
    try {
      await contentDraftRepository.resetDraft(parsedKey.data, parsedBody.data.expectedVersion);
      return reply.code(200).send(contentDraftItemSchema.parse(toDraftItem(parsedKey.data, null)));
    } catch (error) {
      if (error instanceof ContentDraftVersionConflictError) {
        return sendConflict(reply);
      }
      if (error instanceof ContentDraftPersistenceUnavailableError) {
        return sendStorageUnavailable(reply, "Content draft storage is unavailable");
      }
      throw error;
    }
  });

  app.get("/management/content/publications", async (request, reply) => {
    const principal = await authorizeManagementRequest(request, reply, verifier);
    if (!principal) return;
    const parsedQuery = parseManagementPublicationListQuery(request.query);
    if (!parsedQuery) return sendBadRequest(reply, "Invalid publication filter");
    const cursor = parsedQuery.cursor ? decodeInquiryCursor(parsedQuery.cursor) : undefined;
    if (parsedQuery.cursor && !cursor) return sendBadRequest(reply, "Invalid publication filter");
    try {
      const page = await publicationRepository.listPublications({
        cursor: cursor ?? undefined,
        limit: parsedQuery.limit,
      });
      return reply.code(200).send(
        contentPublicationListResponseSchema.parse({
          publications: page.publications.map(toPublicationSummary),
          nextCursor: page.nextCursor,
        }),
      );
    } catch (error) {
      if (error instanceof PublicationPersistenceUnavailableError) {
        return sendStorageUnavailable(reply, "Publication storage is unavailable");
      }
      throw error;
    }
  });

  app.get("/management/content/publications/:id", async (request, reply) => {
    const principal = await authorizeManagementRequest(request, reply, verifier);
    if (!principal) return;
    const { id } = request.params as { id: string };
    if (!inquiryIdSchema.safeParse(id).success) return sendBadRequest(reply, "Invalid publication");
    try {
      const publication = await publicationRepository.getPublication(id);
      if (!publication) return sendNotFound(reply);
      return reply.code(200).send(
        contentPublicationDetailSchema.parse({
          ...toPublicationSummary(publication),
          entries: publication.entries,
        }),
      );
    } catch (error) {
      if (error instanceof PublicationPersistenceUnavailableError) {
        return sendStorageUnavailable(reply, "Publication storage is unavailable");
      }
      throw error;
    }
  });

  app.post("/management/content/publications/prepare", async (request, reply) => {
    const principal = await authorizeManagementRequest(request, reply, verifier);
    if (!principal) return;
    if (!isJsonMediaType(request.headers["content-type"])) {
      return sendUnsupportedMediaType(reply);
    }
    const parsedBody = contentPublicationPrepareSchema.safeParse(request.body);
    if (!parsedBody.success) return sendBadRequest(reply, "Invalid publication");
    try {
      const publication = await publicationRepository.preparePublication({
        createdBySubject: principal.subject,
        expectedDraftVersions: parsedBody.data.expectedDraftVersions,
      });
      return reply.code(201).send(
        contentPublicationDetailSchema.parse({
          ...toPublicationSummary(publication),
          entries: publication.entries,
        }),
      );
    } catch (error) {
      if (error instanceof ContentDraftVersionConflictError) {
        return sendConflict(reply);
      }
      if (error instanceof PublicationEntryValidationError) {
        return sendBadRequest(reply, "Invalid publication");
      }
      if (
        error instanceof ContentDraftPersistenceUnavailableError ||
        error instanceof PublicationPersistenceUnavailableError
      ) {
        return sendStorageUnavailable(reply, "Publication storage is unavailable");
      }
      throw error;
    }
  });
}
