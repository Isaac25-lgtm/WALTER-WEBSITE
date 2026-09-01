import Link from "next/link";
import { publicContent } from "../../../generated/public-content";

export function HeroSection() {
  const { homepage } = publicContent;
  return (
    <section className="hero" aria-labelledby="home-hero-heading">
      <div className="hero__inner">
        <h1 id="home-hero-heading">{homepage.heroHeading}</h1>
        <p className="hero__support">{homepage.heroSupporting}</p>
        <p className="hero__action">
          <Link className="cta" href="/contact/">
            {homepage.contactCtaLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}
