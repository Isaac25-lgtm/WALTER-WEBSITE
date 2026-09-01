import { MAX_BEARER_TOKEN_LENGTH } from "@ats/config";

export { MAX_BEARER_TOKEN_LENGTH };

export function readBearerToken(authorization: unknown): string | null {
  if (authorization === undefined || authorization === null) return null;
  if (Array.isArray(authorization)) return null;
  if (typeof authorization !== "string") return null;
  if (authorization.includes(",")) return null;
  if (!authorization.startsWith("Bearer ")) return null;

  const token = authorization.slice("Bearer ".length);
  if (!token) return null;
  if (token.length > MAX_BEARER_TOKEN_LENGTH) return null;
  if (/\s/.test(token)) return null;
  for (let index = 0; index < token.length; index += 1) {
    const code = token.charCodeAt(index);
    if (code <= 31 || code === 127) return null;
  }
  return token;
}
