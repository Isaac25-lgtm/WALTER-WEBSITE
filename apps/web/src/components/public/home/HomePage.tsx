import Link from "next/link";
import { publicContent } from "../../../generated/public-content";
import { AboutSection } from "./AboutSection";
import { ClientBrandsSection } from "./ClientBrandsSection";
import { ClosingCtaSection } from "./ClosingCtaSection";
import { HeroSection } from "./HeroSection";
import { LocationSection } from "./LocationSection";
import { LatestWorkSection } from "./LatestWorkSection";
import { ProjectMosaic, type MosaicProject } from "./ProjectMosaic";
import { ServicesSection } from "./ServicesSection";
import type { ClientBrand } from "./ClientBrandsSection";
import type { LatestWorkItem } from "./LatestWorkSection";

export function HomePage() {
  const { homepage, projects, latestWork, socialLinks, clientLogos } = publicContent;

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <ProjectMosaic projects={projects as readonly MosaicProject[]} />
      <p className="portfolio-cta">
        <Link className="cta cta-secondary" href="/portfolio/">
          {homepage.portfolioCtaLabel}
        </Link>
      </p>
      <AboutSection />
      <LatestWorkSection items={latestWork as readonly LatestWorkItem[]} socialLinks={socialLinks} />
      <ClientBrandsSection logos={clientLogos as readonly ClientBrand[]} />
      <LocationSection />
      <ClosingCtaSection />
    </>
  );
}
