"""Capture Prompt 9 Contact-page correction screenshots and geometry."""

from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "project" / "visual-checks" / "prompt-09"
MEASURES = DEST / "measured.json"
CONTACT = "http://127.0.0.1:4173/contact/"


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
        page.goto(CONTACT, wait_until="networkidle")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(DEST / "contact-full-desktop-1440x900.png"), full_page=True)
        page.screenshot(
            path=str(DEST / "contact-heading-intro-desktop-1440x900.png"),
            clip={"x": 0, "y": 0, "width": 1440, "height": 360},
        )

        card = page.locator(".inquiry-card")
        h1 = page.locator(".contact-intro h1")
        container = page.locator(".contact-page .container")
        submit = page.locator(".inquiry-actions button[type=submit]")
        message = page.locator("textarea")
        first_name = page.get_by_label("First Name")
        grid = page.locator(".inquiry-grid")

        records["desktop"] = {
            "header_box": box(page.locator("header.site-header")),
            "h1_box": box(h1),
            "h1_css": css(h1, ["fontSize", "lineHeight", "fontWeight", "textAlign", "color"]),
            "intro_css": css(page.locator(".contact-intro"), ["textAlign"]),
            "intro_p_css": css(page.locator(".contact-intro p").first, ["textAlign", "maxWidth"]),
            "container_box": box(container),
            "intro_box": box(page.locator(".contact-intro")),
            "card_box": box(card),
            "card_css": css(card, ["borderRadius", "padding", "backgroundColor"]),
            "grid_columns": grid.evaluate("el => getComputedStyle(el).gridTemplateColumns"),
            "grid_gap": css(grid, ["columnGap", "rowGap"]),
            "first_name_box": box(first_name),
            "first_name_css": css(first_name, ["height", "backgroundColor", "borderRadius"]),
            "message_box": box(message),
            "message_css": css(message, ["height", "resize"]),
            "submit_box": box(submit),
            "submit_css": css(submit, ["width", "height", "borderRadius", "fontSize", "lineHeight", "fontFamily"]),
            "page_padding": css(page.locator(".contact-page"), ["paddingTop", "paddingBottom", "backgroundColor"]),
            "map_count": page.locator(".approved-map, iframe").count(),
            "overflow_x": page.evaluate("document.documentElement.scrollWidth"),
            "scroll_height": page.evaluate("document.documentElement.scrollHeight"),
            "call_bar_visible": page.locator(".mobile-call-bar").is_visible(),
            "whatsapp": "WhatsApp" in page.content() or "whatsapp" in page.content(),
            "walter": "/walter" in page.content(),
            "metalworks": "Metalworks" in page.content(),
        }
        container_box = records["desktop"]["container_box"]
        card_box = records["desktop"]["card_box"]
        intro_box = records["desktop"]["intro_box"]
        records["desktop"]["card_left_offset"] = card_box["x"] - container_box["x"]
        records["desktop"]["card_right_offset"] = (container_box["x"] + container_box["width"]) - (
            card_box["x"] + card_box["width"]
        )
        records["desktop"]["intro_to_card_gap"] = card_box["y"] - (intro_box["y"] + intro_box["height"])
        records["desktop"]["places_visible"] = page.locator(".contact-intro__places").count()

        card.scroll_into_view_if_needed()
        card_top = page.evaluate(
            "() => document.querySelector('.inquiry-card').getBoundingClientRect().top + window.scrollY"
        )
        page.evaluate(f"window.scrollTo(0, {max(card_top - 20, 0)})")
        page.screenshot(path=str(DEST / "contact-form-top-desktop-1440x900.png"))

        submit.scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "contact-form-lower-desktop-1440x900.png"))
        records["desktop"]["submit_box_scrolled"] = box(submit)

        footer = page.locator("footer.site-footer")
        footer.scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "contact-footer-desktop-1440x900.png"))
        records["desktop"]["footer_box"] = box(footer)
        records["desktop"]["footer_text"] = footer.inner_text()

        page.get_by_role("textbox", name="First Name").fill("Ada")
        page.get_by_role("textbox", name="Last Name").fill("Okello")
        page.get_by_role("textbox", name="Email").fill("ada@example.com")
        page.get_by_role("textbox", name="Mobile Number").fill("+256 700 000 000")
        page.get_by_role("textbox", name="Message").fill("Please quote a warehouse frame in Jinja.")
        submit.click()
        page.locator(".inquiry-notice").wait_for()
        page.locator(".inquiry-notice").scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "contact-unavailable-desktop-1440x900.png"))
        records["desktop"]["unavailable_text"] = page.locator(".inquiry-notice").inner_text()
        records["desktop"]["unavailable_success_words"] = any(
            word in page.locator(".inquiry-notice").inner_text().lower()
            for word in ("sent", "submitted", "saved", "received", "successful")
        )
        records["desktop"]["url_after_valid"] = page.url

        page.set_viewport_size({"width": 768, "height": 1024})
        page.goto(CONTACT, wait_until="networkidle")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(DEST / "contact-full-tablet-768x1024.png"), full_page=True)
        page.screenshot(path=str(DEST / "contact-tablet-768x1024.png"))
        records["tablet"] = {
            "h1_css": css(page.locator(".contact-intro h1"), ["fontSize", "lineHeight", "textAlign"]),
            "container_box": box(page.locator(".contact-page .container")),
            "card_box": box(page.locator(".inquiry-card")),
            "grid_columns": page.locator(".inquiry-grid").evaluate("el => getComputedStyle(el).gridTemplateColumns"),
            "overflow_x": page.evaluate("document.documentElement.scrollWidth"),
            "scroll_height": page.evaluate("document.documentElement.scrollHeight"),
            "call_bar_visible": page.locator(".mobile-call-bar").is_visible(),
            "hamburger_visible": page.locator(".menu-toggle").is_visible(),
            "map_count": page.locator(".approved-map, iframe").count(),
        }

        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(CONTACT, wait_until="networkidle")
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(DEST / "contact-full-mobile-390x844.png"), full_page=True)
        page.screenshot(path=str(DEST / "contact-mobile-form-390x844.png"))
        page.screenshot(
            path=str(DEST / "contact-call-bar-mobile-390x844.png"),
            clip={"x": 0, "y": 784, "width": 390, "height": 60},
        )
        records["mobile"] = {
            "h1_css": css(page.locator(".contact-intro h1"), ["fontSize", "lineHeight"]),
            "container_box": box(page.locator(".contact-page .container")),
            "card_box": box(page.locator(".inquiry-card")),
            "grid_columns": page.locator(".inquiry-grid").evaluate("el => getComputedStyle(el).gridTemplateColumns"),
            "call_bar_box": box(page.locator(".mobile-call-bar")),
            "call_bar_viewport": viewport_rect(page.locator(".mobile-call-bar")),
            "call_bar_visible": page.locator(".mobile-call-bar").is_visible(),
            "overflow_x": page.evaluate("document.documentElement.scrollWidth"),
            "scroll_height": page.evaluate("document.documentElement.scrollHeight"),
            "map_count": page.locator(".approved-map, iframe").count(),
        }

        submit_m = page.locator(".inquiry-actions button[type=submit]")
        submit_m.scroll_into_view_if_needed()
        file_hint = page.locator(".form-field__hint")
        file_hint.scroll_into_view_if_needed()
        records["mobile"]["submit_viewport"] = viewport_rect(submit_m)
        records["mobile"]["hint_viewport"] = viewport_rect(file_hint)
        bar_y = records["mobile"]["call_bar_viewport"]["y"]
        submit_bottom = records["mobile"]["submit_viewport"]["y"] + records["mobile"]["submit_viewport"]["height"]
        hint_bottom = records["mobile"]["hint_viewport"]["y"] + records["mobile"]["hint_viewport"]["height"]
        records["mobile"]["submit_call_bar_clearance"] = bar_y - submit_bottom
        records["mobile"]["hint_call_bar_clearance"] = bar_y - hint_bottom

        page.evaluate("window.scrollTo(0, 0)")
        page.get_by_role("button", name="Submit").click()
        page.locator(".inquiry-summary").wait_for()
        page.locator(".inquiry-summary").scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "contact-mobile-validation-390x844.png"))
        records["mobile"]["validation_summary"] = page.locator(".inquiry-summary").inner_text()

        page.goto(CONTACT, wait_until="networkidle")
        page.get_by_role("textbox", name="First Name").fill("Ada")
        page.get_by_role("textbox", name="Last Name").fill("Okello")
        page.get_by_role("textbox", name="Email").fill("ada@example.com")
        page.get_by_role("textbox", name="Mobile Number").fill("+256 700 000 000")
        page.get_by_role("textbox", name="Message").fill("Please quote a warehouse frame in Jinja.")
        page.get_by_role("button", name="Submit").click()
        page.locator(".inquiry-notice").wait_for()
        page.locator(".inquiry-notice").scroll_into_view_if_needed()
        page.screenshot(path=str(DEST / "contact-unavailable-mobile-390x844.png"))
        records["mobile"]["unavailable_text"] = page.locator(".inquiry-notice").inner_text()
        records["mobile"]["url_after_valid"] = page.url
        records["mobile"]["notice_viewport"] = viewport_rect(page.locator(".inquiry-notice"))
        records["mobile"]["notice_call_bar_clearance"] = (
            viewport_rect(page.locator(".mobile-call-bar"))["y"]
            - (records["mobile"]["notice_viewport"]["y"] + records["mobile"]["notice_viewport"]["height"])
        )

        browser.close()

    MEASURES.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(json.dumps(records, indent=2))


if __name__ == "__main__":
    main()
