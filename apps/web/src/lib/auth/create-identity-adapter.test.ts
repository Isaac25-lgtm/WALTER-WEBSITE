import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { createNeonIdentityAdapter, type NeonAuthClient } from "./create-identity-adapter";

describe("Neon identity adapter", () => {
  it("uses createAuthClient, persists the client, and reads tokens only from getJWTToken", async () => {
    const source = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "create-identity-adapter.ts"), "utf8");
    expect(source).toContain("createAuthClient");
    expect(source).toContain("getJWTToken");
    expect(source).not.toContain("createInternalNeonAuth");
    expect(source).not.toContain("as NeonAuthClient");
    expect(source).not.toContain("session.token");
    expect(source).not.toContain("session.accessToken");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("@neondatabase/auth/next");

    const getJWTToken = vi.fn(async () => "jwt-from-getJWTToken");
    const signInEmail = vi.fn(async () => ({ data: {}, error: null }));
    const signOut = vi.fn(async () => undefined);
    const createNeonAuth = vi.fn(async () =>
      ({
        signIn: { email: signInEmail },
        signOut,
        getJWTToken,
      }) as unknown as NeonAuthClient,
    );

    const adapter = createNeonIdentityAdapter("https://auth.example.test/neondb/auth", createNeonAuth);
    const first = await adapter.signIn({ email: "owner@example.com", password: "secret" });
    const restored = await adapter.restoreSession();
    await adapter.signOut();

    expect(first).toEqual({ ok: true, accessToken: "jwt-from-getJWTToken" });
    expect(restored).toEqual({ ok: true, accessToken: "jwt-from-getJWTToken" });
    expect(createNeonAuth).toHaveBeenCalledTimes(1);
    expect(getJWTToken).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("returns unavailable when getJWTToken is not a function", async () => {
    const adapter = createNeonIdentityAdapter("https://auth.example.test/neondb/auth", async () =>
      ({
        signIn: { email: async () => ({ data: {}, error: null }) },
        signOut: async () => undefined,
      }) as unknown as NeonAuthClient,
    );
    await expect(adapter.signIn({ email: "owner@example.com", password: "secret" })).resolves.toEqual({
      ok: false,
      code: "unavailable",
    });
  });

  it("propagates sign-out failures so the caller can report them honestly", async () => {
    const adapter = createNeonIdentityAdapter("https://auth.example.test/neondb/auth", async () =>
      ({
        signIn: { email: async () => ({ data: {}, error: null }) },
        signOut: async () => {
          throw new Error("provider failed");
        },
        getJWTToken: async () => "jwt-from-getJWTToken",
      }) as unknown as NeonAuthClient,
    );

    await expect(adapter.signOut()).rejects.toThrow("provider failed");
  });
});
