"""Capture Prompt 12 /walter/ at 1440, 768, and 390 from the official empty-origin export."""

from __future__ import annotations

import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "apps" / "web" / "out"
DEST11 = ROOT / "project" / "visual-checks" / "prompt-11"
DEST12 = ROOT / "project" / "visual-checks" / "prompt-12"
WALTER = "http://127.0.0.1:4173/walter/"
THANK_YOU = "http://127.0.0.1:4173/thank-you/"
VIEWPORTS = ((1440, 900), (768, 1024), (390, 844))


def main() -> None:
    DEST11.mkdir(parents=True, exist_ok=True)
    DEST12.mkdir(parents=True, exist_ok=True)
    if not OUT.exists():
        raise SystemExit("official static export is missing; run npm.cmd run build:web first")

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(OUT), **kwargs)

        def log_message(self, format, *args):  # noqa: A003
            return

    server = ThreadingHTTPServer(("127.0.0.1", 4173), Handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    records: dict[str, object] = {}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        page = browser.new_page()
        for width, height in VIEWPORTS:
            page.set_viewport_size({"width": width, "height": height})
            suffix = f"{width}x{height}"

            page.goto(THANK_YOU, wait_until="networkidle")
            page.screenshot(path=str(DEST11 / f"thank-you-{suffix}.png"), full_page=True)
            page.screenshot(path=str(DEST12 / f"thank-you-{suffix}.png"), full_page=True)

            page.goto(WALTER, wait_until="networkidle")
            page.get_by_label("Email").wait_for()
            page.screenshot(path=str(DEST11 / f"walter-sign-in-{suffix}.png"), full_page=True)
            page.screenshot(path=str(DEST12 / f"walter-sign-in-{suffix}.png"), full_page=True)
            records[f"walter_{suffix}"] = {
                "title": page.title(),
                "h1": page.locator("h1").inner_text(),
                "public_nav": page.locator(".desktop-nav").count(),
                "restoring": page.get_by_text("Checking your session").count(),
            }
            page.get_by_label("Email").wait_for()
            page.get_by_label("Email").fill("owner@example.com")
            page.get_by_label("Password").fill("not-a-real-password")
            page.get_by_role("button", name="Sign in").click()
            page.get_by_role("status").wait_for()
            page.screenshot(path=str(DEST12 / f"walter-unavailable-{suffix}.png"), full_page=True)
            records[f"walter_unavailable_{suffix}"] = page.get_by_role("status").inner_text()
            records[f"password_in_dom_{suffix}"] = "not-a-real-password" in page.content()
            records[f"walter_in_header_{suffix}"] = "/walter" in page.locator("body").inner_html() and page.locator("header").count() > 0

        browser.close()

    server.shutdown()
    (DEST12 / "measured.json").write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(json.dumps(records, indent=2))


if __name__ == "__main__":
    main()
