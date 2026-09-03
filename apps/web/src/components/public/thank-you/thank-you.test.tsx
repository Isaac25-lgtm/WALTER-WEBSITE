/** @vitest-environment jsdom */

import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThankYouPage } from "./ThankYouPage";
import { publicContent } from "../../../generated/public-content";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("thank-you page", () => {
  it("renders the generated thank-you copy with one curated company photograph", () => {
    render(<ThankYouPage />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(publicContent.thankYou.heading);
    expect(screen.getByText(publicContent.thankYou.supporting)).toBeInTheDocument();
    expect(screen.getByText(publicContent.thankYou.otherWork)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: publicContent.contact.telephoneAlternativeText })).toHaveAttribute(
      "href",
      publicContent.contacts.primaryPhoneHref,
    );
    expect(screen.getByRole("link", { name: publicContent.contact.emailAlternativeText })).toHaveAttribute(
      "href",
      `mailto:${publicContent.contacts.email}`,
    );
    expect(screen.getByRole("link", { name: publicContent.thankYou.returnHomeLabel })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: publicContent.thankYou.returnContactLabel })).toHaveAttribute(
      "href",
      "/contact/",
    );
    expect(document.querySelector(".thank-you-photo")).toBeInTheDocument();
    expect(document.querySelector(".thank-you-photo img")).toHaveAttribute(
      "src",
      publicContent.projectMedia[0].image.src,
    );
    expect(document.body.textContent).not.toMatch(/WhatsApp|whatsapp|\/walter|Metalworks|24-hour/i);
    expect(publicContent.projectMedia.length).toBeGreaterThanOrEqual(18);
    expect(publicContent.navigation.some((item) => item.href.includes("thank-you"))).toBe(false);
  });
});
