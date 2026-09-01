import {
  managementInquiryDetailSchema,
  managementInquiryListResponseSchema,
  type InquiryStatus,
  type ManagementInquiryDetail,
  type ManagementInquiryListResponse,
} from "@ats/contracts";
import {
  getPublicApiBaseUrl,
  managementInquiriesEndpointUrl,
  managementInquiryEndpointUrl,
  managementInquiryStatusEndpointUrl,
} from "../public-api";
import { managementRequest, parseManagementJson, type ManagementClientFailureCode } from "./management-request";

export type ManagementInquiryFailureCode = ManagementClientFailureCode;

export type ManagementInquiryListResult =
  | { ok: true; data: ManagementInquiryListResponse }
  | { ok: false; code: ManagementInquiryFailureCode };

export type ManagementInquiryDetailResult =
  | { ok: true; data: ManagementInquiryDetail }
  | { ok: false; code: ManagementInquiryFailureCode };

export type ManagementInquiryListOptions = {
  status?: InquiryStatus | "all";
  cursor?: string;
  limit?: number;
};

export async function fetchManagementInquiries(
  accessToken: string,
  options: ManagementInquiryListOptions = {},
  fetchImpl: typeof fetch = fetch,
): Promise<ManagementInquiryListResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  const url = managementInquiriesEndpointUrl(baseUrl, {
    status: options.status && options.status !== "all" ? options.status : undefined,
    cursor: options.cursor,
    limit: options.limit,
  });
  const result = await managementRequest(accessToken, url, { method: "GET" }, fetchImpl);
  return parseManagementJson(result, 200, managementInquiryListResponseSchema);
}

export async function fetchManagementInquiry(
  accessToken: string,
  id: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ManagementInquiryDetailResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  const result = await managementRequest(
    accessToken,
    managementInquiryEndpointUrl(baseUrl, id),
    { method: "GET" },
    fetchImpl,
  );
  return parseManagementJson(result, 200, managementInquiryDetailSchema);
}

export async function updateManagementInquiryStatus(
  accessToken: string,
  id: string,
  status: InquiryStatus,
  fetchImpl: typeof fetch = fetch,
): Promise<ManagementInquiryDetailResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) return { ok: false, code: "not_configured" };
  const result = await managementRequest(
    accessToken,
    managementInquiryStatusEndpointUrl(baseUrl, id),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
    fetchImpl,
  );
  return parseManagementJson(result, 200, managementInquiryDetailSchema);
}
