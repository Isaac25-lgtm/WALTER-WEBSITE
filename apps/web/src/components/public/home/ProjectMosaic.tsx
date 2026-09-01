import Link from "next/link";

export type MosaicProject = {
  id: string;
  title: string;
  href?: string;
  imageSrc?: string | null;
};

export function ProjectMosaic({ projects }: { projects: readonly MosaicProject[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="project-mosaic" aria-label="Featured projects">
      <ul className="project-mosaic__grid">
        {projects.map((project) => (
          <li key={project.id}>
            <Link className="project-mosaic__tile" href={project.href ?? "/portfolio/"}>
              {project.imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- approved project still only
                <img src={project.imageSrc} alt="" />
              ) : null}
              <span className="project-mosaic__title">{project.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
