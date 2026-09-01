"""Capture Prompt 11 Thank You actions and /walter/ sign-in from the official empty-origin export."""

from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DEST10 = ROOT / "project" / "visual-checks" / "prompt-10"
DEST11 = ROOT / "project" / "visual-checks" / "prompt-11"
CONTACT = "http://127.0.0.1:4173/contact/"
THANK_YOU = "http://127.0.0.1:4173/thank-you/"
WALTER = "http://127.0.0.1:4173/walter/"


def main() -> None:
    DEST10.mkdir(parents=True, exist_ok=True)
    DEST11.mkdir(parents=True, exist_ok=True)
    records: dict[str, object] = {}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        page = browser.new_page()

        page.set_viewport_size({"width": 1440, "height": 900})
        page.goto(THANK_YOU, wait_until="networkidle")
        page.screenshot(path=str(DEST11 / "thank-you-actions-desktop-1440x900.png"), full_page=True)
        records["thank_you_actions"] = {
            "tel": page.locator(".thank-you-contacts a").first.get_attribute("href"),
            "mailto": page.locator(".thank-you-contacts a").nth(1).get_attribute("href"),
            "home": page.get_by_role("link", name="Return home").get_attribute("href"),
            "contact": page.get_by_role("link", name="Return to contact").get_attribute("href"),
            "photos": page.locator(".thank-you-photo, .thank-you-page img").count(),
            "walter_in_header": "/walter" in page.locator("header").inner_html(),
        }

        page.goto(CONTACT, wait_until="networkidle")
        page.get_by_role("textbox", name="First Name").fill("Ada")
        page.get_by_role("textbox", name="Last Name").fill("Okello")
        page.get_by_role("textbox", name="Email").fill("ada@example.com")
        page.get_by_role("textbox", name="Mobile Number").fill("+256 700 000 000")
        page.get_by_role("textbox", name="Message").fill("Please quote a warehouse frame in Jinja.")
        page.locator(".inquiry-actions button[type=submit]").click()
        page.locator(".inquiry-notice").wait_for()
        page.locator(".inquiry-notice").scroll_into_view_if_needed()
        page.screenshot(path=str(DEST10 / "contact-unavailable-desktop-1440x900.png"))
        records["contact_empty_origin"] = {
            "notice": page.locator(".inquiry-notice").inner_text(),
            "url": page.url,
            "submit_label": page.locator(".inquiry-actions button[type=submit]").inner_text(),
        }

        page.goto(WALTER, wait_until="networkidle")
        page.screenshot(path=str(DEST11 / "walter-sign-in-desktop-1440x900.png"), full_page=True)
        records["walter"] = {
            "title": page.title(),
            "h1": page.locator("h1").inner_text(),
            "email": page.get_by_label("Email").count(),
            "password": page.get_by_label("Password").count(),
            "public_nav": page.locator(".desktop-nav").count(),
        }
        page.get_by_label("Email").fill("owner@example.com")
        page.get_by_label("Password").fill("not-a-real-password")
        page.get_by_role("button", name="Sign in").click()
        page.get_by_role("status").wait_for()
        page.screenshot(path=str(DEST11 / "walter-unavailable-desktop-1440x900.png"))
        records["walter_unavailable"] = page.get_by_role("status").inner_text()
        records["password_still_in_dom"] = "not-a-real-password" in page.content()

        browser.close()

    (DEST11 / "measured.json").write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(json.dumps(records, indent=2))


if __name__ == "__main__":
    main()
