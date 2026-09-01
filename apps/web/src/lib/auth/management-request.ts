import { DEFAULT_MANAGEMENT_FETCH_TIMEOUT_MS } from "@ats/config";
import {
  API_ERROR_CODES,
  contentVersionConflictErrorSchema,
  forbiddenErrorSchema,
  inquiryBadRequestErrorSchema,
  inquiryInternalErrorSchema,
  inquiryNotFoundErrorSchema,
  inquiryUnsupportedMediaTypeErrorSchema,
  managementAuthUnavailableErrorSchema,
  managementStorageUnavailableErrorSchema,
  unauthorizedErrorSchema,
} from "@ats/contracts";
import { getPublicApiBaseUrl } from "../public-api";
import { fetchWithTimeout, isAbortError, type ManagementFetchInit } from "./fetch-with-timeout";

export type ManagementClientFailureCode =
  | "not_configured"
  | "unauthorized"
  | "forbidden"
  | "authentication_unavailable"
  | "storage_unavailable"
  | "version_conflict"
  | "timeout"
  | "network_error"
  | "malformed_response"
  | "unexpected"
  | "not_found"
  | "bad_request"
  | "unsupported_media_type";

export type ManagementRequestResult =
  | { ok: true; status: number; json: unknown }
  | { ok: false; code: Extract<ManagementClientFailureCode, "not_configured" | "unauthorized" | "timeout" | "network_error"> };

function bearerHeaders(accessToken: string): Record<string, string> {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

export function classifyManagementError(status: number, json: unknown): ManagementClientFailureCode | null {
  if (status === 400 && inquiryBadRequestErrorSchema.safeParse(json).success) return "bad_request";
  if (status === 401 && unauthorizedErrorSchema.safeParse(json).success) return "unauthorized";
  if (status === 403 && forbiddenErrorSchema.safeParse(json).success) return "forbidden";
  if (status === 404 && inquiryNotFoundErrorSchema.safeParse(json).success) return "not_found";
  if (status === 409 && contentVersionConflictErrorSchema.safeParse(json).success) return "version_conflict";
  if (status === 415 && inquiryUnsupportedMediaTypeErrorSchema.safeParse(json).success) {
    return "unsupported_media_type";
  }
  if (status === 500 && inquiryInternalErrorSchema.safeParse(json).success) return "unexpected";
  if (status === 503 && managementAuthUnavailableErrorSchema.safeParse(json).success) {
    return "authentication_unavailable";
  }
  if (status === 503 && managementStorageUnavailableErrorSchema.safeParse(json).success) {
    return "storage_unavailable";
  }
  if (
    typeof json === "object" &&
    json !== null &&
    "error" in json &&
    typeof json.error === "object" &&
    json.error !== null &&
    "code" in json.error &&
    json.error.code === API_ERROR_CODES.malformed_response
  ) {
    return "malformed_response";
  }
  return null;
}

export async function managementRequest(
  accessToken: string,
  url: string,
  init: ManagementFetchInit,
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = DEFAULT_MANAGEMENT_FETCH_TIMEOUT_MS,
): Promise<ManagementRequestResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  if (!accessToken.trim()) return { ok: false, code: "unauthorized" };
  try {
    const response = await fetchWithTimeout(
      url,
      {
        credentials: "omit",
        cache: "no-store",
        ...init,
        headers: {
          ...bearerHeaders(accessToken),
          ...(init.headers ?? {}),
        },
      },
      fetchImpl,
      timeoutMs,
    );
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return { ok: true, status: response.status, json: undefined };
    }
    return { ok: true, status: response.status, json };
  } catch (error) {
    if (isAbortError(error)) return { ok: false, code: "timeout" };
    return { ok: false, code: "network_error" };
  }
}

export function parseManagementJson<T>(
  result: ManagementRequestResult,
  status: number,
  schema: { safeParse: (_value: unknown) => { success: boolean }; parse: (_value: unknown) => T },
): { ok: true; data: T } | { ok: false; code: ManagementClientFailureCode } {
  if (!result.ok) return result;
  if (result.status === status) {
    if (result.json === undefined) return { ok: false, code: "malformed_response" };
    if (!schema.safeParse(result.json).success) return { ok: false, code: "malformed_response" };
    return { ok: true, data: schema.parse(result.json) };
  }
  if (result.json === undefined) return { ok: false, code: "malformed_response" };
  const code = classifyManagementError(result.status, result.json);
  if (code) return { ok: false, code };
  return { ok: false, code: "unexpected" };
}
