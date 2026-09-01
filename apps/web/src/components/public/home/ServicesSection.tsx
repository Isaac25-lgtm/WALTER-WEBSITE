import { publicContent } from "../../../generated/public-content";
import { Container } from "../Container";
import { ServiceCard } from "./ServiceCard";

export function ServicesSection() {
  const { homepage, services } = publicContent;
  return (
    <section className="services-section" id="what-we-do" aria-labelledby="services-heading">
      <Container>
        <h2 id="services-heading">{homepage.servicesHeading}</h2>
        <p className="services-section__intro">{homepage.servicesIntroduction}</p>
        <div className="service-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} name={service.name} shortDescription={service.shortDescription} />
          ))}
        </div>
      </Container>
    </section>
  );
}
