import type { AuthVerifier, AuthVerifyResult } from "./types.js";

export const unavailableAuthVerifier: AuthVerifier = {
  configured: false,
  async verifyAccessToken(): Promise<AuthVerifyResult> {
    return { ok: false, code: "service_unavailable" };
  },
};
