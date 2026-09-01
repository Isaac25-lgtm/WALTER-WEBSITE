#!/usr/bin/env python3
"""Emit Prompt 3 JSON registers from the live capture. Workspace-local."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CAP = json.loads((ROOT / "_capture_raw.json").read_text(encoding="utf-8"))
SHOT_ROOT = ROOT / "screenshots"
INSPECTED = CAP["inspected_at"]
BROWSER = "Google Chrome (Playwright channel=chrome), headless, zoom 100%, deviceScaleFactor=1"

register = {
    "inspected_at": INSPECTED,
    "browser": BROWSER,
    "browser_zoom": "100%",
    "device_pixel_ratio": 1,
    "notes": [
        "Full-page PNG captures. Header, footer and on-page widgets are included.",
        "Google Maps iframe is present on /contact/ in the DOM; map tiles may be blank in headless capture.",
        "The Call Us Now control exists in the DOM with z-index 2147483647; geometry was 0x0 at capture time and is treated as uncertain.",
        "Screenshots are private engineering evidence and must never be copied to public/ or used as ATS media.",
    ],
    "screenshots": [],
}

for s in CAP["screenshots"]:
    w, _h = s["viewport"].split("x")
    folder = "desktop" if w == "1440" else ("tablet" if w == "768" else "mobile")
    rel = s["file_path"]
    page = next(
        (p for p in CAP["pages"] if p.get("slug") == s["route"] and p.get("viewport") == folder),
        {},
    )
    struct = page.get("structure") or {}
    observed = []
    if struct.get("hamburgerVisible"):
        observed.append("mobile_or_tablet_hamburger_visible")
    if struct.get("forms"):
        observed.append("form_present")
    if struct.get("iframes"):
        observed.append("iframe_present")
    register["screenshots"].append(
        {
            "id": s["id"],
            "route": s["route"],
            "source_url": s["source_url"],
            "viewport": s["viewport"],
            "device_pixel_ratio": 1,
            "browser_zoom": "100%",
            "capture_type": "full_page",
            "file_path": rel,
            "file_exists": (SHOT_ROOT / folder / Path(rel).name).exists(),
            "http_status": page.get("status"),
            "observed_state": {
                "page_title": struct.get("title"),
                "final_url": s.get("final_url"),
                "scroll_height_px": struct.get("scrollHeight"),
                "flags": observed,
                "timestamp": s.get("timestamp"),
            },
            "notes": "Headless Chrome full-page screenshot at listed viewport.",
        }
    )

(ROOT / "screenshot-register.json").write_text(
    json.dumps(register, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
)

inventory = json.loads(
    (ROOT / "_inventory_body.json").read_text(encoding="utf-8")
) if (ROOT / "_inventory_body.json").exists() else None

inventory = {
    "reference_url": "https://metalfabrication.ie/",
    "inspected_at": INSPECTED,
    "stack_observed": "WordPress + Divi Theme Builder (et_pb_* classes). Not to be copied; appearance only.",
    "public_navigation": {
        "header_order": ["logo-home", "Residential", "Commercial", "Contact", "tel"],
        "header_destinations": {
            "logo": "https://metalfabrication.ie/",
            "Residential": "https://metalfabrication.ie/#what-we-do",
            "Commercial": "https://metalfabrication.ie/#what-we-do",
            "Contact": "https://metalfabrication.ie/contact/",
            "tel": "tel:015847177",
        },
        "footer_text_items": ["About us", "Contact", "Privacy", "Terms"],
        "footer_link_destinations_observed": {
            "About us": "https://metalfabrication.ie/#what-we-do",
            "Contact": "https://metalfabrication.ie/contact/",
            "Privacy": "unknown — visible as footer text; no href captured on an anchor",
            "Terms": "unknown — visible as footer text; no href captured on an anchor",
        },
        "external": {
            "facebook": "https://www.facebook.com/metalworksdublin/",
            "instagram": "https://www.instagram.com/metalworksdublin/",
            "tiktok": "https://www.tiktok.com/@metalworksdublin",
        },
    },
    "routes": [
        {
            "id": "home",
            "url": "https://metalfabrication.ie/",
            "kind": "full_page",
            "in_public_nav": True,
            "page_title": "Metal Fabrication | Metal Works Dublin",
            "http_status": 200,
            "header_footer": True,
            "desktop_and_mobile": True,
            "section_order": [
                "header",
                "hero",
                "what-we-do (3 service cards)",
                "featured-project-overlays (6)",
                "view-portfolio CTA",
                "about-split",
                "instagram-latest-work",
                "brands-worked-with",
                "bottom-cta-band",
                "footer",
                "call-widget (DOM; geometry uncertain)",
            ],
            "ctas": [
                {"label": "Contact us", "dest": "/contact/"},
                {"label": "View Portfolio", "dest": "/portfolio/"},
                {"label": "Load More", "dest": "in-page Instagram pagination"},
                {"label": "Follow on Instagram", "dest": "external instagram"},
                {"label": "Call Us Now", "dest": "tel:+35315847177"},
            ],
            "widgets": ["instagram_feed", "google_rating_badge", "possible_call_bar"],
        },
        {
            "id": "contact",
            "url": "https://metalfabrication.ie/contact/",
            "kind": "full_page",
            "in_public_nav": True,
            "page_title": "Contact - Metal Fabrication | Metal Works Dublin",
            "http_status": 200,
            "header_footer": True,
            "desktop_and_mobile": True,
            "section_order": [
                "header",
                "contact-heading",
                "intro-with-email-and-phone",
                "contact-form-card",
                "google-maps-iframe",
                "footer",
            ],
            "form_fields": [
                "First Name *",
                "Last Name *",
                "Email *",
                "Mobile Number *",
                "Message *",
                "Upload File Here (optional, max 1 MB)",
                "Submit",
            ],
        },
        {
            "id": "portfolio",
            "url": "https://metalfabrication.ie/portfolio/",
            "kind": "full_page",
            "in_public_nav": True,
            "page_title": "Portfolio - Metal Fabrication | Metal Works Dublin",
            "http_status": 200,
            "header_footer": True,
            "desktop_and_mobile": True,
            "section_order": [
                "header",
                "hero-image-carousel",
                "testimonials-3-cards",
                "contact-us CTA",
                "project-image-grid",
                "contact-us CTA",
                "footer",
            ],
        },
        {
            "id": "blog",
            "url": "https://metalfabrication.ie/blog/",
            "kind": "full_page",
            "in_public_nav": False,
            "discovery": "WordPress pages API; not in header or footer",
            "page_title": "Blog - Metal Fabrication | Metal Works Dublin",
            "http_status": 200,
            "header_footer": True,
            "desktop_and_mobile": True,
        },
        {
            "id": "blog-post",
            "url": "https://metalfabrication.ie/metal-fabrication-vs-stainless-steel/",
            "kind": "full_page",
            "in_public_nav": False,
            "discovery": "WordPress posts API",
            "page_title": "Unveiling the Distinction: Metal Fabrication vs. Stainless Steel - Metal Fabrication | Metal Works Dublin",
            "http_status": 200,
            "header_footer": True,
            "desktop_and_mobile": True,
        },
        {
            "id": "thank-you",
            "url": "https://metalfabrication.ie/thank-you/",
            "kind": "full_page",
            "in_public_nav": False,
            "discovery": "likely contact-form success target",
            "page_title": "Thank You - Metal Fabrication | Metal Works Dublin",
            "http_status": 200,
            "header_footer": True,
            "desktop_and_mobile": True,
        },
        {
            "id": "project-archive",
            "url": "https://metalfabrication.ie/project/",
            "kind": "full_page",
            "in_public_nav": False,
            "discovery": "WordPress CPT archive probe; empty",
            "page_title": "Projects - Metal Fabrication | Metal Works Dublin",
            "http_status": 200,
            "header_footer": True,
            "desktop_and_mobile": True,
            "notes": "Do not treat as a public ATS route. Portfolio page is the analogue.",
        },
        {
            "id": "projects-404",
            "url": "https://metalfabrication.ie/projects/",
            "kind": "full_page",
            "in_public_nav": False,
            "discovery": "alternate slug probe",
            "page_title": "Page Not Found - Metal Fabrication | Metal Works Dublin",
            "http_status": 404,
            "header_footer": True,
            "desktop_and_mobile": True,
            "notes": "404 template. Do not add a public /projects/ 404 as an ATS feature.",
        },
    ],
    "anchors": [
        {
            "id": "what-we-do",
            "url": "https://metalfabrication.ie/#what-we-do",
            "kind": "anchor_scroll",
            "used_by": ["header Residential", "header Commercial", "footer About us"],
        }
    ],
}

(ROOT / "reference-site-inventory.json").write_text(
    json.dumps(inventory, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
)
print("register", len(register["screenshots"]))
print("exists", sum(1 for x in register["screenshots"] if x["file_exists"]))
print("routes", len(inventory["routes"]))
