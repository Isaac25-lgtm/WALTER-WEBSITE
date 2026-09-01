"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { InquiryCreateRequest } from "@ats/contracts";
import { publicContent } from "../../../generated/public-content";
import { noticeMessageForFailure } from "../../../lib/inquiry-notices";
import { submitInquiry, type SubmitInquiryFailureCode } from "../../../lib/submit-inquiry";
import { ContactFormNotice } from "./ContactFormNotice";
import { FileField } from "./FileField";
import { FormField, MessageField } from "./FormField";
import { type InquiryFieldName } from "./inquiry-messages";
import { validateInquiryAttachment, validateInquiryForm, type InquiryFieldErrors, type InquiryFormValues } from "./validate-inquiry";

const EMPTY_VALUES: InquiryFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

const FIELD_ORDER: InquiryFieldName[] = ["firstName", "lastName", "email", "phone", "message", "attachment"];

export type InquirySubmissionState =
  | "idle"
  | "invalid"
  | "submitting"
  | "unavailable"
  | "rate_limited"
  | "attachment_unavailable"
  | "invalid_server"
  | "timeout"
  | "network_error"
  | "internal_error";

function stateFromFailure(code: SubmitInquiryFailureCode): InquirySubmissionState {
  if (code === "rate_limited") return "rate_limited";
  if (code === "attachment_not_available") return "attachment_unavailable";
  if (code === "bad_request" || code === "unsupported_media_type") return "invalid_server";
  if (code === "timeout") return "timeout";
  if (code === "network_error") return "network_error";
  if (code === "internal_error") return "internal_error";
  return "unavailable";
}

export function InquiryForm() {
  const router = useRouter();
  const idPrefix = useId();
  const [values, setValues] = useState<InquiryFormValues>(EMPTY_VALUES);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<InquiryFieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [state, setState] = useState<InquirySubmissionState>("idle");
  const summaryRef = useRef<HTMLDivElement>(null);
  const hintId = `${idPrefix}-file-hint`;
  const summaryId = `${idPrefix}-summary`;
  const noticeId = `${idPrefix}-notice`;
  const submitting = state === "submitting";
  const errorEntries = FIELD_ORDER.filter((field) => errors[field]).map((field) => [field, errors[field]] as const);

  function updateField<Key extends keyof InquiryFormValues>(key: Key, value: string) {
    const nextValues = { ...values, [key]: value };
    setValues(nextValues);
    if (errors[key]) {
      const nextErrors = validateInquiryForm(nextValues, file);
      setErrors((current) => ({ ...current, [key]: nextErrors[key] }));
    }
  }

  function updateFile(nextFile: File | null) {
    setFile(nextFile);
    if (errors.attachment) {
      const nextErrors = validateInquiryForm(values, nextFile);
      setErrors((current) => ({ ...current, attachment: nextErrors.attachment }));
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validateInquiryForm(values, file);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setNotice(null);
      setState("invalid");
      queueMicrotask(() => summaryRef.current?.focus());
      return;
    }

    const form = event.currentTarget;
    const website = String(new FormData(form).get("website") ?? "");
    const meta = validateInquiryAttachment(file).meta;
    const payload: InquiryCreateRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      message: values.message,
    };
    if (meta) payload.attachment = meta;
    if (website.trim().length > 0) payload.website = website;

    setState("submitting");
    setNotice(null);
    const result = await submitInquiry(payload);
    if (result.ok) {
      router.push("/thank-you/");
      return;
    }

    setState(stateFromFailure(result.code));
    setNotice(noticeMessageForFailure(result.code));
    queueMicrotask(() => {
      document.getElementById(noticeId)?.focus();
    });
  }

  return (
    <form className="inquiry-form" onSubmit={onSubmit} noValidate aria-busy={submitting || undefined}>
      <div className="inquiry-card">
        {errorEntries.length > 0 ? (
          <div className="inquiry-summary" id={summaryId} ref={summaryRef} tabIndex={-1} role="alert">
            <p id={`${idPrefix}-summary-heading`}>Please correct the following:</p>
            <ul aria-labelledby={`${idPrefix}-summary-heading`}>
              {errorEntries.map(([field, message]) => (
                <li key={field}>
                  <a href={`#${idPrefix}-${field}`}>{message}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="inquiry-grid">
          <FormField
            id={`${idPrefix}-firstName`}
            name="firstName"
            label="First Name"
            autoComplete="given-name"
            value={values.firstName}
            error={errors.firstName}
            disabled={submitting}
            onChange={(event) => updateField("firstName", event.target.value)}
          />
          <FormField
            id={`${idPrefix}-lastName`}
            name="lastName"
            label="Last Name"
            autoComplete="family-name"
            value={values.lastName}
            error={errors.lastName}
            disabled={submitting}
            onChange={(event) => updateField("lastName", event.target.value)}
          />
          <FormField
            id={`${idPrefix}-email`}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            error={errors.email}
            disabled={submitting}
            onChange={(event) => updateField("email", event.target.value)}
          />
          <FormField
            id={`${idPrefix}-phone`}
            name="phone"
            label="Mobile Number"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            error={errors.phone}
            disabled={submitting}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </div>

        <MessageField
          id={`${idPrefix}-message`}
          name="message"
          label="Message"
          value={values.message}
          error={errors.message}
          disabled={submitting}
          onChange={(event) => updateField("message", event.target.value)}
        />

        <FileField
          id={`${idPrefix}-attachment`}
          name="attachment"
          label="Upload File Here"
          hintId={hintId}
          error={errors.attachment}
          disabled={submitting}
          onChange={updateFile}
        />

        <div className="inquiry-honeypot visually-hidden" aria-hidden="true">
          <label htmlFor={`${idPrefix}-website`}>
            Website
            <input
              id={`${idPrefix}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              disabled={submitting}
            />
          </label>
        </div>

        <div className="inquiry-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? publicContent.contact.formSubmittingMessage : "Submit"}
          </button>
        </div>
        {submitting ? (
          <p className="inquiry-submitting-status" role="status" aria-live="polite">
            {publicContent.contact.formSubmittingMessage}
          </p>
        ) : null}
      </div>

      {notice ? <ContactFormNotice id={noticeId} message={notice} /> : null}
    </form>
  );
}
