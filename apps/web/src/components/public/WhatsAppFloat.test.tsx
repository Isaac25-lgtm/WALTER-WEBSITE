/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { publicContent } from "../../generated/public-content";
import { SiteFrame } from "./SiteFrame";
import { WhatsAppFloat } from "./WhatsAppFloat";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

const EXPECTED_URL = `https://wa.me/256782318727?text=${encodeURIComponent(
  "Hello Active Technical Services, I would like to make an enquiry about your services.",
)}`;

describe("WhatsApp floater", () => {
  it("points at the approved Uganda primary line with a prefilled message", () => {
    render(<WhatsAppFloat />);
    const link = screen.getByRole("link", { name: "Chat with Active Technical Services on WhatsApp" });
    expect(link).toHaveAttribute("href", EXPECTED_URL);
    expect(link.getAttribute("href")).toContain("256782318727");
    expect(publicContent.contacts.whatsapp.number).toBe("256782318727");
  });

  it("opens in a new tab with safe external-link attributes", () => {
    render(<WhatsAppFloat />);
    const link = screen.getByRole("link", { name: "Chat with Active Technical Services on WhatsApp" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("carries an accessible name and a visible WhatsApp label", () => {
    const { container } = render(<WhatsAppFloat />);
    expect(screen.getByRole("link")).toHaveAccessibleName(
      "Chat with Active Technical Services on WhatsApp",
    );
    expect(container.querySelector(".whatsapp-float__label")?.textContent).toBe("WhatsApp");
    expect(container.querySelector(".whatsapp-float__icon svg")).not.toBeNull();
  });

  it("is rendered by the shared frame, so it appears on every public page", () => {
    const { container } = render(
      <SiteFrame>
        <p>page body</p>
      </SiteFrame>,
    );
    const floaters = container.querySelectorAll(".whatsapp-float");
    expect(floaters).toHaveLength(1);
    expect(floaters[0]).toHaveAttribute("href", EXPECTED_URL);
  });

  it("sits after the mobile call bar in the frame so it can be stacked above it", () => {
    const { container } = render(
      <SiteFrame>
        <p>page body</p>
      </SiteFrame>,
    );
    const callBar = container.querySelector(".mobile-call-bar");
    const floater = container.querySelector(".whatsapp-float");
    if (!callBar || !floater) throw new Error("call bar and WhatsApp floater must both render");
    const relation = callBar.compareDocumentPosition(floater);
    expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
