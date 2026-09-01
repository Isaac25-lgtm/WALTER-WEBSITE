import { describe, expect, it } from "vitest";
import { inquiryRateLimitKey, parseConnectingIp } from "../src/lib/client-address.js";
import type { FastifyRequest } from "fastify";

function fakeRequest(headers: Record<string, string | string[] | undefined>, ip: string): FastifyRequest {
  return {
    ip,
    headers,
    raw: { socket: { remoteAddress: ip } },
  } as FastifyRequest;
}

describe("parseConnectingIp", () => {
  it("accepts a single IPv4 or IPv6 and rejects chains or invalid values", () => {
    expect(parseConnectingIp("203.0.113.10")).toBe("203.0.113.10");
    expect(parseConnectingIp(" 2001:db8::1 ")).toBe("2001:db8::1");
    expect(parseConnectingIp("203.0.113.10, 203.0.113.11")).toBeNull();
    expect(parseConnectingIp("not-an-ip")).toBeNull();
    expect(parseConnectingIp("")).toBeNull();
    expect(parseConnectingIp(["203.0.113.10", "203.0.113.11"])).toBeNull();
  });
});

describe("inquiryRateLimitKey", () => {
  it("ignores forwarded headers when trust is false", () => {
    const request = fakeRequest(
      { "x-forwarded-for": "198.51.100.1", "cf-connecting-ip": "198.51.100.2" },
      "10.0.0.8",
    );
    expect(inquiryRateLimitKey(request, { trustRenderClientIp: false })).toBe("10.0.0.8");
  });

  it("uses only a valid CF-Connecting-IP when trust is true", () => {
    const valid = fakeRequest(
      { "x-forwarded-for": "198.51.100.1", "cf-connecting-ip": "203.0.113.10" },
      "10.0.0.8",
    );
    expect(inquiryRateLimitKey(valid, { trustRenderClientIp: true })).toBe("203.0.113.10");

    const spoofedChain = fakeRequest(
      { "x-forwarded-for": "198.51.100.1", "cf-connecting-ip": "203.0.113.10, 203.0.113.11" },
      "10.0.0.8",
    );
    expect(inquiryRateLimitKey(spoofedChain, { trustRenderClientIp: true })).toBe("10.0.0.8");

    const invalid = fakeRequest({ "cf-connecting-ip": "not-an-ip" }, "10.0.0.8");
    expect(inquiryRateLimitKey(invalid, { trustRenderClientIp: true })).toBe("10.0.0.8");
  });

  it("does not return unknown when a socket address exists", () => {
    const request = fakeRequest({}, "127.0.0.1");
    expect(inquiryRateLimitKey(request, { trustRenderClientIp: false })).toBe("127.0.0.1");
    expect(inquiryRateLimitKey(request, { trustRenderClientIp: true })).toBe("127.0.0.1");
  });
});
