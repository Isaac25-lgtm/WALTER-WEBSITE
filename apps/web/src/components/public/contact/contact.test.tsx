/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { publicContent } from "../../../generated/public-content";
import { ContactPage } from "./ContactPage";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

describe("contact page", () => {
  it("renders the heading and enquiry introduction", () => {
    render(<ContactPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Contact Us" })).toBeInTheDocument();
    expect(screen.getByText(publicContent.contact.introduction)).toBeInTheDocument();
  });

  it("shows all three approved telephone numbers as tel: links", () => {
    const { container } = render(<ContactPage />);
    const expected = [
      ["+256 782 318 727", "tel:+256782318727"],
      ["+256 755 318 727", "tel:+256755318727"],
      ["+255 764 306 184", "tel:+255764306184"],
    ] as const;
    for (const [display, href] of expected) {
      const link = screen.getByRole("link", { name: display });
      expect(link).toHaveAttribute("href", href);
    }
    expect(container.querySelectorAll('a[href^="tel:"]')).toHaveLength(3);
  });

  it("shows the approved email address as a mailto: link", () => {
    render(<ContactPage />);
    expect(screen.getByRole("link", { name: "activetechnicalservices@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:activetechnicalservices@gmail.com",
    );
  });

  it("offers a WhatsApp action with safe external-link attributes", () => {
    const { container } = render(<ContactPage />);
    const link = container.querySelector<HTMLAnchorElement>(".contact-action--whatsapp");
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute("href", publicContent.contacts.whatsapp.url);
    expect(link?.getAttribute("href")).toContain("wa.me/256782318727");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAccessibleName("Chat with Active Technical Services on WhatsApp");
  });

  it("presents the Jinja operation and the Tanzania branch without claiming a head office", () => {
    const { container } = render(<ContactPage />);
    expect(container.textContent).toContain("Jinja");
    expect(container.textContent).toContain("Dodoma");
    expect(container.textContent).not.toMatch(/head office|headquarters/i);
  });

  it("embeds the supplied Google Maps location lazily and with a title", () => {
    const { container } = render(<ContactPage />);
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=-6.1683199,35.7260943&z=17&hl=en&output=embed",
    );
    expect(iframe).toHaveAttribute("loading", "lazy");
    expect(iframe).toHaveAttribute("title", "Active Technical Services Tanzania branch location");
  });

  it("links out to the same location on Google Maps", () => {
    render(<ContactPage />);
    const link = screen.getByRole("link", { name: "Open in Google Maps" });
    expect(link).toHaveAttribute("href", "https://www.google.com/maps?q=-6.1683199,35.7260943&z=17&hl=en");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("has no submitting form and no stale backend messaging", () => {
    const { container } = render(<ContactPage />);
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelectorAll("input, textarea, button")).toHaveLength(0);
    expect(container.textContent).not.toMatch(
      /submit|sending|being prepared|try again|could not be sent|thank you/i,
    );
  });
});
