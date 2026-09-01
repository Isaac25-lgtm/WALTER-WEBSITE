import { DEFAULT_MANAGEMENT_FETCH_TIMEOUT_MS } from "@ats/config";
import { managementSessionResponseSchema, type ManagementSessionResponse } from "@ats/contracts";
import { getPublicApiBaseUrl, managementSessionEndpointUrl } from "../public-api";
import { managementRequest, parseManagementJson, type ManagementClientFailureCode } from "./management-request";

export type ManagementSessionResult =
  | { ok: true; data: ManagementSessionResponse }
  | { ok: false; code: ManagementClientFailureCode };

export async function fetchManagementSession(
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = DEFAULT_MANAGEMENT_FETCH_TIMEOUT_MS,
): Promise<ManagementSessionResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  const result = await managementRequest(
    accessToken,
    managementSessionEndpointUrl(baseUrl),
    { method: "GET" },
    fetchImpl,
    timeoutMs,
  );
  return parseManagementJson(result, 200, managementSessionResponseSchema);
}
