import Link from "next/link";
import { publicContent } from "../../../generated/public-content";

export function ClosingCtaSection() {
  const { homepage, siteMedia } = publicContent;
  return (
    <section className="closing-cta" aria-labelledby="closing-cta-heading">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export uses curated public media */}
      <img
        className="closing-cta__media"
        src={siteMedia.closingCta.src}
        alt=""
        width={siteMedia.closingCta.width}
        height={siteMedia.closingCta.height}
        style={{ objectPosition: siteMedia.closingCta.objectPosition }}
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
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
