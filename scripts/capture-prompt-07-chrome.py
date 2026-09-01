"""Capture Prompt 7 homepage and chrome-correction screenshots."""

from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "apps" / "web" / "out"
DEST = ROOT / "project" / "visual-checks" / "prompt-07"
MEASURES = DEST / "measured.json"
INDEX = "http://127.0.0.1:4173/"


def box(locator):
    return locator.bounding_box()


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    records: dict[str, object] = {}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        page = browser.new_page()

        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto(INDEX, wait_until="networkidle")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(DEST / "home-full-desktop-1440x900.png"), full_page=True)
        page.screenshot(
            path=str(DEST / "home-header-desktop-1440x900.png"),
            clip={"x": 0, "y": 0, "width": 1440, "height": 200},
        )
        hero = page.locator("section.hero")
        header = page.locator("header.site-header")
        logo = page.locator("header .site-logo img").first
        phone = page.locator(".header-phone")
        header_row = page.locator("header .container--header")
        records["desktop"] = {
            "header_box": box(header),
            "header_row_box": box(header_row),
            "logo_box": box(logo),
            "phone_box": box(phone),
            "hero_box": box(hero),
            "hero_font_size": page.locator(".hero h1").evaluate("el => getComputedStyle(el).fontSize"),
            "cta_box": box(page.locator(".hero .cta")),
            "overflow_x": page.evaluate("document.documentElement.scrollWidth"),
            "scroll_height": page.evaluate("document.documentElement.scrollHeight"),
            "hamburger_visible": page.locator(".menu-toggle").is_visible(),
            "call_bar_visible": page.locator(".mobile-call-bar").is_visible(),
            "mosaic": page.locator(".project-mosaic").count(),
            "latest_work": page.locator(".latest-work").count(),
            "client_brands": page.locator(".client-brands").count(),
            "service_count": page.locator(".service-card").count(),
        }
        page.screenshot(
            path=str(DEST / "home-hero-desktop-1440x900.png"),
            clip={"x": 0, "y": 0, "width": 1440, "height": 640},
        )
        services = page.locator("#what-we-do")
        services.scroll_into_view_if_needed()
        page.evaluate("window.scrollTo(0, 0)")
        services_top = page.locator("#what-we-do").evaluate("el => el.getBoundingClientRect().top + window.scrollY")
        page.evaluate(f"window.scrollTo(0, {max(services_top - 20, 0)})")
        page.screenshot(path=str(DEST / "home-services-desktop-1440x900.png"))
        records["desktop"]["services_box"] = box(services)

        about = page.locator(".about-section")
        about.scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "home-about-desktop-1440x900.png"))
        records["desktop"]["about_box"] = box(about)

        cta = page.locator(".closing-cta")
        cta.scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "home-closing-cta-desktop-1440x900.png"))
        records["desktop"]["closing_cta_box"] = box(cta)

        footer = page.locator("footer.site-footer")
        footer.scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "home-footer-desktop-1440x900.png"))
        records["desktop"]["footer_box"] = box(footer)
        records["desktop"]["footer_text"] = footer.inner_text()

        page.set_viewport_size({"width": 768, "height": 1024})
        page.goto(INDEX, wait_until="networkidle")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(DEST / "home-full-tablet-768x1024.png"), full_page=True)
        page.screenshot(path=str(DEST / "home-tablet-768x1024.png"))
        records["tablet"] = {
            "header_box": box(page.locator("header.site-header")),
            "hero_box": box(page.locator("section.hero")),
            "hero_font_size": page.locator(".hero h1").evaluate("el => getComputedStyle(el).fontSize"),
            "hamburger_visible": page.locator(".menu-toggle").is_visible(),
            "desktop_nav_visible": page.locator(".desktop-nav").is_visible(),
            "call_bar_visible": page.locator(".mobile-call-bar").is_visible(),
            "overflow_x": page.evaluate("document.documentElement.scrollWidth"),
            "service_columns": page.locator(".service-grid").evaluate("el => getComputedStyle(el).gridTemplateColumns"),
        }

        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(INDEX, wait_until="networkidle")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(DEST / "home-full-mobile-390x844.png"), full_page=True)
        page.screenshot(path=str(DEST / "home-mobile-390x844.png"))
        page.locator(".menu-toggle").click()
        page.screenshot(
            path=str(DEST / "home-mobile-menu-open-390x844.png"),
            clip={"x": 0, "y": 0, "width": 390, "height": 520},
        )
        records["mobile_open"] = {
            "panel_box": box(page.locator(".mobile-nav-panel")),
            "toggle_expanded": page.locator(".menu-toggle").get_attribute("aria-expanded"),
        }
        page.locator(".menu-toggle").click()
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(
            path=str(DEST / "home-call-bar-mobile-390x844.png"),
            clip={"x": 0, "y": 784, "width": 390, "height": 60},
        )
        records["mobile"] = {
            "header_box": box(page.locator("header.site-header")),
            "hero_box": box(page.locator("section.hero")),
            "hero_font_size": page.locator(".hero h1").evaluate("el => getComputedStyle(el).fontSize"),
            "call_bar_box": box(page.locator(".mobile-call-bar")),
            "call_bar_visible": page.locator(".mobile-call-bar").is_visible(),
            "overflow_x": page.evaluate("document.documentElement.scrollWidth"),
            "footer_box": box(page.locator("footer.site-footer")),
        }

        html = (OUT / "index.html").read_text(encoding="utf-8")
        css_blob = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in (OUT / "_next").rglob("*.css"))
        records["export_checks"] = {
            "google_fonts": "fonts.googleapis.com" in html + css_blob or "fonts.gstatic.com" in html + css_blob,
            "whatsapp": "WhatsApp" in html or "whatsapp" in html,
            "walter": "/walter" in html,
            "metalworks": "Metalworks" in html,
            "context_assets": "context/assets" in html,
            "woff_in_export": any(OUT.joinpath("_next").rglob("*.woff2")),
        }

        browser.close()

    MEASURES.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(json.dumps(records, indent=2))


if __name__ == "__main__":
    main()
