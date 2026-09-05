import { publicContent } from "../../../generated/public-content";

export function ContactMethods() {
  const { contact, contacts, identity } = publicContent;
  const { whatsapp } = contacts;

  const telephones = [
    { label: `${identity.primaryOperation.country} — primary`, number: contacts.primaryPhone, href: contacts.primaryPhoneHref },
    { label: `${identity.primaryOperation.country} — alternative`, number: contacts.secondaryPhone, href: contacts.secondaryPhoneHref },
    { label: identity.branch.country, number: contacts.tanzaniaLocalPhone, href: contacts.tanzaniaLocalPhoneHref },
  ];

  return (
    <section className="contact-methods" aria-labelledby="contact-methods-heading">
      <h2 id="contact-methods-heading" className="visually-hidden">
        Ways to reach us
      </h2>

      <div className="contact-methods__grid">
        <div className="contact-card contact-card--whatsapp">
          <h3>{contact.whatsappHeading}</h3>
          <p>{contact.whatsappAlternativeText}</p>
          <a
            className="contact-action contact-action--whatsapp"
            href={whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={whatsapp.ariaLabel}
          >
            {whatsapp.label}
          </a>
        </div>

        <div className="contact-card">
          <h3>{contact.telephoneHeading}</h3>
          <ul className="contact-list">
            {telephones.map((item) => (
              <li key={item.href}>
                <span className="contact-list__label">{item.label}</span>
                <a className="contact-list__value" href={item.href}>
                  {item.number}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="contact-card">
          <h3>{contact.emailHeading}</h3>
          <p>{contact.emailAlternativeText}</p>
          <a className="contact-action" href={contacts.emailHref}>
            {contacts.email}
          </a>
        </div>
      </div>
    </section>
  );
}
