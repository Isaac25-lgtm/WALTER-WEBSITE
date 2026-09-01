import {
  DEFAULT_API_HOST,
  DEFAULT_API_PORT,
  DEFAULT_BODY_LIMIT_BYTES,
  DEFAULT_INQUIRY_RATE_LIMIT_MAX,
  DEFAULT_INQUIRY_RATE_LIMIT_WINDOW_MS,
  SUPPORTED_ASYMMETRIC_JWT_ALGORITHMS,
  type SupportedAsymmetricJwtAlgorithm,
} from "@ats/config";
import { z } from "zod";

const emptyToUndefined = (value: string | undefined) => {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const optionalSecret = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const optionalPositiveInt = z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional());
const booleanLiteral = z.preprocess((value) => {
  if (value === undefined || value === "") return "false";
  return value;
}, z.enum(["true", "false"]));

const supportedAlgorithmSet = new Set<string>(SUPPORTED_ASYMMETRIC_JWT_ALGORITHMS);

function uniqueTrimmed(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

export function parseJwtAlgorithms(raw: string | undefined): SupportedAsymmetricJwtAlgorithm[] | null {
  if (raw === undefined) return null;
  const parts = uniqueTrimmed(raw.split(","));
  if (parts.length === 0) return null;
  const parsed: SupportedAsymmetricJwtAlgorithm[] = [];
  for (const part of parts) {
    if (part === "none" || part.toLowerCase() === "none") return null;
    if (/^HS[0-9]+$/i.test(part)) return null;
    if (!supportedAlgorithmSet.has(part)) return null;
    parsed.push(part as SupportedAsymmetricJwtAlgorithm);
  }
  return parsed;
}

export function parseAdministratorSubjectIds(raw: string | undefined): string[] | null {
  if (raw === undefined) return null;
  const parts = uniqueTrimmed(raw.split(","));
  if (parts.length === 0) return null;
  if (parts.some((part) => part.includes("@"))) return null;
  return parts;
}

function isHttpUrl(value: string, httpsOnly: boolean): boolean {
  try {
    const url = new URL(value);
    if (url.username || url.password) return false;
    if (httpsOnly) return url.protocol === "https:";
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    HOST: z.string().min(1).default(DEFAULT_API_HOST),
    PORT: z.coerce.number().int().positive(),
    CORS_ORIGINS: z.string().min(1),
    DATABASE_URL: optionalSecret,
    INQUIRY_RATE_LIMIT_MAX: optionalPositiveInt,
    INQUIRY_RATE_LIMIT_WINDOW: optionalPositiveInt,
    TRUST_RENDER_CLIENT_IP: booleanLiteral,
    MANAGEMENT_AUTH_ENABLED: booleanLiteral,
    NEON_AUTH_JWKS_URL: optionalSecret,
    NEON_AUTH_ISSUER: optionalSecret,
    NEON_AUTH_AUDIENCE: optionalSecret,
    NEON_AUTH_JWT_ALGORITHMS: optionalSecret,
    WALTER_ADMIN_USER_IDS: optionalSecret,
    R2_ACCOUNT_ID: optionalSecret,
    R2_ACCESS_KEY_ID: optionalSecret,
    R2_SECRET_ACCESS_KEY: optionalSecret,
    R2_BUCKET: optionalSecret,
    R2_PUBLIC_BASE_URL: optionalSecret,
    RESEND_API_KEY: optionalSecret,
    INQUIRY_NOTIFICATION_TO: optionalSecret,
    STATIC_SITE_DEPLOY_HOOK_URL: optionalSecret,
  })
  .superRefine((env, ctx) => {
    const origins = env.CORS_ORIGINS.split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (origins.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["CORS_ORIGINS"],
        message: "CORS_ORIGINS must list at least one origin",
      });
    }
    if (env.NODE_ENV === "production" && origins.includes("*")) {
      ctx.addIssue({
        code: "custom",
        path: ["CORS_ORIGINS"],
        message: "Wildcard CORS is not allowed in production",
      });
    }

    if (env.MANAGEMENT_AUTH_ENABLED !== "true") return;

    const httpsOnly = env.NODE_ENV === "production";
    if (!env.NEON_AUTH_JWKS_URL || !isHttpUrl(env.NEON_AUTH_JWKS_URL, httpsOnly)) {
      ctx.addIssue({ code: "custom", path: ["NEON_AUTH_JWKS_URL"], message: "invalid" });
    }
    if (!env.NEON_AUTH_ISSUER || !isHttpUrl(env.NEON_AUTH_ISSUER, httpsOnly)) {
      ctx.addIssue({ code: "custom", path: ["NEON_AUTH_ISSUER"], message: "invalid" });
    }
    if (!env.NEON_AUTH_AUDIENCE) {
      ctx.addIssue({ code: "custom", path: ["NEON_AUTH_AUDIENCE"], message: "invalid" });
    }
    if (parseJwtAlgorithms(env.NEON_AUTH_JWT_ALGORITHMS) === null) {
      ctx.addIssue({ code: "custom", path: ["NEON_AUTH_JWT_ALGORITHMS"], message: "invalid" });
    }
    if (parseAdministratorSubjectIds(env.WALTER_ADMIN_USER_IDS) === null) {
      ctx.addIssue({ code: "custom", path: ["WALTER_ADMIN_USER_IDS"], message: "invalid" });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export type ApiConfig = {
  nodeEnv: ServerEnv["NODE_ENV"];
  host: string;
  port: number;
  corsOrigins: string[];
  bodyLimitBytes: number;
  databaseConfigured: boolean;
  inquiryRateLimitMax: number;
  inquiryRateLimitWindowMs: number;
  trustRenderClientIp: boolean;
  managementAuthEnabled: boolean;
  neonAuthJwksUrl?: string;
  neonAuthIssuer?: string;
  neonAuthAudience?: string;
  neonAuthJwtAlgorithms: SupportedAsymmetricJwtAlgorithm[];
  walterAdminUserIds: string[];
};

export function readDatabaseUrl(env: Record<string, string | undefined> = process.env): string | undefined {
  return emptyToUndefined(env.DATABASE_URL);
}

export function loadConfig(env: Record<string, string | undefined> = process.env): ApiConfig {
  const parsed = serverEnvSchema.safeParse({
    NODE_ENV: env.NODE_ENV ?? "development",
    HOST: env.HOST ?? DEFAULT_API_HOST,
    PORT: env.PORT ?? String(DEFAULT_API_PORT),
    CORS_ORIGINS: env.CORS_ORIGINS,
    DATABASE_URL: env.DATABASE_URL,
    INQUIRY_RATE_LIMIT_MAX: env.INQUIRY_RATE_LIMIT_MAX,
    INQUIRY_RATE_LIMIT_WINDOW: env.INQUIRY_RATE_LIMIT_WINDOW,
    TRUST_RENDER_CLIENT_IP: env.TRUST_RENDER_CLIENT_IP,
    MANAGEMENT_AUTH_ENABLED: env.MANAGEMENT_AUTH_ENABLED,
    NEON_AUTH_JWKS_URL: env.NEON_AUTH_JWKS_URL,
    NEON_AUTH_ISSUER: env.NEON_AUTH_ISSUER,
    NEON_AUTH_AUDIENCE: env.NEON_AUTH_AUDIENCE,
    NEON_AUTH_JWT_ALGORITHMS: env.NEON_AUTH_JWT_ALGORITHMS,
    WALTER_ADMIN_USER_IDS: env.WALTER_ADMIN_USER_IDS,
    R2_ACCOUNT_ID: env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: env.R2_BUCKET,
    R2_PUBLIC_BASE_URL: env.R2_PUBLIC_BASE_URL,
    RESEND_API_KEY: env.RESEND_API_KEY,
    INQUIRY_NOTIFICATION_TO: env.INQUIRY_NOTIFICATION_TO,
    STATIC_SITE_DEPLOY_HOOK_URL: env.STATIC_SITE_DEPLOY_HOOK_URL,
  });

  if (!parsed.success) {
    throw new Error("Invalid server environment");
  }

  const corsOrigins = parsed.data.CORS_ORIGINS.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const managementAuthEnabled = parsed.data.MANAGEMENT_AUTH_ENABLED === "true";
  const algorithms = managementAuthEnabled ? parseJwtAlgorithms(parsed.data.NEON_AUTH_JWT_ALGORITHMS) : [];
  const adminIds = managementAuthEnabled ? parseAdministratorSubjectIds(parsed.data.WALTER_ADMIN_USER_IDS) : [];
  if (managementAuthEnabled && (!algorithms || !adminIds)) {
    throw new Error("Invalid server environment");
  }

  return {
    nodeEnv: parsed.data.NODE_ENV,
    host: parsed.data.HOST,
    port: parsed.data.PORT,
    corsOrigins,
    bodyLimitBytes: DEFAULT_BODY_LIMIT_BYTES,
    databaseConfigured: Boolean(parsed.data.DATABASE_URL),
    inquiryRateLimitMax: parsed.data.INQUIRY_RATE_LIMIT_MAX ?? DEFAULT_INQUIRY_RATE_LIMIT_MAX,
    inquiryRateLimitWindowMs: parsed.data.INQUIRY_RATE_LIMIT_WINDOW ?? DEFAULT_INQUIRY_RATE_LIMIT_WINDOW_MS,
    trustRenderClientIp: parsed.data.TRUST_RENDER_CLIENT_IP === "true",
    managementAuthEnabled,
    neonAuthJwksUrl: managementAuthEnabled ? parsed.data.NEON_AUTH_JWKS_URL : undefined,
    neonAuthIssuer: managementAuthEnabled ? parsed.data.NEON_AUTH_ISSUER : undefined,
    neonAuthAudience: managementAuthEnabled ? parsed.data.NEON_AUTH_AUDIENCE : undefined,
    neonAuthJwtAlgorithms: algorithms ?? [],
    walterAdminUserIds: adminIds ?? [],
  };
}
