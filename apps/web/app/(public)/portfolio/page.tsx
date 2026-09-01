import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "../../../src/components/public/Container";
import { publicContent } from "../../../src/generated/public-content";

export const metadata: Metadata = {
  title: "Portfolio",
};

export default function PortfolioPage() {
  return (
    <div className="page-shell">
      <Container>
        <h1>Portfolio</h1>
        <p>
          {publicContent.identity.publicName} works from {publicContent.identity.primaryOperation.displayName},
          with a branch in {publicContent.identity.branch.displayName}. Pricing is quote only.
        </p>
        <p>
          <Link className="cta" href="/contact/">
            Contact us
          </Link>
        </p>
      </Container>
    </div>
  );
}
