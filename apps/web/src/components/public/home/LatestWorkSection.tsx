export type LatestWorkItem = {
  id: string;
  href: string;
  label: string;
  imageSrc?: string | null;
};

export function LatestWorkSection({
  items,
  socialLinks,
}: {
  items: readonly LatestWorkItem[];
  socialLinks: readonly unknown[];
}) {
  if (items.length === 0 && socialLinks.length === 0) return null;

  return (
    <section className="latest-work" aria-label="Latest work">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
