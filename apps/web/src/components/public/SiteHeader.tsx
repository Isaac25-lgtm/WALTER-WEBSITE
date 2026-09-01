import { publicContent } from "../../generated/public-content";
import { Container } from "./Container";
import { DesktopNavigation } from "./DesktopNavigation";
import { Logo } from "./Logo";
import { MobileNavigation } from "./MobileNavigation";
import { PhoneIcon } from "./PhoneIcon";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Container variant="header">
        <div className="site-header__inner">
          <Logo variant="header" />
          <DesktopNavigation />
          <a className="header-phone" href={publicContent.contacts.primaryPhoneHref}>
            <PhoneIcon />
            <span>{publicContent.contacts.primaryPhone}</span>
            <span className="visually-hidden">Call Active Technical Services</span>
          </a>
          <MobileNavigation />
        </div>
      </Container>
    </header>
  );
}
