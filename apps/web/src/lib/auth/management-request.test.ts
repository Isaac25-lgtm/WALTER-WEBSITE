import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchManagementSession } from "./management-session";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("management request classification", () => {
  it("treats invalid JSON and invalid schema as malformed_response, not network_error", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");
    const invalidJson = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => {
        throw new Error("not json");
      },
    });
    await expect(fetchManagementSession("token", invalidJson)).resolves.toEqual({
      ok: false,
      code: "malformed_response",
    });

    const invalidSchema = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ authenticated: true }),
    });
    await expect(fetchManagementSession("token", invalidSchema)).resolves.toEqual({
      ok: false,
      code: "malformed_response",
    });
  });

  it("classifies management_auth_unavailable as authentication_unavailable", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");
    const fetchImpl = vi.fn().mockResolvedValue({
      status: 503,
      json: async () => ({
        error: { code: "management_auth_unavailable", message: "Authentication is unavailable" },
      }),
    });
    await expect(fetchManagementSession("token", fetchImpl)).resolves.toEqual({
      ok: false,
      code: "authentication_unavailable",
    });
  });

  it("classifies a valid 415 envelope as unsupported_media_type, not unexpected", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");
    const fetchImpl = vi.fn().mockResolvedValue({
      status: 415,
      json: async () => ({
        error: { code: "unsupported_media_type", message: "Unsupported media type" },
      }),
    });
    await expect(fetchManagementSession("token", fetchImpl)).resolves.toEqual({
      ok: false,
      code: "unsupported_media_type",
    });
  });

  it("classifies network failure separately from a valid 415 envelope", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");
    const fetchImpl = vi.fn().mockRejectedValue(new Error("offline"));
    await expect(fetchManagementSession("token", fetchImpl)).resolves.toEqual({
      ok: false,
      code: "network_error",
    });
  });
});
