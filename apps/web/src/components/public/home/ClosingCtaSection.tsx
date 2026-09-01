import Link from "next/link";
import { publicContent } from "../../../generated/public-content";

export function ClosingCtaSection() {
  const { homepage } = publicContent;
  return (
    <section className="closing-cta" aria-labelledby="closing-cta-heading">
      <div className="closing-cta__inner">
        <h2 id="closing-cta-heading">{homepage.closingCtaHeading}</h2>
        <p>{homepage.closingCtaSupporting}</p>
        <p>
          <Link className="cta" href="/contact/">
            {homepage.contactCtaLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}
