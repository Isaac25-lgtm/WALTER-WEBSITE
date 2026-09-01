import { publicContent } from "../generated/public-content";
import type { SubmitInquiryFailureCode } from "./submit-inquiry";

export function noticeMessageForFailure(code: SubmitInquiryFailureCode): string {
  const { contact } = publicContent;
  if (code === "rate_limited") return contact.formRateLimitedMessage;
  if (code === "attachment_not_available") return contact.formAttachmentUnavailableMessage;
  if (code === "bad_request" || code === "unsupported_media_type") return contact.formInvalidMessage;
  if (code === "internal_error") return contact.formInternalErrorMessage;
  if (code === "timeout") return contact.formTimeoutMessage;
  if (code === "network_error") return contact.formNetworkErrorMessage;
  return contact.formUnavailableMessage;
}
