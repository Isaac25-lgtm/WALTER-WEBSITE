import Link from "next/link";
import { publicContent } from "../../../generated/public-content";

export function ThankYouPhotoSlot({
  imageSrc,
  imageAlt,
}: {
  imageSrc?: string | null;
  imageAlt?: string | null;
}) {
  if (!imageSrc) return null;
  return (
    <div className="thank-you-photo">
      {/* eslint-disable-next-line @next/next/no-img-element -- approved gallery still only */}
      <img src={imageSrc} alt={imageAlt ?? ""} />
    </div>
  );
}

export function ThankYouPage() {
  const { thankYou, contact, contacts } = publicContent;
  return (
    <div className="thank-you-page">
      <div className="container">
        <h1>{thankYou.heading}</h1>
        <p className="thank-you-supporting">{thankYou.supporting}</p>
        <p className="thank-you-other-work">{thankYou.otherWork}</p>
        <ThankYouPhotoSlot />
        <p className="thank-you-contacts">
          <a href={contacts.primaryPhoneHref} aria-label={contact.telephoneAlternativeText}>
            {contacts.primaryPhone}
          </a>
          {" · "}
          <a href={`mailto:${contacts.email}`} aria-label={contact.emailAlternativeText}>
            {contacts.email}
          </a>
        </p>
        <p className="thank-you-actions">
          <Link href="/">{thankYou.returnHomeLabel}</Link>
          {" · "}
          <Link href="/contact/">{thankYou.returnContactLabel}</Link>
        </p>
      </div>
    </div>
  );
}
