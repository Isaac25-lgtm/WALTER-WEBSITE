import "./setup-env.js";
import { describe, expect, it } from "vitest";
import { SERVER_ENV_KEYS } from "@ats/config";
import { loadConfig } from "../src/config/env.js";

describe("TRUST_RENDER_CLIENT_IP", () => {
  it("defaults to false and accepts only literal true or false", () => {
    expect(SERVER_ENV_KEYS).toContain("TRUST_RENDER_CLIENT_IP");
    const missing = loadConfig({
      NODE_ENV: "test",
      HOST: "127.0.0.1",
      PORT: "3001",
      CORS_ORIGINS: "http://localhost:3000",
    });
    expect(missing.trustRenderClientIp).toBe(false);

    const disabled = loadConfig({
      NODE_ENV: "test",
      HOST: "127.0.0.1",
      PORT: "3001",
      CORS_ORIGINS: "http://localhost:3000",
      TRUST_RENDER_CLIENT_IP: "false",
    });
    expect(disabled.trustRenderClientIp).toBe(false);

    const enabled = loadConfig({
      NODE_ENV: "test",
      HOST: "127.0.0.1",
      PORT: "3001",
      CORS_ORIGINS: "http://localhost:3000",
      TRUST_RENDER_CLIENT_IP: "true",
    });
    expect(enabled.trustRenderClientIp).toBe(true);

    expect(() =>
      loadConfig({
        NODE_ENV: "test",
        HOST: "127.0.0.1",
        PORT: "3001",
        CORS_ORIGINS: "http://localhost:3000",
        TRUST_RENDER_CLIENT_IP: "TRUE",
      }),
    ).toThrow(/Invalid server environment/);
  });
});

const enabledAuth = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "3001",
  CORS_ORIGINS: "http://localhost:3000",
  MANAGEMENT_AUTH_ENABLED: "true",
  NEON_AUTH_JWKS_URL: "https://auth.example.test/.well-known/jwks.json",
  NEON_AUTH_ISSUER: "https://auth.example.test",
  NEON_AUTH_AUDIENCE: "ats-management",
  NEON_AUTH_JWT_ALGORITHMS: "ES256, RS256, ES256",
  WALTER_ADMIN_USER_IDS: "sub-1, sub-2, sub-1",
};

describe("management authentication environment", () => {
  it("defaults to disabled and starts without complete Auth configuration", () => {
    expect(SERVER_ENV_KEYS).toContain("MANAGEMENT_AUTH_ENABLED");
    expect(SERVER_ENV_KEYS).toContain("WALTER_ADMIN_USER_IDS");
    expect(SERVER_ENV_KEYS).not.toContain("AUTH_JWT_PUBLIC_JWK");
    const config = loadConfig({
      NODE_ENV: "test",
      HOST: "127.0.0.1",
      PORT: "3001",
      CORS_ORIGINS: "http://localhost:3000",
    });
    expect(config.managementAuthEnabled).toBe(false);
    expect(config.walterAdminUserIds).toEqual([]);
    expect(config.neonAuthJwtAlgorithms).toEqual([]);
  });

  it("requires a complete asymmetric configuration and subject allowlist when enabled", () => {
    const config = loadConfig(enabledAuth);
    expect(config.managementAuthEnabled).toBe(true);
    expect(config.neonAuthJwtAlgorithms).toEqual(["ES256", "RS256"]);
    expect(config.walterAdminUserIds).toEqual(["sub-1", "sub-2"]);

    expect(() => loadConfig({ ...enabledAuth, NEON_AUTH_JWT_ALGORITHMS: "HS256" })).toThrow(
      /Invalid server environment/,
    );
    expect(() => loadConfig({ ...enabledAuth, NEON_AUTH_JWT_ALGORITHMS: "none" })).toThrow(
      /Invalid server environment/,
    );
    expect(() => loadConfig({ ...enabledAuth, NEON_AUTH_JWT_ALGORITHMS: undefined })).toThrow(
      /Invalid server environment/,
    );
    expect(() => loadConfig({ ...enabledAuth, WALTER_ADMIN_USER_IDS: "owner@example.com" })).toThrow(
      /Invalid server environment/,
    );
    expect(() => loadConfig({ ...enabledAuth, NEON_AUTH_AUDIENCE: "" })).toThrow(/Invalid server environment/);
    expect(() =>
      loadConfig({
        ...enabledAuth,
        NODE_ENV: "production",
        CORS_ORIGINS: "https://example.test",
        NEON_AUTH_JWKS_URL: "http://auth.example.test/jwks.json",
      }),
    ).toThrow(/Invalid server environment/);
  });
});
