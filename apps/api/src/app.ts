import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify, { LogController, type FastifyInstance, type FastifyServerOptions } from "fastify";
import {
  API_ERROR_CODES,
  contentVersionConflictErrorSchema,
  forbiddenErrorSchema,
  inquiryBadRequestErrorSchema,
  inquiryInternalErrorSchema,
  inquiryNotFoundErrorSchema,
  inquiryRateLimitErrorSchema,
  inquiryServiceUnavailableErrorSchema,
  inquiryUnsupportedMediaTypeErrorSchema,
  managementStorageUnavailableErrorSchema,
  unauthorizedErrorSchema,
} from "@ats/contracts";
import { loadConfig, readDatabaseUrl, type ApiConfig } from "./config/env.js";
import { applyManagementCacheControl } from "./auth/require-management.js";
import { createAuthVerifier, type AuthVerifier } from "./auth/create-auth-verifier.js";
import { createInquiryRateLimitKey } from "./lib/client-address.js";
import { createLoggerOptions, safeErrorLog } from "./lib/logger.js";
import { createAppPersistence } from "./repositories/create-content-persistence.js";
import type { InquiryRepository } from "./repositories/inquiry-repository.js";
import type { ContentDraftRepository } from "./repositories/content-draft-repository.js";
import type { PublicationRepository } from "./repositories/publication-repository.js";
import { healthRoutes } from "./routes/health.js";
import { inquiryRoutes } from "./routes/inquiries.js";
import { managementRoutes } from "./routes/management.js";

export type BuildAppOptions = {
  config?: ApiConfig;
  logger?: FastifyServerOptions["logger"];
  inquiryRepository?: InquiryRepository;
  contentDraftRepository?: ContentDraftRepository;
  publicationRepository?: PublicationRepository;
  authVerifier?: AuthVerifier;
};

function safeClientMessage(statusCode: number): string {
  if (statusCode === 400) return "Bad request";
  if (statusCode === 413) return "Payload too large";
  if (statusCode === 415) return "Unsupported media type";
  if (statusCode === 429) return "Too many inquiry attempts. Try again later.";
  if (statusCode === 503) return "Service unavailable";
  return "Internal server error";
}

function envelopeForStatus(statusCode: number, url = ""): { payload: unknown; status: number } {
  const message = safeClientMessage(statusCode);
  const management = url.startsWith("/management");
  if (statusCode === 400) {
    return {
      status: 400,
      payload: inquiryBadRequestErrorSchema.parse({
        error: { code: API_ERROR_CODES.bad_request, message },
      }),
    };
  }
  if (statusCode === 404) {
    return {
      status: 404,
      payload: inquiryNotFoundErrorSchema.parse({
        error: { code: API_ERROR_CODES.not_found, message: "Not found" },
      }),
    };
  }
  if (statusCode === 415) {
    return {
      status: 415,
      payload: inquiryUnsupportedMediaTypeErrorSchema.parse({
        error: { code: API_ERROR_CODES.unsupported_media_type, message },
      }),
    };
  }
  if (statusCode === 429) {
    return {
      status: 429,
      payload: inquiryRateLimitErrorSchema.parse({
        error: { code: API_ERROR_CODES.rate_limited, message },
      }),
    };
  }
  if (statusCode === 401) {
    return {
      status: 401,
      payload: unauthorizedErrorSchema.parse({
        error: { code: API_ERROR_CODES.unauthorized, message: "Authentication required" },
      }),
    };
  }
  if (statusCode === 403) {
    return {
      status: 403,
      payload: forbiddenErrorSchema.parse({
        error: { code: API_ERROR_CODES.forbidden, message: "Administrator authorisation required" },
      }),
    };
  }
  if (statusCode === 409) {
    return {
      status: 409,
      payload: contentVersionConflictErrorSchema.parse({
        error: { code: API_ERROR_CODES.content_version_conflict, message: "Content draft version conflict" },
      }),
    };
  }
  if (statusCode === 503) {
    if (management) {
      return {
        status: 503,
        payload: managementStorageUnavailableErrorSchema.parse({
          error: { code: API_ERROR_CODES.management_storage_unavailable, message },
        }),
      };
    }
    return {
      status: 503,
      payload: inquiryServiceUnavailableErrorSchema.parse({
        error: { code: API_ERROR_CODES.service_unavailable, message },
      }),
    };
  }
  return {
    status: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
    payload: inquiryInternalErrorSchema.parse({
      error: { code: API_ERROR_CODES.internal_error, message: safeClientMessage(500) },
    }),
  };
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const config = options.config ?? loadConfig();
  const logger = options.logger === undefined ? createLoggerOptions() : options.logger;
  const app = Fastify({
    logger,
    bodyLimit: config.bodyLimitBytes,
    trustProxy: false,
    logController: new LogController({ disableRequestLogging: true }),
  });

  const injectedInquiry = options.inquiryRepository;
  const injectedDrafts = options.contentDraftRepository;
  const injectedPublications = options.publicationRepository;
  const created =
    injectedInquiry && injectedDrafts && injectedPublications ? null : createAppPersistence(readDatabaseUrl());
  const repository = injectedInquiry ?? created?.inquiryRepository;
  const contentDraftRepository = injectedDrafts ?? created?.contentDraftRepository;
  const publicationRepository = injectedPublications ?? created?.publicationRepository;
  if (!repository || !contentDraftRepository || !publicationRepository) {
    throw new Error("Management persistence was not constructed");
  }
  const authVerifier = options.authVerifier ?? createAuthVerifier(config);

  app.addHook("onClose", async () => {
    if (created) await created.end();
  });

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, false);
        return;
      }
      callback(null, config.corsOrigins.includes(origin));
    },
    credentials: false,
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
  });

  app.addHook("onSend", async (request, reply, payload) => {
    if (request.url.startsWith("/management")) {
      applyManagementCacheControl(reply);
    }
    return payload;
  });

  await app.register(rateLimit, {
    global: false,
    max: config.inquiryRateLimitMax,
    timeWindow: config.inquiryRateLimitWindowMs,
    keyGenerator: createInquiryRateLimitKey(config.trustRenderClientIp),
    addHeadersOnExceeding: {
      "x-ratelimit-limit": false,
      "x-ratelimit-remaining": false,
      "x-ratelimit-reset": false,
    },
    addHeaders: {
      "x-ratelimit-limit": false,
      "x-ratelimit-remaining": false,
      "x-ratelimit-reset": false,
      "retry-after": true,
    },
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: {
        code: API_ERROR_CODES.rate_limited,
        message: "Too many inquiry attempts. Try again later.",
      },
    }),
  });

  await app.register(healthRoutes);
  await inquiryRoutes(app, {
    repository,
    rateLimitMax: config.inquiryRateLimitMax,
    rateLimitWindowMs: config.inquiryRateLimitWindowMs,
  });
  await managementRoutes(app, {
    verifier: authVerifier,
    repository,
    contentDraftRepository,
    publicationRepository,
  });

  app.addHook("onResponse", (request, reply, done) => {
    request.log.info({ method: request.method, url: request.url, statusCode: reply.statusCode }, "request");
    done();
  });

  app.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith("/management")) applyManagementCacheControl(reply);
    const { payload, status } = envelopeForStatus(404, request.url);
    return reply.code(status).send(payload);
  });

  app.setErrorHandler((error: unknown, request, reply) => {
    try {
      request.log.error(safeErrorLog(error), "request failed");
    } catch {
      // Logging must never change the client envelope.
    }
    const rawStatus =
      typeof error === "object" && error !== null && "statusCode" in error
        ? (error as { statusCode?: unknown }).statusCode
        : undefined;
    const statusCode =
      typeof rawStatus === "number" && rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500;
    if (request.url.startsWith("/management")) applyManagementCacheControl(reply);
    const { payload, status } = envelopeForStatus(statusCode, request.url);
    return reply.code(status).send(payload);
  });

  return app;
}
