import "./setup-env.js";
import { afterAll, describe, expect, it } from "vitest";
import { inquiryBadRequestErrorSchema, inquiryNotFoundErrorSchema, inquiryServiceUnavailableErrorSchema, healthResponseSchema } from "@ats/contracts";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config/env.js";

const app = await buildApp({ logger: false });

afterAll(async () => {
  await app.close();
});

describe("API foundation", () => {
  it("GET /health returns the shared ok payload", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    const body = healthResponseSchema.parse(response.json());
    expect(body).toEqual({ status: "ok" });
    expect(JSON.stringify(body)).not.toMatch(/database|DATABASE|stack|secret/i);
  });

  it("unknown routes return the controlled JSON 404", async () => {
    const response = await app.inject({ method: "GET", url: "/does-not-exist" });
    expect(response.statusCode).toBe(404);
    const body = inquiryNotFoundErrorSchema.parse(response.json());
    expect(body.error.code).toBe("not_found");
    const text = JSON.stringify(body);
    expect(text).not.toMatch(/stack|node_modules|\\\\|C:\\\\|F:\\\\|W:\\\\/i);
  });

  it("does not expose stack traces on errors", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(JSON.stringify(response.json())).not.toContain("at ");
    expect(JSON.stringify(response.json())).not.toMatch(/Error:|stack/i);
  });

  it("inquiry endpoint is unavailable without a database", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: {
        firstName: "Ada",
        lastName: "Okello",
        email: "ada@example.com",
        phone: "+256700000000",
        message: "Please quote a warehouse frame.",
      },
    });
    expect(response.statusCode).toBe(503);
    const body = inquiryServiceUnavailableErrorSchema.parse(response.json());
    expect(body.error.code).toBe("service_unavailable");
    expect(JSON.stringify(body)).not.toMatch(/stack|DATABASE_URL|neon/i);
  });

  it("rejects invalid inquiry bodies without writing", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/inquiries",
      payload: { email: "not-an-email" },
    });
    expect(response.statusCode).toBe(400);
    const body = inquiryBadRequestErrorSchema.parse(response.json());
    expect(body.error.code).toBe("bad_request");
  });

  it("allows only configured CORS origins", async () => {
    const allowed = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "http://localhost:3000" },
    });
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:3000");

    const denied = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "https://evil.example" },
    });
    expect(denied.headers["access-control-allow-origin"]).not.toBe("https://evil.example");
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("rejects wildcard CORS in production", () => {
    expect(() =>
      loadConfig({
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: "3001",
        CORS_ORIGINS: "*",
      }),
    ).toThrow(/Invalid server environment/);
  });
});
