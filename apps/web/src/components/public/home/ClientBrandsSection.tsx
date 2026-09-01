export type ClientBrand = {
  id: string;
  name: string;
  imageSrc?: string | null;
};

export function ClientBrandsSection({ logos }: { logos: readonly ClientBrand[] }) {
  if (logos.length === 0) return null;

  return (
    <section className="client-brands" aria-label="Organisations we have worked with">
      <ul>
        {logos.map((logo) => (
          <li key={logo.id}>
            {logo.imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- approved client mark only
              <img src={logo.imageSrc} alt={logo.name} />
            ) : (
              logo.name
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
