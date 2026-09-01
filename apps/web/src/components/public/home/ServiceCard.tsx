type ServiceCardProps = {
  name: string;
  shortDescription: string;
  imageSrc?: string | null;
  imageAlt?: string;
};

export function ServiceCard({ name, shortDescription, imageSrc, imageAlt }: ServiceCardProps) {
  return (
    <article className="service-card">
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- optional future approved still
        <img className="service-card__media" src={imageSrc} alt={imageAlt || name} />
      ) : null}
      <h3>{name}</h3>
      <p>{shortDescription}</p>
    </article>
  );
}
