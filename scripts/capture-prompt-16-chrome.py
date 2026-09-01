"""Capture Prompt 16 /walter/ and fixture-driven inbox/content/publication layouts."""

from __future__ import annotations

import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "apps" / "web" / "out"
CSS = ROOT / "apps" / "web" / "src" / "styles" / "walter.css"
FIXTURES = ROOT / "project" / "visual-checks" / "prompt-16" / "fixtures"
DEST = ROOT / "project" / "visual-checks" / "prompt-16"
VIEWPORTS = ((1440, 900), (768, 1024), (390, 844))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(OUT), **kwargs)

    def log_message(self, format, *args):  # noqa: A003
        return

    def do_GET(self):  # noqa: N802
        if self.path == "/walter.css":
            data = CSS.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/css; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        if self.path.startswith("/fixtures/"):
            name = self.path.removeprefix("/fixtures/").split("?", 1)[0]
            target = (FIXTURES / name).resolve()
            if not str(target).startswith(str(FIXTURES.resolve())) or not target.is_file():
                self.send_error(404)
                return
            data = target.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        return super().do_GET()


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    if not OUT.exists():
        raise SystemExit("official static export is missing; run npm.cmd run build:web first")

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

            page.goto("http://127.0.0.1:4173/walter/", wait_until="networkidle")
            page.get_by_label("Email").wait_for()
            page.screenshot(path=str(DEST / f"walter-sign-in-{suffix}.png"), full_page=True)
            records[f"walter_{suffix}"] = {
                "title": page.title(),
                "h1": page.locator("h1").inner_text(),
                "skip": page.locator(".walter-skip-link").count(),
            }

            page.goto("http://127.0.0.1:4173/fixtures/inbox.html", wait_until="networkidle")
            page.screenshot(path=str(DEST / f"inbox-{suffix}.png"), full_page=True)
            records[f"inbox_{suffix}"] = {
                "h2": page.locator("h2").inner_text(),
                "mailto": page.locator('a[href^="mailto:"]').count(),
                "tel": page.locator('a[href^="tel:"]').count(),
                "publication_nav": page.get_by_role("button", name="Publication").count(),
            }

            page.goto("http://127.0.0.1:4173/fixtures/content.html", wait_until="networkidle")
            page.screenshot(path=str(DEST / f"content-{suffix}.png"), full_page=True)
            records[f"content_{suffix}"] = {
                "h2": page.locator("h2").inner_text(),
                "preview": page.get_by_text("This preview is local only").count(),
                "saved": page.get_by_text("Draft saved. The public website has not changed.").count(),
                "version": page.get_by_text("version 1").count(),
            }

            page.goto("http://127.0.0.1:4173/fixtures/publication.html", wait_until="networkidle")
            page.screenshot(path=str(DEST / f"publication-{suffix}.png"), full_page=True)
            records[f"publication_{suffix}"] = {
                "h2": page.locator("h2").inner_text(),
                "prepare": page.get_by_text("Prepare publication").count(),
                "draft_heading": page.get_by_text("Local draft heading").count(),
                "canonical_contact": page.get_by_text("Contact Us", exact=True).count(),
                "subject_leak": page.get_by_text("admin-subject").count(),
            }

        browser.close()

    server.shutdown()
    (DEST / "measured.json").write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(json.dumps(records, indent=2))


if __name__ == "__main__":
    main()
