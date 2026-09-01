import { getPublicNeonAuthBaseUrl } from "../public-api";
import type { IdentityAdapter, IdentityRestoreResult, IdentitySignInResult } from "./identity-adapter";
import { unavailableIdentityAdapter } from "./identity-adapter";

export type { IdentityAdapter, IdentityRestoreResult, IdentitySignInResult };

async function defaultCreateNeonAuth(authBaseUrl: string) {
  const { createAuthClient } = await import("@neondatabase/auth");
  return createAuthClient(authBaseUrl);
}

export type NeonAuthClient = Awaited<ReturnType<typeof defaultCreateNeonAuth>>;

export type CreateNeonAuth = (_authBaseUrl: string) => Promise<NeonAuthClient>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readJwtToken(client: NeonAuthClient): Promise<string | null> {
  const reader = Reflect.get(client, "getJWTToken");
  if (typeof reader !== "function") return null;
  const token: unknown = await reader.call(client);
  if (typeof token === "string" && token.trim()) return token.trim();
  return null;
}

export function createNeonIdentityAdapter(
  authBaseUrl: string,
  createNeonAuth: CreateNeonAuth = defaultCreateNeonAuth,
): IdentityAdapter {
  let neonPromise: Promise<NeonAuthClient> | null = null;

  function neon(): Promise<NeonAuthClient> {
    if (!neonPromise) neonPromise = createNeonAuth(authBaseUrl);
    return neonPromise;
  }

  return {
    async signIn({ email, password }): Promise<IdentitySignInResult> {
      try {
        const client = await neon();
        const result: unknown = await client.signIn.email({ email, password });
        if (isRecord(result) && result.error) {
          return { ok: false, code: "invalid_credentials" };
        }
        const token = await readJwtToken(client);
        if (!token) return { ok: false, code: "unavailable" };
        return { ok: true, accessToken: token };
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return { ok: false, code: "timeout" };
        }
        return { ok: false, code: "network_error" };
      }
    },

    async restoreSession(): Promise<IdentityRestoreResult> {
      try {
        const client = await neon();
        const token = await readJwtToken(client);
        if (!token) return { ok: false, code: "none" };
        return { ok: true, accessToken: token };
      } catch {
        return { ok: false, code: "network_error" };
      }
    },

    async signOut(): Promise<void> {
      const client = await neon();
      await client.signOut();
    },
  };
}

let cachedAdapter: IdentityAdapter | null = null;

export function createIdentityAdapter(): IdentityAdapter {
  if (cachedAdapter) return cachedAdapter;
  const url = getPublicNeonAuthBaseUrl();
  cachedAdapter = url ? createNeonIdentityAdapter(url) : unavailableIdentityAdapter;
  return cachedAdapter;
}

export function resetIdentityAdapterCacheForTests(): void {
  cachedAdapter = null;
}
