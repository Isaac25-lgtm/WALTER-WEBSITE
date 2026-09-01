import "./setup-env.js";
import { Writable } from "node:stream";
import { afterEach, describe, expect, it } from "vitest";
import {
  API_ERROR_CODES,
  healthResponseSchema,
  inquiryAttachmentNotAvailableErrorSchema,
  inquiryBadRequestErrorSchema,
  inquiryCreatedResponseSchema,
  inquiryInternalErrorSchema,
  inquiryNotFoundErrorSchema,
  inquiryRateLimitErrorSchema,
  inquiryServiceUnavailableErrorSchema,
  inquiryUnsupportedMediaTypeErrorSchema,
} from "@ats/contracts";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config/env.js";
import { createLoggerOptions, LOGGER_REDACT_PATHS } from "../src/lib/logger.js";
import { MemoryInquiryRepository } from "../src/repositories/memory-inquiry-repository.js";

const baseConfig = loadConfig();

function testConfig(overrides: Partial<typeof baseConfig> = {}) {
  return {
    ...baseConfig,
    inquiryRateLimitMax: 100,
    inquiryRateLimitWindowMs: 60_000,
    ...overrides,
  };
}

const validInquiry = {
  firstName: "Ada",
  lastName: "Okello",
  email: "ada@example.com",
  phone: "+256 700 000 000",
  message: "Please quote a warehouse frame in Jinja.",
};

const apps: Array<{ close: () => Promise<void> }> = [];

afterEach(async () => {
  while (apps.length > 0) {
    const app = apps.pop();
    if (app) await app.close();
  }
});

async function makeApp(repository?: MemoryInquiryRepository, config = testConfig()) {
  const app = await buildApp({
    config,
    logger: false,
    inquiryRepository: repository,
  });
  apps.push(app);
  return app;
}

describe("POST /inquiries", () => {
  it("creates an inquiry with status new and a minimal public body", async () => {
    const repository = new MemoryInquiryRepository();
    const app = await makeApp(repository);
    const response = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: { ...validInquiry, firstName: "  Ada  " },
    });
    expect(response.statusCode).toBe(201);
    const body = inquiryCreatedResponseSchema.parse(response.json());
    expect(Object.keys(body).sort()).toEqual(["acknowledgement", "createdAt", "id"].sort());
    expect(body.acknowledgement).toBe("accepted");
    expect(repository.records).toHaveLength(1);
    expect(repository.records[0]?.status).toBe("new");
    expect(repository.records[0]?.firstName).toBe("Ada");
    expect(JSON.stringify(body)).not.toMatch(/Okello|warehouse|attachment|status|stack/i);
  });

  it("rejects invalid email, missing message, invalid phone, unknown fields, and oversized names", async () => {
    const repository = new MemoryInquiryRepository();
    const app = await makeApp(repository);

    const email = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: { ...validInquiry, email: "not-an-email" },
    });
    expect(email.statusCode).toBe(400);
    expect(inquiryBadRequestErrorSchema.parse(email.json()).error.code).toBe(API_ERROR_CODES.bad_request);

    const message = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: { firstName: "Ada", lastName: "Okello", email: "ada@example.com", phone: "+256700000000" },
    });
    expect(message.statusCode).toBe(400);

    const phone = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: { ...validInquiry, phone: "abc" },
    });
    expect(phone.statusCode).toBe(400);

    const unknown = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: { ...validInquiry, budget: "1000" },
    });
    expect(unknown.statusCode).toBe(400);

    const oversized = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: { ...validInquiry, firstName: "A".repeat(81) },
    });
    expect(oversized.statusCode).toBe(400);
    expect(repository.records).toHaveLength(0);
  });

  it("accepts exact JSON content types and rejects lookalikes", async () => {
    const repository = new MemoryInquiryRepository();
    const app = await makeApp(repository);
    const body = JSON.stringify(validInquiry);

    const accepted = await app.inject({
      method: "POST",
      url: "/inquiries",
      headers: { "content-type": "application/json; charset=utf-8" },
      payload: body,
    });
    expect(accepted.statusCode).toBe(201);
    inquiryCreatedResponseSchema.parse(accepted.json());

    const cases = [
      { headers: { "content-type": "text/plain" }, payload: body },
      { headers: { "content-type": "application/xml" }, payload: body },
      { headers: { "content-type": "text/application/json" }, payload: body },
      { headers: { "content-type": "application/json-malformed" }, payload: body },
      { headers: { "content-type": "notapplication/json" }, payload: body },
      { headers: { "content-type": "multipart/form-data" }, payload: body },
      { headers: {}, payload: body },
    ];
    for (const item of cases) {
      const response = await app.inject({
        method: "POST",
        url: "/inquiries",
        ...item,
      });
      expect(response.statusCode, String(item.headers["content-type"] ?? "missing")).toBe(415);
      expect(inquiryUnsupportedMediaTypeErrorSchema.parse(response.json()).error.code).toBe(
        API_ERROR_CODES.unsupported_media_type,
      );
    }
    expect(repository.records).toHaveLength(1);
  });

  it("returns 422 for attachment metadata and does not write", async () => {
    const repository = new MemoryInquiryRepository();
    const app = await makeApp(repository);
    const response = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: {
        ...validInquiry,
        attachment: { originalName: "drawing.pdf", mimeType: "application/pdf", byteSize: 12 },
      },
    });
    expect(response.statusCode).toBe(422);
    expect(inquiryAttachmentNotAvailableErrorSchema.parse(response.json()).error.code).toBe(
      API_ERROR_CODES.attachment_not_available,
    );
    expect(repository.records).toHaveLength(0);
  });

  it("ignores an empty honeypot and skips persistence for a filled honeypot", async () => {
    const repository = new MemoryInquiryRepository();
    const app = await makeApp(repository);

    const empty = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: { ...validInquiry, website: "  " },
    });
    expect(empty.statusCode).toBe(201);
    expect(repository.records).toHaveLength(1);

    const filled = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: { ...validInquiry, website: "https://spam.example" },
    });
    expect(filled.statusCode).toBe(201);
    expect(inquiryCreatedResponseSchema.parse(filled.json()).acknowledgement).toBe("accepted");
    expect(repository.records).toHaveLength(1);
  });

  it("returns 503 when persistence is unavailable and 500 without a stack trace", async () => {
    const unavailable = new MemoryInquiryRepository();
    unavailable.failNext = "unavailable";
    const app503 = await makeApp(unavailable);
    const response503 = await app503.inject({ method: "POST", url: "/inquiries", payload: validInquiry });
    expect(response503.statusCode).toBe(503);
    expect(inquiryServiceUnavailableErrorSchema.parse(response503.json()).error.code).toBe(
      API_ERROR_CODES.service_unavailable,
    );
    expect(JSON.stringify(response503.json())).not.toMatch(/stack|at |DATABASE/i);

    const exploding = new MemoryInquiryRepository();
    exploding.failNext = "unexpected";
    const app500 = await makeApp(exploding);
    const response500 = await app500.inject({ method: "POST", url: "/inquiries", payload: validInquiry });
    expect(response500.statusCode).toBe(500);
    const text = JSON.stringify(response500.json());
    expect(inquiryInternalErrorSchema.parse(response500.json()).error.code).toBe(API_ERROR_CODES.internal_error);
    expect(text).not.toMatch(/stack|repository failure|Ada|warehouse/i);
  });

  it("rate-limits inquiry creation and leaves /health available", async () => {
    const repository = new MemoryInquiryRepository();
    const app = await makeApp(
      repository,
      testConfig({ inquiryRateLimitMax: 5, inquiryRateLimitWindowMs: 60_000 }),
    );
    const statuses: number[] = [];
    for (let index = 0; index < 6; index += 1) {
      const response = await app.inject({ method: "POST", url: "/inquiries", payload: validInquiry });
      statuses.push(response.statusCode);
    }
    expect(statuses.slice(0, 5).every((status) => status === 201)).toBe(true);
    expect(statuses[5]).toBe(429);
    expect(inquiryRateLimitErrorSchema.parse((await app.inject({ method: "POST", url: "/inquiries", payload: validInquiry })).json()).error.code).toBe(
      API_ERROR_CODES.rate_limited,
    );
    const health = await app.inject({ method: "GET", url: "/health" });
    expect(health.statusCode).toBe(200);
    expect(healthResponseSchema.parse(health.json())).toEqual({ status: "ok" });
  });

  it("ignores spoofed X-Forwarded-For and CF-Connecting-IP when trust is false", async () => {
    const repository = new MemoryInquiryRepository();
    const app = await makeApp(
      repository,
      testConfig({ inquiryRateLimitMax: 2, inquiryRateLimitWindowMs: 60_000, trustRenderClientIp: false }),
    );

    async function post(headers: Record<string, string>, remoteAddress: string) {
      return app.inject({
        method: "POST",
        url: "/inquiries",
        headers,
        remoteAddress,
        payload: validInquiry,
      });
    }

    expect(
      (await post({ "x-forwarded-for": "198.51.100.1", "cf-connecting-ip": "198.51.100.2" }, "10.0.0.8"))
        .statusCode,
    ).toBe(201);
    expect((await post({ "x-forwarded-for": "203.0.113.10" }, "10.0.0.8")).statusCode).toBe(201);
    const limited = await post(
      { "x-forwarded-for": "203.0.113.20", "cf-connecting-ip": "203.0.113.30" },
      "10.0.0.8",
    );
    expect(limited.statusCode).toBe(429);
    expect(inquiryRateLimitErrorSchema.parse(limited.json()).error.code).toBe(API_ERROR_CODES.rate_limited);

    const otherSocket = await post({ "x-forwarded-for": "10.0.0.8" }, "10.0.0.9");
    expect(otherSocket.statusCode).toBe(201);
    inquiryCreatedResponseSchema.parse(otherSocket.json());
  });

  it("uses a valid CF-Connecting-IP only when trust is true and falls back safely otherwise", async () => {
    const repository = new MemoryInquiryRepository();
    const app = await makeApp(
      repository,
      testConfig({ inquiryRateLimitMax: 2, inquiryRateLimitWindowMs: 60_000, trustRenderClientIp: true }),
    );

    async function post(headers: Record<string, string>, remoteAddress: string) {
      return app.inject({
        method: "POST",
        url: "/inquiries",
        headers,
        remoteAddress,
        payload: validInquiry,
      });
    }

    expect(
      (await post({ "cf-connecting-ip": "203.0.113.10", "x-forwarded-for": "198.51.100.1" }, "10.0.0.8"))
        .statusCode,
    ).toBe(201);
    expect(
      (await post({ "cf-connecting-ip": "203.0.113.10", "x-forwarded-for": "198.51.100.9" }, "10.0.0.8"))
        .statusCode,
    ).toBe(201);
    const limited = await post({ "cf-connecting-ip": "203.0.113.10" }, "10.0.0.8");
    expect(limited.statusCode).toBe(429);

    const otherCf = await post({ "cf-connecting-ip": "203.0.113.20" }, "10.0.0.8");
    expect(otherCf.statusCode).toBe(201);

    expect((await post({ "cf-connecting-ip": "not-an-ip" }, "10.0.0.8")).statusCode).toBe(201);
    expect((await post({ "cf-connecting-ip": "203.0.113.10, 203.0.113.11" }, "10.0.0.8")).statusCode).toBe(201);
    expect((await post({ "cf-connecting-ip": "garbage" }, "10.0.0.8")).statusCode).toBe(429);

    const health = await app.inject({ method: "GET", url: "/health" });
    expect(health.statusCode).toBe(200);
  });

  it("does not write client addresses into logs", async () => {
    const chunks: string[] = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(String(chunk));
        callback();
      },
    });
    const repository = new MemoryInquiryRepository();
    const app = await buildApp({
      config: testConfig({ trustRenderClientIp: true, inquiryRateLimitMax: 5 }),
      inquiryRepository: repository,
      logger: { ...createLoggerOptions(), stream },
    });
    apps.push(app);
    await app.inject({
      method: "POST",
      url: "/inquiries",
      headers: { "cf-connecting-ip": "203.0.113.77", "x-forwarded-for": "198.51.100.77" },
      remoteAddress: "10.0.0.77",
      payload: validInquiry,
    });
    const combined = chunks.join("\n");
    expect(combined).not.toContain("203.0.113.77");
    expect(combined).not.toContain("198.51.100.77");
    expect(combined).not.toContain("10.0.0.77");
  });

  it("does not expose public inquiry read, list, update, or delete routes", async () => {
    const app = await makeApp(new MemoryInquiryRepository());
    for (const item of [
      { method: "GET" as const, url: "/inquiries" },
      { method: "GET" as const, url: "/inquiries/00000000-0000-0000-0000-000000000000" },
      { method: "PATCH" as const, url: "/inquiries/00000000-0000-0000-0000-000000000000" },
      { method: "DELETE" as const, url: "/inquiries/00000000-0000-0000-0000-000000000000" },
    ]) {
      const response = await app.inject(item);
      expect(response.statusCode).toBe(404);
      expect(inquiryNotFoundErrorSchema.parse(response.json()).error.code).toBe(API_ERROR_CODES.not_found);
    }
  });

  it("does not log inquiry message content", async () => {
    const chunks: string[] = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(String(chunk));
        callback();
      },
    });
    const repository = new MemoryInquiryRepository();
    const app = await buildApp({
      config: testConfig(),
      inquiryRepository: repository,
      logger: { level: "info", stream },
    });
    apps.push(app);
    const probe = "UNIQUE_INQUIRY_MESSAGE_PROBE_PROMPT9";
    await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: { ...validInquiry, message: probe, email: "probe@example.com" },
    });
    const combined = chunks.join("\n");
    expect(combined).not.toContain(probe);
    expect(combined).not.toContain("probe@example.com");
    expect(combined).not.toContain("Ada");
    expect(LOGGER_REDACT_PATHS).toEqual(expect.arrayContaining(["req.body", "req.headers.authorization", "DATABASE_URL"]));
  });
});
