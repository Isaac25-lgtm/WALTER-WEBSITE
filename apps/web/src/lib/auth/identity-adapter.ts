export type IdentitySignInResult =
  | { ok: true; accessToken: string }
  | { ok: false; code: "unavailable" | "invalid_credentials" | "network_error" | "timeout" };

export type IdentityRestoreResult =
  | { ok: true; accessToken: string }
  | { ok: false; code: "none" | "unavailable" | "network_error" };

export type IdentityAdapter = {
  signIn(_input: { email: string; password: string }): Promise<IdentitySignInResult>;
  restoreSession(): Promise<IdentityRestoreResult>;
  signOut(): Promise<void>;
};

export const unavailableIdentityAdapter: IdentityAdapter = {
  async signIn() {
    return { ok: false, code: "unavailable" };
  },
  async restoreSession() {
    return { ok: false, code: "none" };
  },
  async signOut() {},
};
