import Link from "next/link";
import { publicContent } from "../../../generated/public-content";
import { Container } from "../Container";

export function PortfolioPage() {
  const { portfolio, homepage } = publicContent;

  return (
    <div className="portfolio-page">
      <section className="portfolio-hero" aria-labelledby="portfolio-heading">
        <Container>
          <p className="portfolio-hero__eyebrow">Active Technical Services</p>
          <h1 id="portfolio-heading">{portfolio.heading}</h1>
          <p>{portfolio.introduction}</p>
        </Container>
      </section>

      <nav className="portfolio-index" aria-label="Portfolio categories">
        <Container>
          <ul>
            {portfolio.groups.map((group) => (
              <li key={group.id}>
                <a href={`#${group.id}`}>{group.title}</a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      <div className="portfolio-groups">
        {portfolio.groups.map((group, groupIndex) => (
          <section
            className={groupIndex % 2 === 0 ? "portfolio-group" : "portfolio-group portfolio-group--tint"}
            id={group.id}
            key={group.id}
            aria-labelledby={`${group.id}-heading`}
          >
            <Container>
              <div className="portfolio-group__heading">
                <span aria-hidden="true">{String(groupIndex + 1).padStart(2, "0")}</span>
                <h2 id={`${group.id}-heading`}>{group.title}</h2>
              </div>
              <div className="portfolio-grid">
                {group.items.map((item, itemIndex) => (
                  <figure
                    className={`portfolio-card${itemIndex === 0 && group.items.length > 3 ? " portfolio-card--featured" : ""}`}
                    key={item.id}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- static export uses curated public media */}
                    <img
                      src={item.image.src}
                      alt={item.image.alt}
                      width={item.image.width}
                      height={item.image.height}
                      style={{ objectPosition: item.image.objectPosition }}
                      loading={groupIndex === 0 && itemIndex < 2 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <figcaption>{item.title}</figcaption>
                  </figure>
                ))}
              </div>
            </Container>
          </section>
        ))}
      </div>

      <section className="portfolio-contact" aria-labelledby="portfolio-contact-heading">
        <Container>
          <h2 id="portfolio-contact-heading">{homepage.closingCtaHeading}</h2>
          <p>{homepage.closingCtaSupporting}</p>
          <Link className="cta" href="/contact/">
            {homepage.contactCtaLabel}
          </Link>
        </Container>
      </section>
    </div>
  );
}
