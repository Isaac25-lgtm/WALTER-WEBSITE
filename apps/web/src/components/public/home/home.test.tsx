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
    expect(container.textContent).not.toMatch(/WhatsApp|whatsapp|\/walter|Metalworks|testimonial|Google rating|★/i);
    expect(container.textContent).not.toContain("100+ years");
  });
});
