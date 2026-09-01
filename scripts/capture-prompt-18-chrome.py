"""Capture Prompt 18 production-component /walter-visual states in Chrome."""

from __future__ import annotations

import json
import re
import struct
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "apps" / "web" / "out"
DEST = ROOT / "project" / "visual-checks" / "prompt-18"
VIEWPORTS = ((1440, 900), (768, 1024), (390, 844))
STATES = (
    "inbox-populated",
    "inquiry-detail",
    "status-saving",
    "load-more",
    "saved-draft",
    "unsaved-draft",
    "version-conflict",
    "reload-server-draft",
    "session-expired",
    "forbidden",
    "storage-unavailable",
    "signing-out",
    "publication-selection",
    "preparing-publication",
    "prepared-publication",
    "publication-pagination",
)


def png_dimensions(path: Path) -> tuple[int, int]:
    with path.open("rb") as handle:
        signature = handle.read(24)
    if len(signature) != 24 or signature[:8] != b"\x89PNG\r\n\x1a\n" or signature[12:16] != b"IHDR":
        raise ValueError(f"not a PNG with an IHDR header: {path}")
    return struct.unpack(">II", signature[16:24])


def audit_existing_captures() -> None:
    records = []
    for image in sorted(DEST.glob("*.png")):
        match = re.fullmatch(r"(.+)-(1440x900|768x1024|390x844)\.png", image.name)
        if not match:
            continue
        state, viewport = match.groups()
        viewport_width, viewport_height = (int(value) for value in viewport.split("x"))
        image_width, image_height = png_dimensions(image)
        records.append(
            {
                "file": image.name,
                "state": state,
                "viewport": {"width": viewport_width, "height": viewport_height},
                "image": {"width": image_width, "height": image_height},
                "widthMatchesViewport": image_width == viewport_width,
                "coversViewportHeight": image_height >= viewport_height,
            }
        )
    expected = len(STATES) * len(VIEWPORTS)
    if len(records) != expected:
        raise SystemExit(f"expected {expected} captures, found {len(records)}")
    if not all(record["widthMatchesViewport"] and record["coversViewportHeight"] for record in records):
        raise SystemExit("one or more captures do not cover the declared viewport")
    target = DEST / "screenshot-dimensions.json"
    target.write_text(json.dumps({"count": len(records), "captures": records}, indent=2), encoding="utf-8")
    print(f"audited {len(records)} captures -> {target}")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(OUT), **kwargs)

    def log_message(self, format, *args):  # noqa: A003
        return


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    if not OUT.exists():
        raise SystemExit("static export is missing; build the visual route first")
    sample = OUT / "walter-visual" / "inbox-populated" / "index.html"
    if not sample.exists():
        raise SystemExit("visual route is missing from the export")

    server = ThreadingHTTPServer(("127.0.0.1", 4174), Handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    records: dict[str, object] = {}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        page = browser.new_page()
        for width, height in VIEWPORTS:
            page.set_viewport_size({"width": width, "height": height})
            suffix = f"{width}x{height}"
            for state in STATES:
                page.goto(f"http://127.0.0.1:4174/walter-visual/{state}/", wait_until="networkidle")
                screenshot = DEST / f"{state}-{suffix}.png"
                layout = page.evaluate(
                    """() => {
                      const root = document.documentElement;
                      const main = document.querySelector('main');
                      const rect = main?.getBoundingClientRect();
                      return {
                        clientWidth: root.clientWidth,
                        clientHeight: root.clientHeight,
                        scrollWidth: root.scrollWidth,
                        scrollHeight: root.scrollHeight,
                        horizontalOverflow: root.scrollWidth > root.clientWidth,
                        main: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null,
                      };
                    }"""
                )
                page.screenshot(path=str(screenshot), full_page=True)
                image_width, image_height = png_dimensions(screenshot)
                records[f"{state}_{suffix}"] = {
                    "title": page.title(),
                    "h1": page.locator("h1").inner_text() if page.locator("h1").count() else "",
                    "h2": page.locator("h2").inner_text() if page.locator("h2").count() else "",
                    "subject_leak": page.get_by_text("admin-subject").count(),
                    "viewport": {"width": width, "height": height},
                    "image": {"width": image_width, "height": image_height},
                    "layout": layout,
                }

        browser.close()

    server.shutdown()
    (DEST / "measurements.json").write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(json.dumps(records, indent=2))


if __name__ == "__main__":
    if "--audit-existing" in sys.argv:
        audit_existing_captures()
    else:
        main()
