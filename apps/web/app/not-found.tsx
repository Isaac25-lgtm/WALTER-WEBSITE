import Link from "next/link";
import { Container } from "../src/components/public/Container";
import { SiteFrame } from "../src/components/public/SiteFrame";
import { publicContent } from "../src/generated/public-content";

export default function NotFoundPage() {
  return (
    <SiteFrame>
      <div className="page-shell">
        <Container>
          <h1>Page not found</h1>
          <p>That address is not part of the {publicContent.identity.publicName} public site.</p>
          <p>
            <Link href="/">Return home</Link>
          </p>
        </Container>
      </div>
    </SiteFrame>
  );
}
