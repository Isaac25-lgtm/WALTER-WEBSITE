"""Capture Prompt 10 Thank You page and Contact submission-state screenshots."""

from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "project" / "visual-checks" / "prompt-10"
MEASURES = DEST / "measured.json"
CONTACT = "http://127.0.0.1:4173/contact/"
THANK_YOU = "http://127.0.0.1:4173/thank-you/"


def box(locator):
    return locator.bounding_box()


def css(locator, props):
    return locator.evaluate(
        """(el, keys) => {
          const s = getComputedStyle(el);
          const out = {};
          for (const key of keys) out[key] = s[key];
          return out;
        }""",
        props,
    )


def viewport_rect(locator):
    return locator.evaluate("el => el.getBoundingClientRect().toJSON()")


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    records: dict[str, object] = {}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        page = browser.new_page()

        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto(THANK_YOU, wait_until="networkidle")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(DEST / "thank-you-full-desktop-1440x900.png"), full_page=True)
        page.screenshot(path=str(DEST / "thank-you-heading-desktop-1440x900.png"), clip={"x": 0, "y": 0, "width": 1440, "height": 420})
        h1 = page.locator(".thank-you-page h1")
        records["thank_you_desktop"] = {
            "h1_box": box(h1),
            "h1_css": css(h1, ["fontSize", "lineHeight", "fontWeight", "textAlign", "color"]),
            "supporting_css": css(page.locator(".thank-you-supporting"), ["textAlign", "fontSize", "color"]),
            "other_work_css": css(page.locator(".thank-you-other-work"), ["textAlign", "fontSize"]),
            "photo_count": page.locator(".thank-you-photo, .thank-you-page img").count(),
            "nav_items": page.locator(".desktop-nav a").all_inner_texts(),
            "overflow_x": page.evaluate("document.documentElement.scrollWidth"),
            "scroll_height": page.evaluate("document.documentElement.scrollHeight"),
            "call_bar_visible": page.locator(".mobile-call-bar").is_visible(),
            "whatsapp": "WhatsApp" in page.content() or "whatsapp" in page.content(),
            "walter": "/walter" in page.content(),
            "metalworks": "Metalworks" in page.content(),
            "title": page.title(),
        }

        page.set_viewport_size({"width": 768, "height": 1024})
        page.goto(THANK_YOU, wait_until="networkidle")
        page.screenshot(path=str(DEST / "thank-you-full-tablet-768x1024.png"), full_page=True)
        records["thank_you_tablet"] = {
            "h1_css": css(page.locator(".thank-you-page h1"), ["fontSize", "lineHeight", "textAlign"]),
            "photo_count": page.locator(".thank-you-photo, .thank-you-page img").count(),
            "hamburger_visible": page.locator(".menu-toggle").is_visible(),
            "overflow_x": page.evaluate("document.documentElement.scrollWidth"),
            "scroll_height": page.evaluate("document.documentElement.scrollHeight"),
        }

        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(THANK_YOU, wait_until="networkidle")
        page.screenshot(path=str(DEST / "thank-you-full-mobile-390x844.png"), full_page=True)
        page.screenshot(
            path=str(DEST / "thank-you-call-bar-mobile-390x844.png"),
            clip={"x": 0, "y": 784, "width": 390, "height": 60},
        )
        records["thank_you_mobile"] = {
            "h1_css": css(page.locator(".thank-you-page h1"), ["fontSize", "lineHeight", "textAlign"]),
            "photo_count": page.locator(".thank-you-photo, .thank-you-page img").count(),
            "call_bar_box": box(page.locator(".mobile-call-bar")),
            "overflow_x": page.evaluate("document.documentElement.scrollWidth"),
            "scroll_height": page.evaluate("document.documentElement.scrollHeight"),
        }

        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto(CONTACT, wait_until="networkidle")
        page.screenshot(path=str(DEST / "contact-full-desktop-1440x900.png"), full_page=True)
        page.get_by_role("textbox", name="First Name").fill("Ada")
        page.get_by_role("textbox", name="Last Name").fill("Okello")
        page.get_by_role("textbox", name="Email").fill("ada@example.com")
        page.get_by_role("textbox", name="Mobile Number").fill("+256 700 000 000")
        page.get_by_role("textbox", name="Message").fill("Please quote a warehouse frame in Jinja.")
        page.locator(".inquiry-actions button[type=submit]").click()
        page.locator(".inquiry-notice").wait_for()
        page.locator(".inquiry-notice").scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "contact-unavailable-desktop-1440x900.png"))
        records["contact_desktop"] = {
            "url_after_valid": page.url,
            "unavailable_text": page.locator(".inquiry-notice").inner_text(),
            "fetch_to_inquiries": page.evaluate(
                "() => performance.getEntriesByType('resource').some(e => String(e.name).includes('/inquiries'))"
            ),
        }

        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(CONTACT, wait_until="networkidle")
        page.screenshot(path=str(DEST / "contact-full-mobile-390x844.png"), full_page=True)
        page.get_by_role("button", name="Submit").click()
        page.locator(".inquiry-summary").wait_for()
        page.locator(".inquiry-summary").scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "contact-mobile-validation-390x844.png"))

        browser.close()

    MEASURES.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(json.dumps(records, indent=2))


if __name__ == "__main__":
    main()
