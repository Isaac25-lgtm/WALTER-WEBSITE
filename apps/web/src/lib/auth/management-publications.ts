import {
  contentPublicationDetailSchema,
  contentPublicationListResponseSchema,
  type ContentDraftKey,
  type ContentPublicationDetail,
  type ContentPublicationListResponse,
} from "@ats/contracts";
import {
  getPublicApiBaseUrl,
  managementContentPublicationEndpointUrl,
  managementContentPublicationPrepareEndpointUrl,
  managementContentPublicationsEndpointUrl,
} from "../public-api";
import { managementRequest, parseManagementJson, type ManagementClientFailureCode } from "./management-request";

export type ManagementPublicationFailureCode = ManagementClientFailureCode;

export type ManagementPublicationListResult =
  | { ok: true; data: ContentPublicationListResponse }
  | { ok: false; code: ManagementPublicationFailureCode };

export type ManagementPublicationDetailResult =
  | { ok: true; data: ContentPublicationDetail }
  | { ok: false; code: ManagementPublicationFailureCode };

export async function fetchManagementContentPublications(
  accessToken: string,
  options: { cursor?: string; limit?: number } = {},
  fetchImpl: typeof fetch = fetch,
): Promise<ManagementPublicationListResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  const url = new URL(managementContentPublicationsEndpointUrl(baseUrl));
  if (options.cursor) url.searchParams.set("cursor", options.cursor);
  if (options.limit !== undefined) url.searchParams.set("limit", String(options.limit));
  const result = await managementRequest(accessToken, url.toString(), { method: "GET" }, fetchImpl);
  return parseManagementJson(result, 200, contentPublicationListResponseSchema);
}

export async function fetchManagementContentPublication(
  accessToken: string,
  id: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ManagementPublicationDetailResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  const result = await managementRequest(
    accessToken,
    managementContentPublicationEndpointUrl(baseUrl, id),
    { method: "GET" },
    fetchImpl,
  );
  return parseManagementJson(result, 200, contentPublicationDetailSchema);
}

export async function prepareManagementContentPublication(
  accessToken: string,
  expectedDraftVersions: Partial<Record<ContentDraftKey, number>>,
  fetchImpl: typeof fetch = fetch,
): Promise<ManagementPublicationDetailResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  const result = await managementRequest(
    accessToken,
    managementContentPublicationPrepareEndpointUrl(baseUrl),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expectedDraftVersions }),
    },
    fetchImpl,
  );
  return parseManagementJson(result, 201, contentPublicationDetailSchema);
}
