/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { publicContent } from "../../../generated/public-content";
import { PortfolioPage } from "./PortfolioPage";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

describe("portfolio", () => {
  it("renders the curated groups and every selected image", () => {
    const { container } = render(<PortfolioPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: publicContent.portfolio.heading })).toBeInTheDocument();
    expect(publicContent.portfolio.groups).toHaveLength(5);
    expect(container.querySelectorAll(".portfolio-card")).toHaveLength(publicContent.projectMedia.length);
    expect(container.querySelectorAll(".portfolio-card img")).toHaveLength(publicContent.projectMedia.length);
    for (const group of publicContent.portfolio.groups) {
      expect(screen.getByRole("heading", { name: group.title })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: group.title })).toHaveAttribute("href", `#${group.id}`);
    }
  });

  it("keeps client names, prices and private management language out", () => {
    const { container } = render(<PortfolioPage />);
    expect(publicContent.clientNames).toEqual([]);
    expect(publicContent.prices).toEqual([]);
    expect(container.textContent).not.toMatch(/\/walter|Metalworks/i);
    expect(screen.getByRole("link", { name: publicContent.homepage.contactCtaLabel })).toHaveAttribute(
      "href",
      "/contact/",
    );
  });
});
