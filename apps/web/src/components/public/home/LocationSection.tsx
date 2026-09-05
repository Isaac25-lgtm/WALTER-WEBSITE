import { publicContent } from "../../../generated/public-content";
import { Container } from "../Container";
import { LocationMap } from "../LocationMap";

export function LocationSection() {
  const { map } = publicContent;

  return (
    <section className="home-location" aria-labelledby="home-location-heading">
      <Container>
        <h2 id="home-location-heading">{map.homeHeading}</h2>
        <p className="home-location__intro">{map.homeSupporting}</p>
        <LocationMap />
      </Container>
    </section>
  );
}
