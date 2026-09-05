import { publicContent } from "../../../generated/public-content";
import { Container } from "../Container";
import { ContactIntroduction } from "./ContactIntroduction";
import { ContactMap } from "./ContactMap";
import { ContactMethods } from "./ContactMethods";
import { ContactLocations } from "./ContactLocations";

export function ContactPage() {
  const { contact } = publicContent;

  return (
    <div className="contact-page">
      <Container>
        <ContactIntroduction />
        <ContactMethods />
        <ContactLocations />
        <section className="contact-map-section" aria-labelledby="contact-map-heading">
          <h2 id="contact-map-heading">{contact.mapHeading}</h2>
          <ContactMap />
        </section>
      </Container>
    </div>
  );
}
