export const ADMINISTRATOR_ROLE = "administrator" as const;

export type AuthPrincipal = {
  subject: string;
  role: typeof ADMINISTRATOR_ROLE;
};

export type AuthVerifyResult =
  | { ok: true; principal: AuthPrincipal }
  | { ok: false; code: "unauthorized" | "forbidden" | "service_unavailable" };

export type AuthVerifier = {
  readonly configured: boolean;
  verifyAccessToken(_token: string): Promise<AuthVerifyResult>;
};
