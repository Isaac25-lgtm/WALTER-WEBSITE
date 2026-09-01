import Link from "next/link";
import { publicContent } from "../../generated/public-content";
import { Container } from "./Container";
import { Logo } from "./Logo";

export function SiteFooter() {
  const { identity, contacts, navigation } = publicContent;
  const year = 2026;

  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Logo variant="footer" />
            <p>
              {identity.publicName} · {identity.mark}
            </p>
          </div>
          <nav aria-label="Footer">
            <ul>
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <address>
            <p>
              <a href={contacts.primaryPhoneHref}>{contacts.primaryPhone}</a>
            </p>
            <p>
              <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
            </p>
            <p>{identity.primaryOperation.physicalAddress}</p>
            <p>
              {identity.branch.publicLabel}: {identity.branch.postalAddress}
            </p>
          </address>
        </div>
        <p className="site-footer__legal">
          © {year} {identity.legalFooterName}
        </p>
      </Container>
    </footer>
  );
}
