import Link from "next/link";
import { publicContent } from "../../../generated/public-content";

export function HeroSection() {
  const { homepage, siteMedia } = publicContent;
  return (
    <section className="hero" aria-labelledby="home-hero-heading">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export uses curated public media */}
      <img
        className="hero__media"
        src={siteMedia.hero.src}
        alt=""
        width={siteMedia.hero.width}
        height={siteMedia.hero.height}
        style={{ objectPosition: siteMedia.hero.objectPosition }}
        fetchPriority="high"
        aria-hidden="true"
      />
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
