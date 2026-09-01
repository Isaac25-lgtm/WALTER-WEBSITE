import { createRemoteJWKSet, jwtVerify, type JWTVerifyOptions } from "jose";
import type { SupportedAsymmetricJwtAlgorithm } from "@ats/config";
import type { ApiConfig } from "../config/env.js";
import { ADMINISTRATOR_ROLE, type AuthPrincipal, type AuthVerifier, type AuthVerifyResult } from "./types.js";

type VerifyKey = Parameters<typeof jwtVerify>[1];

export type JoseAuthVerifierOptions = {
  issuer: string;
  audience: string;
  algorithms: readonly SupportedAsymmetricJwtAlgorithm[];
  adminSubjectIds: readonly string[];
};

export class JoseAuthVerifier implements AuthVerifier {
  readonly configured = true;
  private readonly key: VerifyKey;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly algorithms: SupportedAsymmetricJwtAlgorithm[];
  private readonly adminSubjectIds: Set<string>;

  constructor(key: VerifyKey, options: JoseAuthVerifierOptions) {
    this.key = key;
    this.issuer = options.issuer;
    this.audience = options.audience;
    this.algorithms = [...options.algorithms];
    this.adminSubjectIds = new Set(options.adminSubjectIds);
  }

  async verifyAccessToken(token: string): Promise<AuthVerifyResult> {
    if (!token) return { ok: false, code: "unauthorized" };
    try {
      const verifyOptions: JWTVerifyOptions = {
        algorithms: this.algorithms,
        issuer: this.issuer,
        audience: this.audience,
        requiredClaims: ["sub", "exp"],
      };
      const { payload } = await jwtVerify(token, this.key, verifyOptions);
      const subject = typeof payload.sub === "string" ? payload.sub.trim() : "";
      if (!subject) return { ok: false, code: "unauthorized" };
      if (!this.adminSubjectIds.has(subject)) return { ok: false, code: "forbidden" };
      const principal: AuthPrincipal = { subject, role: ADMINISTRATOR_ROLE };
      return { ok: true, principal };
    } catch {
      return { ok: false, code: "unauthorized" };
    }
  }
}

export function createJoseAuthVerifier(config: ApiConfig): AuthVerifier {
  if (
    !config.managementAuthEnabled ||
    !config.neonAuthJwksUrl ||
    !config.neonAuthIssuer ||
    !config.neonAuthAudience ||
    config.neonAuthJwtAlgorithms.length === 0 ||
    config.walterAdminUserIds.length === 0
  ) {
    throw new Error("Invalid server environment");
  }

  return new JoseAuthVerifier(createRemoteJWKSet(new URL(config.neonAuthJwksUrl)), {
    issuer: config.neonAuthIssuer,
    audience: config.neonAuthAudience,
    algorithms: config.neonAuthJwtAlgorithms,
    adminSubjectIds: config.walterAdminUserIds,
  });
}
