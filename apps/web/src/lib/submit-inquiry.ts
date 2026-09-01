import { DEFAULT_INQUIRY_FETCH_TIMEOUT_MS } from "@ats/config";
import {
  API_ERROR_CODES,
  inquiryAttachmentNotAvailableErrorSchema,
  inquiryBadRequestErrorSchema,
  inquiryCreateRequestSchema,
  inquiryCreatedResponseSchema,
  inquiryInternalErrorSchema,
  inquiryRateLimitErrorSchema,
  inquiryServiceUnavailableErrorSchema,
  inquiryUnsupportedMediaTypeErrorSchema,
  type InquiryCreateRequest,
  type InquiryCreatedResponse,
} from "@ats/contracts";
import { getPublicApiBaseUrl, inquiryEndpointUrl } from "./public-api";

export type SubmitInquiryFailureCode =
  | "not_configured"
  | "network_error"
  | "timeout"
  | typeof API_ERROR_CODES.bad_request
  | typeof API_ERROR_CODES.unsupported_media_type
  | typeof API_ERROR_CODES.attachment_not_available
  | typeof API_ERROR_CODES.rate_limited
  | typeof API_ERROR_CODES.service_unavailable
  | typeof API_ERROR_CODES.internal_error;

export type SubmitInquiryResult =
  | { ok: true; data: InquiryCreatedResponse }
  | { ok: false; code: SubmitInquiryFailureCode };

export type SubmitInquiryOptions = {
  timeoutMs?: number;
};

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export async function submitInquiry(
  payload: InquiryCreateRequest,
  fetchImpl: typeof fetch = fetch,
  options: SubmitInquiryOptions = {},
): Promise<SubmitInquiryResult> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) {
    return { ok: false, code: "not_configured" };
  }

  const parsed = inquiryCreateRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, code: API_ERROR_CODES.bad_request };
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_INQUIRY_FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetchImpl(inquiryEndpointUrl(baseUrl), {
      method: "POST",
      credentials: "omit",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      return { ok: false, code: "timeout" };
    }
    return { ok: false, code: "network_error" };
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 201) {
    const json: unknown = await response.json().catch(() => null);
    const created = inquiryCreatedResponseSchema.safeParse(json);
    if (!created.success) {
      return { ok: false, code: API_ERROR_CODES.internal_error };
    }
    return { ok: true, data: created.data };
  }

  const json: unknown = await response.json().catch(() => null);
  if (response.status === 400 && inquiryBadRequestErrorSchema.safeParse(json).success) {
    return { ok: false, code: API_ERROR_CODES.bad_request };
  }
  if (response.status === 415 && inquiryUnsupportedMediaTypeErrorSchema.safeParse(json).success) {
    return { ok: false, code: API_ERROR_CODES.unsupported_media_type };
  }
  if (response.status === 422 && inquiryAttachmentNotAvailableErrorSchema.safeParse(json).success) {
    return { ok: false, code: API_ERROR_CODES.attachment_not_available };
  }
  if (response.status === 429 && inquiryRateLimitErrorSchema.safeParse(json).success) {
    return { ok: false, code: API_ERROR_CODES.rate_limited };
  }
  if (response.status === 503 && inquiryServiceUnavailableErrorSchema.safeParse(json).success) {
    return { ok: false, code: API_ERROR_CODES.service_unavailable };
  }
  if (response.status === 500 && inquiryInternalErrorSchema.safeParse(json).success) {
    return { ok: false, code: API_ERROR_CODES.internal_error };
  }
  return { ok: false, code: API_ERROR_CODES.internal_error };
}
