import { contentDraftItemSchema, contentDraftListResponseSchema, type ContentDraftItem, type ContentDraftListResponse } from "@ats/contracts";
import {
  getPublicApiBaseUrl,
  managementContentDraftEndpointUrl,
  managementContentDraftResetEndpointUrl,
  managementContentDraftsEndpointUrl,
} from "../public-api";
import { managementRequest, parseManagementJson, type ManagementClientFailureCode } from "./management-request";

export type ManagementContentDraftFailureCode = ManagementClientFailureCode;

export type ManagementContentDraftListResult =
  | { ok: true; data: ContentDraftListResponse }
  | { ok: false; code: ManagementContentDraftFailureCode };

export type ManagementContentDraftItemResult =
  | { ok: true; data: ContentDraftItem }
  | { ok: false; code: ManagementContentDraftFailureCode };

export async function fetchManagementContentDrafts(
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ManagementContentDraftListResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  const result = await managementRequest(
    accessToken,
    managementContentDraftsEndpointUrl(baseUrl),
    { method: "GET" },
    fetchImpl,
  );
  return parseManagementJson(result, 200, contentDraftListResponseSchema);
}

export async function fetchManagementContentDraft(
  accessToken: string,
  key: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ManagementContentDraftItemResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  const result = await managementRequest(
    accessToken,
    managementContentDraftEndpointUrl(baseUrl, key),
    { method: "GET" },
    fetchImpl,
  );
  return parseManagementJson(result, 200, contentDraftItemSchema);
}

export async function saveManagementContentDraft(
  accessToken: string,
  key: string,
  value: string,
  expectedVersion: number,
  fetchImpl: typeof fetch = fetch,
): Promise<ManagementContentDraftItemResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  const result = await managementRequest(
    accessToken,
    managementContentDraftEndpointUrl(baseUrl, key),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, expectedVersion }),
    },
    fetchImpl,
  );
  return parseManagementJson(result, 200, contentDraftItemSchema);
}

export async function resetManagementContentDraft(
  accessToken: string,
  key: string,
  expectedVersion: number,
  fetchImpl: typeof fetch = fetch,
): Promise<ManagementContentDraftItemResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  const result = await managementRequest(
    accessToken,
    managementContentDraftResetEndpointUrl(baseUrl, key),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expectedVersion }),
    },
    fetchImpl,
  );
  return parseManagementJson(result, 200, contentDraftItemSchema);
}
