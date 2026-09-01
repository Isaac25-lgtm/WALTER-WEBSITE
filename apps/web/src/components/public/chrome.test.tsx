/** @vitest-environment jsdom */

import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteFooter } from "./SiteFooter";
import { SiteFrame } from "./SiteFrame";
import { SiteHeader } from "./SiteHeader";
import { publicContent } from "../../generated/public-content";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
    onClick?: () => void;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("public site chrome", () => {
  it("renders three primary items and home through the logo", () => {
    render(<SiteHeader />);
    const desktopLinks = [...document.querySelectorAll(".desktop-nav a")].map((node) => node.textContent);
    expect(desktopLinks).toEqual(["Services", "Portfolio", "Contact"]);
    expect(screen.getByRole("link", { name: `${publicContent.logo.alt} home` })).toHaveAttribute("href", "/");
    expect(document.body.textContent).not.toMatch(/\/walter|WhatsApp|whatsapp|Thank you/i);
  });

  it("uses a tel: header action and no social icons", () => {
    const { container } = render(
      <>
        <SiteHeader />
        <SiteFooter />
      </>,
    );
    expect(container.querySelector(".header-phone")).toHaveAttribute("href", publicContent.contacts.primaryPhoneHref);
    expect(publicContent.contacts.primaryPhoneHref.startsWith("tel:")).toBe(true);
    expect(publicContent.socialLinks).toEqual([]);
    expect(container.querySelectorAll("[data-social], .social, .site-footer__social")).toHaveLength(0);
    expect(container.textContent).toContain(publicContent.identity.legalFooterName);
    expect(container.textContent).toContain("Plot 23A, Lubas Road, Jinja, Uganda");
    expect(container.textContent).toContain("Tanzania branch: P.O. Box 551, Dodoma, Tanzania");
    expect(container.textContent).not.toMatch(/headquarters/i);
    expect(container.textContent).not.toMatch(/Metalworks|Privacy|Terms|Blog/);
  });

  it("toggles the mobile menu, closes on link click and Escape, and restores focus", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    const panel = document.querySelector(".mobile-nav-panel");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("hidden");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-label", "Close menu");
    expect(panel).not.toHaveAttribute("hidden");

    await user.click(panel!.querySelector("a")!);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("hidden");

    await user.click(toggle);
    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("points the skip link at the main landmark", () => {
    render(
      <SiteFrame>
        <p>Page</p>
      </SiteFrame>,
    );
    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main-content");
    expect(document.getElementById("main-content")?.tagName).toBe("MAIN");
  });
});
