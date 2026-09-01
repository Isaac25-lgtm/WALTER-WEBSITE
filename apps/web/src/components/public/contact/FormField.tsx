import type { ChangeEventHandler, ReactNode } from "react";

type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "tel";
  value: string;
  autoComplete?: string;
  error?: string;
  describedBy?: string;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function FormField({
  id,
  name,
  label,
  type = "text",
  value,
  autoComplete,
  error,
  describedBy,
  disabled,
  onChange,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const described = [error ? errorId : null, describedBy].filter(Boolean).join(" ") || undefined;
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={described}
        disabled={disabled}
        onChange={onChange}
      />
      {error ? (
        <p className="form-field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type MessageFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
};

export function MessageField({ id, name, label, value, error, disabled, onChange }: MessageFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="form-field form-field--full">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name}
        value={value}
        rows={6}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        disabled={disabled}
        onChange={onChange}
      />
      {error ? (
        <p className="form-field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormHint({ children }: { children: ReactNode }) {
  return <p className="form-field__hint">{children}</p>;
}
