import { parseNeonAuthBaseUrl, parsePublicApiOrigin } from "./public-url";

export function getPublicApiBaseUrl(): string | null {
  return parsePublicApiOrigin(process.env.NEXT_PUBLIC_API_BASE_URL);
}

export function getPublicNeonAuthBaseUrl(): string | null {
  return parseNeonAuthBaseUrl(process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL);
}

export function inquiryEndpointUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/inquiries`;
}

export function managementSessionEndpointUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/management/session`;
}

export function managementInquiriesEndpointUrl(
  baseUrl: string,
  options: { status?: string; cursor?: string; limit?: number } = {},
): string {
  const url = new URL(`${baseUrl.replace(/\/+$/, "")}/management/inquiries`);
  if (options.status) url.searchParams.set("status", options.status);
  if (options.cursor) url.searchParams.set("cursor", options.cursor);
  if (options.limit !== undefined) url.searchParams.set("limit", String(options.limit));
  return url.toString();
}

export function managementInquiryEndpointUrl(baseUrl: string, id: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/management/inquiries/${encodeURIComponent(id)}`;
}

export function managementInquiryStatusEndpointUrl(baseUrl: string, id: string): string {
  return `${managementInquiryEndpointUrl(baseUrl, id)}/status`;
}

export function managementContentDraftsEndpointUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/management/content/drafts`;
}

export function managementContentDraftEndpointUrl(baseUrl: string, key: string): string {
  return `${managementContentDraftsEndpointUrl(baseUrl)}/${encodeURIComponent(key)}`;
}

export function managementContentDraftResetEndpointUrl(baseUrl: string, key: string): string {
  return `${managementContentDraftEndpointUrl(baseUrl, key)}/reset`;
}

export function managementContentPublicationsEndpointUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/management/content/publications`;
}

export function managementContentPublicationEndpointUrl(baseUrl: string, id: string): string {
  return `${managementContentPublicationsEndpointUrl(baseUrl)}/${encodeURIComponent(id)}`;
}

export function managementContentPublicationPrepareEndpointUrl(baseUrl: string): string {
  return `${managementContentPublicationsEndpointUrl(baseUrl)}/prepare`;
}
