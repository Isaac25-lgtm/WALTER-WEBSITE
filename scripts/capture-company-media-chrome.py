"""Capture the public homepage and portfolio after company-media curation."""

from __future__ import annotations

import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "apps" / "web" / "out"
DEST = ROOT / "project" / "visual-checks" / "company-media"
VIEWPORTS = ((1440, 900), (768, 1024), (390, 844))
ROUTES = (("home", "/"), ("portfolio", "/portfolio/"))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(OUT), **kwargs)

    def log_message(self, format, *args):  # noqa: A003
        return


def main() -> None:
    if not OUT.exists():
        raise SystemExit("static export is missing")
    DEST.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", 4175), Handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    results: dict[str, object] = {}

    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(channel="chrome")
            page = browser.new_page()
            for width, height in VIEWPORTS:
                page.set_viewport_size({"width": width, "height": height})
                for name, route in ROUTES:
                    page.goto(f"http://127.0.0.1:4175{route}", wait_until="networkidle")
                    page.evaluate(
                        """async () => {
                          for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
                            window.scrollTo(0, y);
                            await new Promise(resolve => setTimeout(resolve, 35));
                          }
                          window.scrollTo(0, 0);
                          await new Promise(resolve => setTimeout(resolve, 200));
                        }"""
                    )
                    key = f"{name}-{width}x{height}"
                    # Very tall mobile galleries can exceed Chrome's practical full-page capture limit.
                    page.screenshot(path=str(DEST / f"{key}.png"), full_page=width > 390)
                    results[key] = page.evaluate(
                        """() => ({
                          title: document.title,
                          h1: document.querySelector('h1')?.textContent?.trim(),
                          images: document.querySelectorAll('main img').length,
                          brokenImages: [...document.querySelectorAll('main img')]
                            .filter(image => !image.complete || image.naturalWidth === 0)
                            .map(image => image.getAttribute('src')),
                          clientWidth: document.documentElement.clientWidth,
                          scrollWidth: document.documentElement.scrollWidth,
                          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
                          scrollHeight: document.documentElement.scrollHeight,
                        })"""
                    )
            browser.close()
    finally:
        server.shutdown()

    (DEST / "measurements.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
