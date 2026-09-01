import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getPublicApiBaseUrl,
  getPublicNeonAuthBaseUrl,
  inquiryEndpointUrl,
  managementInquiryStatusEndpointUrl,
  managementSessionEndpointUrl,
} from "./public-api";
import { parseNeonAuthBaseUrl, parsePublicApiOrigin } from "./public-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("public API configuration", () => {
  it("reads NEXT_PUBLIC values as static process.env members", () => {
    const source = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "public-api.ts"), "utf8");
    expect(source).toContain("process.env.NEXT_PUBLIC_API_BASE_URL");
    expect(source).toContain("process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL");
    expect(source).not.toMatch(/const env = process\.env/);
    expect(source).not.toMatch(/=\s*process\.env\b/);
  });

  it("accepts a browser-safe http(s) origin and strips a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001/");
    expect(getPublicApiBaseUrl()).toBe("http://127.0.0.1:3001");
    expect(inquiryEndpointUrl("http://127.0.0.1:3001")).toBe("http://127.0.0.1:3001/inquiries");
    expect(managementSessionEndpointUrl("http://127.0.0.1:3001")).toBe(
      "http://127.0.0.1:3001/management/session",
    );
    expect(managementInquiryStatusEndpointUrl("http://127.0.0.1:3001", "11111111-1111-4111-8111-111111111111")).toBe(
      "http://127.0.0.1:3001/management/inquiries/11111111-1111-4111-8111-111111111111/status",
    );
  });

  it("rejects missing, credentialed, pathed, queried, and non-http API origins", () => {
    expect(parsePublicApiOrigin("")).toBeNull();
    expect(parsePublicApiOrigin("postgres://user:secret@localhost/db")).toBeNull();
    expect(parsePublicApiOrigin("http://user:pass@127.0.0.1:3001")).toBeNull();
    expect(parsePublicApiOrigin("javascript:alert(1)")).toBeNull();
    expect(parsePublicApiOrigin("/inquiries")).toBeNull();
    expect(parsePublicApiOrigin("https://api.example.test/inquiries")).toBeNull();
    expect(parsePublicApiOrigin("https://api.example.test?x=1")).toBeNull();
    expect(parsePublicApiOrigin("https://api.example.test#frag")).toBeNull();
    expect(parsePublicApiOrigin("https://api.example.test")).toBe("https://api.example.test");
  });

  it("permits a documented Neon Auth path and rejects query or fragment", () => {
    expect(parseNeonAuthBaseUrl("https://ep.example.test/neondb/auth/")).toBe(
      "https://ep.example.test/neondb/auth",
    );
    expect(parseNeonAuthBaseUrl("https://ep.example.test/neondb/auth?x=1")).toBeNull();
    expect(parseNeonAuthBaseUrl("https://user:pass@ep.example.test/neondb/auth")).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_NEON_AUTH_BASE_URL", "");
    expect(getPublicNeonAuthBaseUrl()).toBeNull();
  });
});
