import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchManagementSession } from "./management-session";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("fetchManagementSession", () => {
  it("does not fetch when the public API origin is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchImpl = vi.fn();
    await expect(fetchManagementSession("token", fetchImpl)).resolves.toEqual({
      ok: false,
      code: "not_configured",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("sends a bearer token with credentials omitted", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");
    const fetchImpl = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ authenticated: true, role: "administrator" }),
    });
    await expect(fetchManagementSession("test-access-token", fetchImpl)).resolves.toEqual({
      ok: true,
      data: { authenticated: true, role: "administrator" },
    });
    const [url, init] = fetchImpl.mock.calls[0] as [
      string,
      { credentials?: string; cache?: string; headers?: Record<string, string> },
    ];
    expect(url).toBe("http://127.0.0.1:3001/management/session");
    expect(init.credentials).toBe("omit");
    expect(init.cache).toBe("no-store");
    expect(init.headers?.Authorization).toBe("Bearer test-access-token");
  });

  it("distinguishes a timed-out management session request from a network error", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");
    const fetchImpl = vi.fn((_url: string, init?: { signal?: AbortSignal }) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
        });
      });
    });
    await expect(fetchManagementSession("token", fetchImpl as typeof fetch, 20)).resolves.toEqual({
      ok: false,
      code: "timeout",
    });
  });
});
