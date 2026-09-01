import { publicContent } from "../../../generated/public-content";

export function ContactIntroduction() {
  const { contact, contacts } = publicContent;
  return (
    <div className="contact-intro">
      <h1>{contact.heading}</h1>
      <p>{contact.introduction}</p>
      <p className="contact-intro__links">
        <a href={`mailto:${contacts.email}`} aria-label={contact.emailAlternativeText}>
          {contacts.email}
        </a>
        {" · "}
        <a href={contacts.primaryPhoneHref} aria-label={contact.telephoneAlternativeText}>
          {contacts.primaryPhone}
        </a>
      </p>
    </div>
  );
}
