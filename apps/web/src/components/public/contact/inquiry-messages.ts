export const INQUIRY_FIELD_ERRORS = {
  firstName: "Enter your first name.",
  lastName: "Enter your last name.",
  email: "Enter a valid email address.",
  phone: "Enter a telephone number.",
  message: "Enter a message.",
  attachmentSize: "The selected file is larger than 1 MB.",
  attachmentType: "Use a JPG, PNG, WebP or PDF file.",
} as const;

export type InquiryFieldName = "firstName" | "lastName" | "email" | "phone" | "message" | "attachment";
