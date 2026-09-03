import Link from "next/link";

export type MosaicProject = {
  id: string;
  title: string;
  href?: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    objectPosition: string;
  } | null;
};

export function ProjectMosaic({ projects }: { projects: readonly MosaicProject[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="project-mosaic" aria-label="Featured projects">
      <ul className="project-mosaic__grid">
        {projects.map((project) => (
          <li key={project.id}>
            <Link className="project-mosaic__tile" href={project.href ?? "/portfolio/"}>
              {project.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- static export uses curated public media
                <img
                  src={project.image.src}
                  alt=""
                  width={project.image.width}
                  height={project.image.height}
                  style={{ objectPosition: project.image.objectPosition }}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              <span className="project-mosaic__title">{project.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
