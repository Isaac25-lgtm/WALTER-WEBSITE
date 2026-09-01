import type { FastifyReply, FastifyRequest } from "fastify";
import {
  API_ERROR_CODES,
  forbiddenErrorSchema,
  managementAuthUnavailableErrorSchema,
  unauthorizedErrorSchema,
} from "@ats/contracts";
import { mergeVaryHeader } from "../lib/merge-vary.js";
import { readBearerToken } from "./bearer.js";
import type { AuthPrincipal, AuthVerifier } from "./types.js";

export const MANAGEMENT_CACHE_CONTROL = "private, no-store";

export function applyManagementCacheControl(reply: FastifyReply): void {
  reply.header("Cache-Control", MANAGEMENT_CACHE_CONTROL);
  reply.header("Pragma", "no-cache");
  const existing = reply.getHeader("Vary") ?? reply.getHeader("vary");
  reply.header("Vary", mergeVaryHeader(existing, "Authorization"));
}

export function sendUnauthorized(reply: FastifyReply) {
  applyManagementCacheControl(reply);
  return reply.code(401).send(
    unauthorizedErrorSchema.parse({
      error: { code: API_ERROR_CODES.unauthorized, message: "Authentication required" },
    }),
  );
}

export function sendForbidden(reply: FastifyReply) {
  applyManagementCacheControl(reply);
  return reply.code(403).send(
    forbiddenErrorSchema.parse({
      error: { code: API_ERROR_CODES.forbidden, message: "Administrator authorisation required" },
    }),
  );
}

export function sendAuthUnavailable(reply: FastifyReply) {
  applyManagementCacheControl(reply);
  return reply.code(503).send(
    managementAuthUnavailableErrorSchema.parse({
      error: { code: API_ERROR_CODES.management_auth_unavailable, message: "Authentication is unavailable" },
    }),
  );
}

export async function authorizeManagementRequest(
  request: FastifyRequest,
  reply: FastifyReply,
  verifier: AuthVerifier,
): Promise<AuthPrincipal | null> {
  applyManagementCacheControl(reply);
  if (!verifier.configured) {
    await sendAuthUnavailable(reply);
    return null;
  }
  const token = readBearerToken(request.headers.authorization);
  if (!token) {
    await sendUnauthorized(reply);
    return null;
  }
  const result = await verifier.verifyAccessToken(token);
  if (!result.ok) {
    if (result.code === "service_unavailable") {
      await sendAuthUnavailable(reply);
      return null;
    }
    if (result.code === "forbidden") {
      await sendForbidden(reply);
      return null;
    }
    await sendUnauthorized(reply);
    return null;
  }
  return result.principal;
}
