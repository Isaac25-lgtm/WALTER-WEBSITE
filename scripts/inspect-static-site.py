"""Inspect the exported static site at the three supported breakpoints.

Serves apps/web/out over a local HTTP server and, for every public route,
records: horizontal overflow, broken images, WhatsApp floater geometry, its
clearance above the mobile Call Us Now bar, contact action visibility and the
Google Maps embed size. Writes screenshots plus a measurements.json summary and
exits non-zero if any assertion fails.

Usage:  python scripts/inspect-static-site.py
"""

from __future__ import annotations

import json
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "apps" / "web" / "out"
DEST = ROOT / "project" / "visual-checks" / "static-site"
PORT = 4176
VIEWPORTS = ((1440, 900), (768, 1024), (390, 844))
ROUTES = (("home", "/"), ("portfolio", "/portfolio/"), ("contact", "/contact/"))

PROBE = """
() => {
  const doc = document.documentElement;
  const float = document.querySelector('.whatsapp-float');
  const bar = document.querySelector('.mobile-call-bar');
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      width: Math.round(r.width), height: Math.round(r.height),
      top: Math.round(r.top), bottom: Math.round(r.bottom),
      right: Math.round(r.right), left: Math.round(r.left),
      display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
    };
  };
  const imgs = [...document.images];
  return {
    scrollWidth: doc.scrollWidth,
    clientWidth: doc.clientWidth,
    horizontalOverflow: doc.scrollWidth > doc.clientWidth + 1,
    imagesTotal: imgs.length,
    imagesBroken: imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')),
    whatsapp: rect(float),
    whatsappHref: float ? float.getAttribute('href') : null,
    whatsappAria: float ? float.getAttribute('aria-label') : null,
    whatsappTarget: float ? float.getAttribute('target') : null,
    whatsappRel: float ? float.getAttribute('rel') : null,
    callBar: rect(bar),
    callBarVisible: bar ? getComputedStyle(bar).display !== 'none' : false,
    mapFrame: rect(document.querySelector('.contact-map__frame')),
    mapEmbedSrc: (document.querySelector('.contact-map__frame iframe') || {}).src || null,
    mapEmbedLazy: (() => { const f = document.querySelector('.contact-map__frame iframe'); return f ? f.getAttribute('loading') : null; })(),
    telLinks: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')),
    mailLinks: [...document.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href')),
    removedRouteLinks: [...document.querySelectorAll('a[href]')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && (h.includes('/walter') || h.includes('/thank-you'))),
    forms: document.querySelectorAll('form').length,
  };
}
"""


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(OUT), **kwargs)

    def log_message(self, *args):
        return


def main() -> int:
    if not OUT.exists():
        raise SystemExit("static export is missing; run: npm.cmd run build:web")
    DEST.mkdir(parents=True, exist_ok=True)

    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    Thread(target=server.serve_forever, daemon=True).start()

    results: dict[str, dict] = {}
    failures: list[str] = []

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(channel="chrome")
            page = browser.new_page()
            for width, height in VIEWPORTS:
                page.set_viewport_size({"width": width, "height": height})
                for name, route in ROUTES:
                    key = f"{name}-{width}x{height}"
                    # The live Google Maps iframe never goes network-idle, so wait on load
                    # and settle images explicitly instead.
                    page.goto(f"http://127.0.0.1:{PORT}{route}", wait_until="load")
                    # Walk the whole page so every lazy image starts loading,
                    # then wait for them to finish before probing.
                    page.evaluate(
                        "async () => {"
                        "  const step = window.innerHeight;"
                        "  for (let y = 0; y < document.body.scrollHeight; y += step) {"
                        "    window.scrollTo(0, y);"
                        "    await new Promise(r => setTimeout(r, 120));"
                        "  }"
                        "  window.scrollTo(0, 0);"
                        "  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));"
                        "}"
                    )
                    page.wait_for_timeout(400)
                    data = page.evaluate(PROBE)
                    results[key] = data
                    page.screenshot(path=str(DEST / f"{key}.png"), full_page=True)

                    def fail(msg: str) -> None:
                        failures.append(f"{key}: {msg}")

                    if data["horizontalOverflow"]:
                        fail(f"horizontal overflow {data['scrollWidth']} > {data['clientWidth']}")
                    if data["imagesBroken"]:
                        fail(f"broken images {data['imagesBroken']}")
                    if data["removedRouteLinks"]:
                        fail(f"links to removed routes {data['removedRouteLinks']}")
                    if data["forms"]:
                        fail("a form is present on a static page")

                    wa = data["whatsapp"]
                    if not wa:
                        fail("WhatsApp floater missing")
                    else:
                        if wa["display"] == "none" or wa["visibility"] == "hidden":
                            fail("WhatsApp floater is not visible")
                        if wa["width"] < 52 or wa["height"] < 52:
                            fail(f"WhatsApp touch target too small: {wa['width']}x{wa['height']}")
                        if wa["right"] > width:
                            fail("WhatsApp floater overflows the viewport")
                        if data["whatsappTarget"] != "_blank" or data["whatsappRel"] != "noopener noreferrer":
                            fail("WhatsApp floater lacks safe external-link attributes")
                        if not (data["whatsappHref"] or "").startswith("https://wa.me/256782318727"):
                            fail(f"WhatsApp href unexpected: {data['whatsappHref']}")
                        if data["callBarVisible"] and data["callBar"]:
                            gap = data["callBar"]["top"] - wa["bottom"]
                            data["floaterClearanceAboveCallBar"] = gap
                            if gap < 8:
                                fail(f"WhatsApp floater clears the call bar by only {gap}px")

                    # The Tanzania branch map now appears on the homepage too.
                    if name in ("contact", "home"):
                        mf = data["mapFrame"]
                        if not mf:
                            fail("map frame missing")
                        else:
                            if mf["width"] > width:
                                fail("map overflows the viewport")
                            if width == 1440 and abs(mf["height"] - 450) > 2:
                                fail(f"desktop map height {mf['height']} is not ~450px")
                            if not data["mapEmbedSrc"] or "-6.1683199,35.7260943" not in data["mapEmbedSrc"]:
                                fail(f"map embed src unexpected: {data['mapEmbedSrc']}")
                            if data["mapEmbedLazy"] != "lazy":
                                fail("map embed is not lazily loaded")

                    if name == "contact":
                        # Site chrome (header, footer, call bar) repeats the primary
                        # number and the email, so assert on the distinct set.
                        tel = set(data["telLinks"])
                        required = {"tel:+256782318727", "tel:+256755318727", "tel:+255764306184"}
                        if not required.issubset(tel):
                            fail(f"contact is missing telephone links: {sorted(required - tel)}")
                        if tel - required:
                            fail(f"unexpected telephone links: {sorted(tel - required)}")
                        if set(data["mailLinks"]) != {"mailto:activetechnicalservices@gmail.com"}:
                            fail(f"contact email link wrong: {sorted(set(data['mailLinks']))}")
            browser.close()
    finally:
        server.shutdown()

    (DEST / "measurements.json").write_text(
        json.dumps(results, indent=2, sort_keys=True), encoding="utf-8"
    )

    for key in sorted(results):
        d = results[key]
        wa = d["whatsapp"] or {}
        line = (
            f"  {key:<22} overflow={'YES' if d['horizontalOverflow'] else 'no':<3} "
            f"images={d['imagesTotal'] - len(d['imagesBroken'])}/{d['imagesTotal']} "
            f"whatsapp={wa.get('width', 0)}x{wa.get('height', 0)}"
        )
        if "floaterClearanceAboveCallBar" in d:
            line += f" clearance={d['floaterClearanceAboveCallBar']}px"
        if d.get("mapFrame"):
            line += f" map={d['mapFrame']['width']}x{d['mapFrame']['height']}"
        print(line)

    if failures:
        print("\nFAILURES:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("\nAll breakpoint checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
