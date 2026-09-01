import type { ChangeEvent } from "react";
import {
  INQUIRY_ACCEPTED_EXTENSIONS,
  INQUIRY_ACCEPTED_MIME_TYPES,
  INQUIRY_MAX_ATTACHMENT_BYTES,
} from "@ats/contracts";

type FileFieldProps = {
  id: string;
  name: string;
  label: string;
  hintId: string;
  error?: string;
  disabled?: boolean;
  // Core eslint treats the callback argument name as unused; this is a type only.
  // eslint-disable-next-line no-unused-vars -- File | null callback type
  onChange: (file: File | null) => void;
};

export function FileField({ id, name, label, hintId, error, disabled, onChange }: FileFieldProps) {
  const errorId = `${id}-error`;
  const accept = [...INQUIRY_ACCEPTED_EXTENSIONS, ...INQUIRY_ACCEPTED_MIME_TYPES].join(",");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    onChange(next);
  }

  return (
    <div className="form-field form-field--full">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        disabled={disabled}
        onChange={handleChange}
      />
      <p className="form-field__hint" id={hintId}>
        Optional. JPG, PNG, WebP or PDF. Maximum {INQUIRY_MAX_ATTACHMENT_BYTES / 1_000_000} MB. Files are not
        uploaded yet.
      </p>
      {error ? (
        <p className="form-field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
