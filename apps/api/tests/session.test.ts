import "./setup-env.js";
import { afterEach, describe, expect, it } from "vitest";
import {
  API_ERROR_CODES,
  forbiddenErrorSchema,
  inquiryNotFoundErrorSchema,
  managementAuthUnavailableErrorSchema,
  managementSessionResponseSchema,
  unauthorizedErrorSchema,
} from "@ats/contracts";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config/env.js";
import {
  createTestAuthVerifier,
  expectManagementHeaders,
  signTestToken,
  TEST_ADMIN_SUBJECT,
} from "./auth-test-helpers.js";

const baseConfig = loadConfig();

function testConfig(overrides: Partial<typeof baseConfig> = {}) {
  return { ...baseConfig, ...overrides };
}

const apps: Array<{ close: () => Promise<void> }> = [];

afterEach(async () => {
  while (apps.length > 0) {
    const app = apps.pop();
    if (app) await app.close();
  }
});

describe("GET /management/session", () => {
  it("returns 503 when management authentication is disabled", async () => {
    const app = await buildApp({ config: testConfig({ managementAuthEnabled: false }), logger: false });
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/management/session" });
    expect(response.statusCode).toBe(503);
    expectManagementHeaders(response);
    expect(managementAuthUnavailableErrorSchema.parse(response.json()).error.code).toBe(
      API_ERROR_CODES.management_auth_unavailable,
    );
  });

  it("returns 404 for the retired /session probe", async () => {
    const app = await buildApp({ config: testConfig(), logger: false });
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/session" });
    expect(response.statusCode).toBe(404);
    expect(inquiryNotFoundErrorSchema.parse(response.json()).error.code).toBe(API_ERROR_CODES.not_found);
  });

  it("authorises an allowlisted subject and ignores role claims", async () => {
    const { verifier, privateKey } = await createTestAuthVerifier();
    const app = await buildApp({
      config: testConfig(),
      logger: false,
      authVerifier: verifier,
    });
    apps.push(app);

    const missing = await app.inject({ method: "GET", url: "/management/session" });
    expect(missing.statusCode).toBe(401);
    expectManagementHeaders(missing);
    expect(unauthorizedErrorSchema.parse(missing.json()).error.code).toBe(API_ERROR_CODES.unauthorized);

    const invalid = await app.inject({
      method: "GET",
      url: "/management/session",
      headers: { authorization: "Bearer not-a-jwt" },
    });
    expect(invalid.statusCode).toBe(401);

    const roleOnly = await signTestToken(privateKey, {
      subject: "not-allowlisted",
      claims: { role: "administrator", roles: ["administrator"] },
    });
    const forbidden = await app.inject({
      method: "GET",
      url: "/management/session",
      headers: { authorization: `Bearer ${roleOnly}` },
    });
    expect(forbidden.statusCode).toBe(403);
    expectManagementHeaders(forbidden);
    expect(forbiddenErrorSchema.parse(forbidden.json()).error.code).toBe(API_ERROR_CODES.forbidden);
    expect(JSON.stringify(forbidden.json())).not.toContain(roleOnly);

    const allowlisted = await signTestToken(privateKey, { subject: TEST_ADMIN_SUBJECT });
    const ok = await app.inject({
      method: "GET",
      url: "/management/session",
      headers: { authorization: `Bearer ${allowlisted}` },
    });
    expect(ok.statusCode).toBe(200);
    expectManagementHeaders(ok);
    expect(managementSessionResponseSchema.parse(ok.json())).toEqual({
      authenticated: true,
      role: "administrator",
    });
    expect(JSON.stringify(ok.json())).not.toContain(allowlisted);
    expect(JSON.stringify(ok.json())).not.toContain(TEST_ADMIN_SUBJECT);
  }, 15_000);
});
