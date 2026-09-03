type ServiceCardProps = {
  name: string;
  shortDescription: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    objectPosition: string;
  } | null;
};

export function ServiceCard({ name, shortDescription, image }: ServiceCardProps) {
  return (
    <article className="service-card">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export uses curated public media
        <img
          className="service-card__media"
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          style={{ objectPosition: image.objectPosition }}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <h3>{name}</h3>
      <p>{shortDescription}</p>
    </article>
  );
}
