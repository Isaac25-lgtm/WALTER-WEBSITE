import { publicContent } from "../../../generated/public-content";
import { Container } from "../Container";
import { Logo } from "../Logo";

export function AboutSection() {
  const { homepage } = publicContent;
  return (
    <section className="about-section" aria-labelledby="about-heading">
      <Container>
        <div className="about-section__grid">
          <div className="about-section__brand">
            <Logo variant="about" />
            <p className="about-section__eyebrow">{homepage.aboutEyebrow}</p>
            <h2 id="about-heading">{homepage.aboutHeading}</h2>
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
