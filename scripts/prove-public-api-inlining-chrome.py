"""Intercept a Contact submit against a temporary static export inlined with https://api.example.test."""

from __future__ import annotations

import json
import sys
import traceback
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "apps" / ".tmp-inlining-proof" / "out"
DEST = ROOT / "project" / "visual-checks" / "prompt-12"
SENTINEL = "https://api.example.test/inquiries"


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    if not OUT.exists():
        raise SystemExit(f"missing temporary export: {OUT}")

    try:
        from playwright.sync_api import sync_playwright
    except Exception as error:
        raise SystemExit(f"playwright import failed: {error}") from error

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(OUT), **kwargs)

        def log_message(self, format, *args):  # noqa: A003
            return

    server = ThreadingHTTPServer(("127.0.0.1", 4175), Handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()

    requested: list[dict[str, str]] = []
    notice = ""
    try:
        with sync_playwright() as playwright:
            try:
                browser = playwright.chromium.launch(channel="chrome")
            except Exception:
                browser = playwright.chromium.launch()
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            page.on("request", lambda request: requested.append({"url": request.url, "method": request.method}))
            page.route(
                "https://api.example.test/**",
                lambda route: route.fulfill(
                    status=503,
                    content_type="application/json",
                    body=json.dumps({"error": {"code": "service_unavailable", "message": "Service unavailable"}}),
                ),
            )
            page.goto("http://127.0.0.1:4175/contact/", wait_until="domcontentloaded", timeout=60_000)
            page.locator('input[name="firstName"]').fill("Ada")
            page.locator('input[name="lastName"]').fill("Okello")
            page.locator('input[name="email"]').fill("ada@example.com")
            page.locator('input[name="phone"]').fill("+256 700 000 000")
            page.locator('textarea[name="message"]').fill("Please quote a warehouse frame in Jinja.")
            page.locator(".inquiry-actions button[type=submit]").click()
            page.locator(".inquiry-notice").wait_for(timeout=30_000)
            notice = page.locator(".inquiry-notice").inner_text()
            page.screenshot(path=str(DEST / "contact-sentinel-origin-desktop-1440x900.png"), full_page=True)
            browser.close()
    except Exception:
        traceback.print_exc()
        server.shutdown()
        raise
    server.shutdown()

    inquiry_requests = [
        item
        for item in requested
        if "api.example.test" in item["url"]
    ]
    payload = {
        "notice": notice,
        "inquiryRequests": inquiry_requests,
        "hitExactInquiries": any(item["url"].rstrip("/") == SENTINEL for item in inquiry_requests),
        "allRequested": requested[:40],
    }
    (DEST / "inlining-intercept.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps(payload, indent=2))
    if not payload["hitExactInquiries"]:
        raise SystemExit("Contact submission did not request https://api.example.test/inquiries")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        traceback.print_exc()
        sys.exit(1)
