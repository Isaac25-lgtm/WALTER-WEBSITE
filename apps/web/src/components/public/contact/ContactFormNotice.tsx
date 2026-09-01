import { publicContent } from "../../../generated/public-content";

export function ContactFormNotice({ id, message }: { id: string; message: string }) {
  const { contact, contacts } = publicContent;
  return (
    <div className="inquiry-notice" id={id} role="status" tabIndex={-1}>
      <p>{message}</p>
      <p>
        <a href={contacts.primaryPhoneHref} aria-label={contact.telephoneAlternativeText}>
          {contacts.primaryPhone}
        </a>
        {" · "}
        <a href={`mailto:${contacts.email}`} aria-label={contact.emailAlternativeText}>
          {contacts.email}
        </a>
      </p>
    </div>
  );
}
