import { publicContent } from "../../../generated/public-content";
import { Container } from "../Container";
import { Logo } from "../Logo";

export function AboutSection() {
  const { homepage, siteMedia } = publicContent;
  return (
    <section className="about-section" aria-labelledby="about-heading">
      <Container>
        <div className="about-section__grid">
          <div className="about-section__brand">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export uses curated public media */}
            <img
              className="about-section__photo"
              src={siteMedia.about.src}
              alt={siteMedia.about.alt}
              width={siteMedia.about.width}
              height={siteMedia.about.height}
              style={{ objectPosition: siteMedia.about.objectPosition }}
              loading="lazy"
              decoding="async"
            />
            <div className="about-section__lockup">
              <Logo variant="about" />
              <p className="about-section__eyebrow">{homepage.aboutEyebrow}</p>
              <h2 id="about-heading">{homepage.aboutHeading}</h2>
            </div>
          </div>
          <div className="about-section__copy">
            {homepage.aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
