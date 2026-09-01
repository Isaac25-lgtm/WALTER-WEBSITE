import { expect } from "vitest";
import { generateKeyPair, SignJWT } from "jose";
import { JoseAuthVerifier } from "../src/auth/jose-auth-verifier.js";

export const TEST_JWT_ISSUER = "https://auth.example.test";
export const TEST_JWT_AUDIENCE = "ats-management";
export const TEST_ADMIN_SUBJECT = "admin-subject-1";

export async function createTestAuthVerifier(adminSubjectIds: string[] = [TEST_ADMIN_SUBJECT]) {
  const { publicKey, privateKey } = await generateKeyPair("ES256");
  const verifier = new JoseAuthVerifier(publicKey, {
    issuer: TEST_JWT_ISSUER,
    audience: TEST_JWT_AUDIENCE,
    algorithms: ["ES256"],
    adminSubjectIds,
  });
  return { verifier, privateKey };
}

export async function signTestToken(
  privateKey: CryptoKey,
  options: {
    subject?: string;
    claims?: Record<string, unknown>;
    issuer?: string;
    audience?: string;
    expires?: string;
    notBefore?: string;
  } = {},
) {
  let token = new SignJWT(options.claims ?? {})
    .setProtectedHeader({ alg: "ES256" })
    .setSubject(options.subject ?? TEST_ADMIN_SUBJECT)
    .setIssuer(options.issuer ?? TEST_JWT_ISSUER)
    .setAudience(options.audience ?? TEST_JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(options.expires ?? "5m");
  if (options.notBefore) token = token.setNotBefore(options.notBefore);
  return token.sign(privateKey);
}

export function expectManagementHeaders(response: { headers: Record<string, unknown> }): void {
  expect(response.headers["cache-control"]).toBe("private, no-store");
  expect(response.headers["pragma"]).toBe("no-cache");
  expect(String(response.headers["vary"]).split(/\s*,\s*/)).toContain("Authorization");
}
