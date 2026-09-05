import { publicContent } from "../../../generated/public-content";

export function ContactLocations() {
  const { contact, identity } = publicContent;

  return (
    <section className="contact-locations" aria-labelledby="contact-locations-heading">
      <h2 id="contact-locations-heading">{contact.locationsHeading}</h2>
      <div className="contact-locations__grid">
        <div className="contact-card">
          <h3>{contact.jinjaLocationLabel}</h3>
          <address>
            <p>{identity.primaryOperation.physicalAddress}</p>
            <p>{identity.primaryOperation.postalAddress}</p>
          </address>
        </div>
        <div className="contact-card">
          <h3>{contact.tanzaniaBranchLabel}</h3>
          <address>
            <p>{identity.branch.displayName}</p>
            <p>{identity.branch.postalAddress}</p>
          </address>
        </div>
      </div>
    </section>
  );
}
