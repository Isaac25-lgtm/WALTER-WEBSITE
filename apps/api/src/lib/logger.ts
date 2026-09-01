export const LOGGER_REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers.set-cookie",
  "req.headers.cf-connecting-ip",
  "req.headers.x-forwarded-for",
  "req.body",
  "res.body",
  "DATABASE_URL",
  "*.DATABASE_URL",
] as const;

export function createLoggerOptions() {
  return {
    level: "info" as const,
    redact: {
      paths: [...LOGGER_REDACT_PATHS],
      censor: "[redacted]",
    },
    serializers: {
      req(request: { method?: string; url?: string }) {
        return {
          method: request.method,
          url: request.url,
        };
      },
      res(reply: { statusCode?: number }) {
        return { statusCode: reply.statusCode };
      },
    },
  };
}

export function safeErrorLog(error: unknown): { errName: string; statusCode?: number } {
  const errName = error instanceof Error ? error.name : "Error";
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode;
    if (typeof statusCode === "number") return { errName, statusCode };
  }
  return { errName };
}
