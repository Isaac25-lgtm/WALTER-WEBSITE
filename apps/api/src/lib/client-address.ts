import { isIP } from "node:net";
import type { FastifyRequest } from "fastify";

function headerString(value: unknown): string | null {
  if (Array.isArray(value)) {
    if (value.length !== 1 || typeof value[0] !== "string") return null;
    return value[0];
  }
  return typeof value === "string" ? value : null;
}

function socketAddress(request: FastifyRequest): string | null {
  const ip = typeof request.ip === "string" ? request.ip.trim() : "";
  if (ip) return ip;
  const remote = request.raw?.socket?.remoteAddress?.trim();
  return remote && remote.length > 0 ? remote : null;
}

/**
 * Single-value Cloudflare client IP. Rejects comma-separated chains.
 */
export function parseConnectingIp(value: unknown): string | null {
  const raw = headerString(value);
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.includes(",")) return null;
  return isIP(trimmed) === 0 ? null : trimmed;
}

export type InquiryRateLimitKeyOptions = {
  trustRenderClientIp: boolean;
};

/**
 * Rate-limit identity. Does not read environment variables.
 * When trust is false, forwarded headers are ignored.
 * When trust is true, only a valid single `CF-Connecting-IP` is used.
 */
export function inquiryRateLimitKey(
  request: FastifyRequest,
  options: InquiryRateLimitKeyOptions,
): string {
  if (options.trustRenderClientIp) {
    const connecting = parseConnectingIp(request.headers["cf-connecting-ip"]);
    if (connecting) return connecting;
  }
  return socketAddress(request) ?? "unknown";
}

export function createInquiryRateLimitKey(trustRenderClientIp: boolean) {
  return (request: FastifyRequest) => inquiryRateLimitKey(request, { trustRenderClientIp });
}
