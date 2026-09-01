"""Capture Prompt 6 site-chrome screenshots from the local static export."""

from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "apps" / "web" / "out"
DEST = ROOT / "project" / "visual-checks" / "prompt-06"
MEASURES = DEST / "measured.json"
INDEX = "http://127.0.0.1:4173/"


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    records: dict[str, object] = {}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        page = browser.new_page()

        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto(INDEX, wait_until="networkidle")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(
            path=str(DEST / "home-header-desktop-1440x900.png"),
            clip={"x": 0, "y": 0, "width": 1440, "height": 200},
        )
        header = page.locator("header.site-header")
        logo = page.locator(".site-logo img").first
        nav = page.locator(".desktop-nav")
        records["desktop"] = {
            "header_box": header.bounding_box(),
            "logo_box": logo.bounding_box(),
            "nav_box": nav.bounding_box(),
            "hamburger_visible": page.locator(".menu-toggle").is_visible(),
            "call_bar_visible": page.locator(".mobile-call-bar").is_visible(),
        }
        footer = page.locator("footer.site-footer")
        footer.scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "home-footer-desktop-1440x900.png"))
        records["desktop"]["footer_box"] = footer.bounding_box()

        page.set_viewport_size({"width": 768, "height": 1024})
        page.goto(INDEX, wait_until="networkidle")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(
            path=str(DEST / "home-header-tablet-768x1024-menu-closed.png"),
            clip={"x": 0, "y": 0, "width": 768, "height": 180},
        )
        records["tablet"] = {
            "header_box": header.bounding_box(),
            "hamburger_visible": page.locator(".menu-toggle").is_visible(),
            "desktop_nav_visible": page.locator(".desktop-nav").is_visible(),
            "call_bar_visible": page.locator(".mobile-call-bar").is_visible(),
        }

        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(INDEX, wait_until="networkidle")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(
            path=str(DEST / "home-header-mobile-390x844-menu-closed.png"),
            clip={"x": 0, "y": 0, "width": 390, "height": 180},
        )
        page.locator(".menu-toggle").click()
        page.screenshot(
            path=str(DEST / "home-header-mobile-390x844-menu-open.png"),
            clip={"x": 0, "y": 0, "width": 390, "height": 520},
        )
        records["mobile_open"] = {
            "header_box": header.bounding_box(),
            "panel_box": page.locator(".mobile-nav-panel").bounding_box(),
            "toggle_expanded": page.locator(".menu-toggle").get_attribute("aria-expanded"),
        }
        page.locator(".menu-toggle").click()
        page.locator("footer.site-footer").scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "home-footer-mobile-390x844.png"))
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(
            path=str(DEST / "home-call-bar-mobile-390x844.png"),
            clip={"x": 0, "y": 784, "width": 390, "height": 60},
        )
        records["mobile"] = {
            "call_bar_box": page.locator(".mobile-call-bar").bounding_box(),
            "call_bar_visible": page.locator(".mobile-call-bar").is_visible(),
            "footer_box": page.locator("footer.site-footer").bounding_box(),
        }

        html = (OUT / "index.html").read_text(encoding="utf-8")
        css_blob = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in (OUT / "_next").rglob("*.css"))
        records["export_checks"] = {
            "google_fonts": "fonts.googleapis.com" in html + css_blob or "fonts.gstatic.com" in html + css_blob,
            "whatsapp": "WhatsApp" in html or "whatsapp" in html,
            "walter": "/walter" in html,
            "metalworks": "Metalworks" in html,
            "woff_in_export": any(OUT.joinpath("_next").rglob("*.woff2")),
        }

        browser.close()

    MEASURES.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(json.dumps(records, indent=2))


if __name__ == "__main__":
    main()
