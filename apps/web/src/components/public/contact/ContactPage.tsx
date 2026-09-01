import { publicContent } from "../../../generated/public-content";
import { Container } from "../Container";
import { ApprovedMapSlot } from "./ApprovedMapSlot";
import { ContactIntroduction } from "./ContactIntroduction";
import { InquiryForm } from "./InquiryForm";

export function ContactPage() {
  return (
    <div className="contact-page">
      <Container>
        <ContactIntroduction />
        <InquiryForm />
        <ApprovedMapSlot coordinates={publicContent.mapCoordinates} />
      </Container>
    </div>
  );
}
