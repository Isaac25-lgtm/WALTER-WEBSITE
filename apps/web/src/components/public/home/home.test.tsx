/** @vitest-environment jsdom */

import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "./HomePage";
import { publicContent } from "../../../generated/public-content";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("homepage", () => {
  it("renders one H1 from generated ATS copy and nine services", () => {
    render(<HomePage />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(publicContent.homepage.heroHeading);
    expect(screen.getByText(publicContent.homepage.heroSupporting)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: publicContent.homepage.servicesHeading })).toBeInTheDocument();
    const serviceNames = publicContent.services.map((service) => service.name);
    expect(serviceNames).toHaveLength(9);
    for (const service of publicContent.services) {
      expect(screen.getByRole("heading", { name: service.name })).toBeInTheDocument();
      expect(screen.getByText(service.shortDescription)).toBeInTheDocument();
    }
  });

  it("renders curated company photography while withholding unrelated publication-controlled collections", () => {
    const { container } = render(<HomePage />);
    expect(container.querySelector(".project-mosaic")).toBeInTheDocument();
    expect(container.querySelector(".latest-work")).toBeNull();
    expect(container.querySelector(".client-brands")).toBeNull();
    expect(publicContent.projects).toHaveLength(6);
    expect(container.querySelectorAll(".service-card__media")).toHaveLength(9);
    expect(container.querySelectorAll(".project-mosaic__tile img")).toHaveLength(6);
    expect(publicContent.latestWork).toEqual([]);
    expect(publicContent.clientLogos).toEqual([]);
    expect(publicContent.testimonials).toEqual([]);
    expect(publicContent.clientNames).toEqual([]);
    expect(publicContent.prices).toEqual([]);
  });

  it("points CTAs at contact and portfolio and does not leak forbidden identity", () => {
    const { container } = render(<HomePage />);
    const contactLinks = [...container.querySelectorAll('a[href="/contact/"]')];
    expect(contactLinks.length).toBeGreaterThanOrEqual(2);
    expect(contactLinks.some((link) => link.textContent === publicContent.homepage.contactCtaLabel)).toBe(true);
    expect(screen.getByRole("link", { name: publicContent.homepage.portfolioCtaLabel })).toHaveAttribute(
      "href",
      "/portfolio/",
    );
    expect(container.innerHTML).not.toMatch(/context\/assets|context\\assets|\.pdf/i);
    expect(container.textContent).not.toMatch(/\/walter|Metalworks|testimonial|Google rating|★/i);
    expect(container.textContent).not.toContain("100+ years");
  });
  it("shows the Tanzania branch location map near the bottom of the page", () => {
    const { container } = render(<HomePage />);
    const section = container.querySelector(".home-location");
    expect(section).not.toBeNull();

    const iframe = section?.querySelector("iframe");
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=-6.1683199,35.7260943&z=17&hl=en&output=embed",
    );
    expect(iframe).toHaveAttribute("loading", "lazy");
    expect(iframe).toHaveAttribute("title", "Active Technical Services Tanzania branch location");

    const link = screen.getByRole("link", { name: publicContent.map.linkLabel });
    expect(link).toHaveAttribute("href", "https://www.google.com/maps?q=-6.1683199,35.7260943&z=17&hl=en");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("keeps the homepage map after the About section and before the closing CTA", () => {
    const { container } = render(<HomePage />);
    const about = container.querySelector(".about-section");
    const location = container.querySelector(".home-location");
    const closing = container.querySelector(".closing-cta");
    if (!about || !location || !closing) throw new Error("homepage sections must all render");
    expect(about.compareDocumentPosition(location) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(location.compareDocumentPosition(closing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("does not present the Tanzania branch as a headquarters", () => {
    const { container } = render(<HomePage />);
    expect(container.querySelector(".home-location")?.textContent).toMatch(/Jinja/);
    expect(container.querySelector(".home-location")?.textContent).toMatch(/Dodoma/);
    expect(container.textContent).not.toMatch(/head office|headquarters/i);
  });
});
