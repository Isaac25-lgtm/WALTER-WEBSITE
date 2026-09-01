import {
  INQUIRY_ACCEPTED_EXTENSIONS,
  INQUIRY_ACCEPTED_MIME_TYPES,
  INQUIRY_MAX_ATTACHMENT_BYTES,
  inquiryAttachmentExtension,
  inquiryInputSchema,
  type InquiryAttachmentMeta,
} from "@ats/contracts";
import { INQUIRY_FIELD_ERRORS, type InquiryFieldName } from "./inquiry-messages";

export type InquiryFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

export type InquiryFieldErrors = Partial<Record<InquiryFieldName, string>>;

/**
 * Convenience checks only: name, MIME type, and byte size.
 * File bytes are never read, encoded, uploaded, or retained here.
 * The future API must independently validate signatures and content.
 */
export function validateInquiryAttachment(file: File | null): {
  error?: string;
  meta?: InquiryAttachmentMeta;
} {
  if (!file) return {};

  const extension = inquiryAttachmentExtension(file.name);
  if (!INQUIRY_ACCEPTED_EXTENSIONS.includes(extension as (typeof INQUIRY_ACCEPTED_EXTENSIONS)[number])) {
    return { error: INQUIRY_FIELD_ERRORS.attachmentType };
  }
  if (!INQUIRY_ACCEPTED_MIME_TYPES.includes(file.type as (typeof INQUIRY_ACCEPTED_MIME_TYPES)[number])) {
    return { error: INQUIRY_FIELD_ERRORS.attachmentType };
  }
  if (file.size > INQUIRY_MAX_ATTACHMENT_BYTES) {
    return { error: INQUIRY_FIELD_ERRORS.attachmentSize };
  }
  if (file.size < 1) {
    return { error: INQUIRY_FIELD_ERRORS.attachmentType };
  }

  return {
    meta: {
      originalName: file.name.trim(),
      mimeType: file.type as InquiryAttachmentMeta["mimeType"],
      byteSize: file.size,
    },
  };
}

export function validateInquiryForm(values: InquiryFormValues, file: File | null): InquiryFieldErrors {
  const attachment = validateInquiryAttachment(file);
  if (attachment.error) {
    const fieldErrors: InquiryFieldErrors = { attachment: attachment.error };
    const parsed = inquiryInputSchema.safeParse(values);
    if (!parsed.success) {
      Object.assign(fieldErrors, issuesToFieldErrors(parsed.error.issues));
    }
    return fieldErrors;
  }

  const parsed = inquiryInputSchema.safeParse(
    attachment.meta ? { ...values, attachment: attachment.meta } : values,
  );
  if (parsed.success) return {};
  return issuesToFieldErrors(parsed.error.issues);
}

function issuesToFieldErrors(issues: { path: PropertyKey[]; message: string }[]): InquiryFieldErrors {
  const errors: InquiryFieldErrors = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key === "attachment" && !errors.attachment) {
      errors.attachment =
        issue.message === "unsupported_extension" || issue.path.includes("mimeType")
          ? INQUIRY_FIELD_ERRORS.attachmentType
          : issue.path.includes("byteSize")
            ? INQUIRY_FIELD_ERRORS.attachmentSize
            : INQUIRY_FIELD_ERRORS.attachmentType;
      continue;
    }
    if ((key === "firstName" || key === "lastName" || key === "email" || key === "phone" || key === "message") && !errors[key]) {
      errors[key] = INQUIRY_FIELD_ERRORS[key];
    }
  }
  return errors;
}
