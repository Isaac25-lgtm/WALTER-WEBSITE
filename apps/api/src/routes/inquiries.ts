import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  API_ERROR_CODES,
  inquiryAttachmentNotAvailableErrorSchema,
  inquiryBadRequestErrorSchema,
  inquiryCreateRequestSchema,
  inquiryCreatedResponseSchema,
  inquiryServiceUnavailableErrorSchema,
  inquiryUnsupportedMediaTypeErrorSchema,
} from "@ats/contracts";
import { INQUIRY_BODY_LIMIT_BYTES } from "@ats/config";
import { isJsonMediaType } from "../lib/json-content-type.js";
import type { InquiryRepository } from "../repositories/inquiry-repository.js";
import { InquiryPersistenceUnavailableError } from "../repositories/inquiry-repository.js";

export type InquiryRouteOptions = {
  repository: InquiryRepository;
  rateLimitMax: number;
  rateLimitWindowMs: number;
};

function sendBadRequest(reply: FastifyReply, message: string) {
  return reply.code(400).send(
    inquiryBadRequestErrorSchema.parse({
      error: { code: API_ERROR_CODES.bad_request, message },
    }),
  );
}

function sendUnsupportedMediaType(reply: FastifyReply) {
  return reply.code(415).send(
    inquiryUnsupportedMediaTypeErrorSchema.parse({
      error: { code: API_ERROR_CODES.unsupported_media_type, message: "Unsupported media type" },
    }),
  );
}

function sendAttachmentUnavailable(reply: FastifyReply) {
  return reply.code(422).send(
    inquiryAttachmentNotAvailableErrorSchema.parse({
      error: {
        code: API_ERROR_CODES.attachment_not_available,
        message: "Attachments are not available yet",
      },
    }),
  );
}

function sendServiceUnavailable(reply: FastifyReply) {
  return reply.code(503).send(
    inquiryServiceUnavailableErrorSchema.parse({
      error: { code: API_ERROR_CODES.service_unavailable, message: "Inquiry storage is unavailable" },
    }),
  );
}

function isJsonContentType(request: FastifyRequest): boolean {
  return isJsonMediaType(request.headers["content-type"]);
}

export async function inquiryRoutes(app: FastifyInstance, options: InquiryRouteOptions): Promise<void> {
  const { repository, rateLimitMax, rateLimitWindowMs } = options;

  app.post(
    "/inquiries",
    {
      bodyLimit: INQUIRY_BODY_LIMIT_BYTES,
      config: {
        rateLimit: {
          max: rateLimitMax,
          timeWindow: rateLimitWindowMs,
        },
      },
    },
    async (request, reply) => {
      if (!isJsonContentType(request)) {
        return sendUnsupportedMediaType(reply);
      }

      const parsed = inquiryCreateRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendBadRequest(reply, "Invalid inquiry");
      }

      const website = parsed.data.website?.trim() ?? "";
      if (website.length > 0) {
        return reply.code(201).send(
          inquiryCreatedResponseSchema.parse({
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            acknowledgement: "accepted",
          }),
        );
      }

      if (parsed.data.attachment) {
        return sendAttachmentUnavailable(reply);
      }

      try {
        const created = await repository.createInquiry({
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          message: parsed.data.message,
        });
        return reply.code(201).send(
          inquiryCreatedResponseSchema.parse({
            id: created.id,
            createdAt: created.createdAt.toISOString(),
            acknowledgement: "accepted",
          }),
        );
      } catch (error) {
        if (error instanceof InquiryPersistenceUnavailableError) {
          return sendServiceUnavailable(reply);
        }
        throw error;
      }
    },
  );
}
