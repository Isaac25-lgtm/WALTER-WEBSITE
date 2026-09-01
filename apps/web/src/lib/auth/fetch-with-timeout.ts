import { DEFAULT_MANAGEMENT_FETCH_TIMEOUT_MS } from "@ats/config";

export type ManagementFetchInit = {
  method?: string;
  credentials?: "omit" | "include" | "same-origin";
  cache?: "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
};

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export async function fetchWithTimeout(
  url: string,
  init: ManagementFetchInit,
  fetchImpl: typeof fetch,
  timeoutMs: number = DEFAULT_MANAGEMENT_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
