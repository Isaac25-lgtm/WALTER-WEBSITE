# Private helper: emit observed measurements. Not part of the public site.
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def m(
    page,
    viewport,
    component,
    property_name,
    observed_value,
    unit,
    method,
    approximate,
    evidence,
    notes=None,
):
    row = {
        "page": page,
        "component": component,
        "viewport": viewport,
        "property": property_name,
        "observed_value": observed_value,
        "unit": unit,
        "method": method,
        "approximate": approximate,
        "evidence": evidence,
    }
    if notes:
        row["notes"] = notes
    return row


rows = []

# Breakpoints inferred from captured viewports, not a CSS media-query dump.
rows += [
    m("site", "desktop", "viewport-capture", "width", 1440, "px", "DOM_measurement", False, "ss-home-desktop", "Capture viewport, not a discovered CSS breakpoint."),
    m("site", "desktop", "viewport-capture", "height", 900, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("site", "tablet", "viewport-capture", "width", 768, "px", "DOM_measurement", False, "ss-home-tablet"),
    m("site", "tablet", "viewport-capture", "height", 1024, "px", "DOM_measurement", False, "ss-home-tablet"),
    m("site", "mobile", "viewport-capture", "width", 390, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("site", "mobile", "viewport-capture", "height", 844, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("site", "all", "breakpoint-behaviour", "nav_transformation", "inline nav at 1440; hamburger at 768 and 390", "n/a", "DOM_measurement", False, "ss-home-desktop,ss-home-tablet,ss-home-mobile", "Exact CSS breakpoint px unknown; not dumped from stylesheets."),
]

# Header
rows += [
    m("shared", "desktop", "header-row", "height", 84, "px", "DOM_measurement", False, "ss-home-desktop", ".et_pb_row_0_tb_header"),
    m("shared", "tablet", "header", "height", 80, "px", "computed_style", False, "ss-home-tablet", "structure.headerHeight"),
    m("shared", "mobile", "header", "height", 80, "px", "computed_style", False, "ss-home-mobile"),
    m("shared", "desktop", "header", "position_after_scroll_400", "static", "n/a", "computed_style", False, "ss-home-desktop", "et_pb_sticky_module class present but position remained static; sticky unconfirmed."),
    m("shared", "desktop", "logo", "width", 96.78125, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("shared", "desktop", "logo", "height", 65, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("shared", "desktop", "logo", "aspect_ratio", round(96.78125 / 65, 3), "ratio", "DOM_measurement", True, "ss-home-desktop", "405/272 natural."),
    m("shared", "desktop", "logo", "offset_left", 259.1875, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("shared", "desktop", "nav-link", "font_size", 15, "px", "computed_style", False, "ss-home-desktop"),
    m("shared", "desktop", "header-phone", "font_size", 14, "px", "computed_style", False, "ss-home-desktop"),
    m("shared", "mobile", "hamburger", "width", 32, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("shared", "mobile", "hamburger", "height", 32, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("shared", "mobile", "hamburger", "offset_left", 310.40625, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("shared", "mobile", "hamburger", "offset_top", 30, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("shared", "mobile", "mobile-menu-panel", "position", "absolute", "n/a", "computed_style", False, "ss-home-mobile"),
    m("shared", "mobile", "mobile-menu-panel", "height", 320.375, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("shared", "tablet", "hamburger", "presence", "headerHeight 80 same as mobile; click-open tested on 390 only", "n/a", "screenshot_estimate", True, "ss-home-tablet", "Hamburger click sequence not recorded at 768."),
]

# Containers / gutters
rows += [
    m("home", "desktop", "content-row", "max_width", 1080, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "content-row", "side_gutter", 180, "px", "computed_style", False, "ss-home-desktop", "margin 0 180px on 1440 viewport"),
    m("home", "desktop", "header-row", "horizontal_padding", "5px 259.188px", "px", "computed_style", False, "ss-home-desktop", "Inner content ~922px; distinct from 1080 content rows."),
    m("home", "tablet", "content-row", "width", 614.390625, "px", "DOM_measurement", False, "ss-home-tablet"),
    m("home", "tablet", "content-row", "side_gutter", 76.8, "px", "computed_style", True, "ss-home-tablet", "margin ~76.81 / 76.80"),
    m("home", "mobile", "content-row", "width", 312, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("home", "mobile", "content-row", "side_gutter", 39, "px", "computed_style", False, "ss-home-mobile"),
    m("contact", "desktop", "form-parent", "width", 1080, "px", "DOM_measurement", False, "ss-contact-desktop"),
    m("contact", "desktop", "form-parent", "offset_left", 180, "px", "DOM_measurement", False, "ss-contact-desktop"),
    m("contact", "desktop", "form-card", "width", 1050.59375, "px", "DOM_measurement", False, "ss-contact-desktop"),
    m("contact", "desktop", "form-card", "height", 512.28125, "px", "DOM_measurement", False, "ss-contact-desktop"),
    m("contact", "desktop", "form-parent", "border_radius", 10, "px", "computed_style", False, "ss-contact-desktop"),
]

# Home hero / sections
rows += [
    m("home", "desktop", "hero", "height", 538, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "hero", "width", 1440, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "hero", "padding_top", 54, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "tablet", "hero", "height", 507, "px", "DOM_measurement", False, "ss-home-tablet"),
    m("home", "tablet", "hero", "offset_top", 80, "px", "DOM_measurement", False, "ss-home-tablet", "Below 80px header"),
    m("home", "mobile", "hero", "height", 507, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("home", "desktop", "hero-h1", "font_size", 50, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "hero-h1", "line_height", 65, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "tablet", "hero-h1", "font_size", 40, "px", "computed_style", False, "ss-home-tablet"),
    m("home", "tablet", "hero-h1", "line_height", 52, "px", "computed_style", False, "ss-home-tablet"),
    m("home", "mobile", "hero-h1", "font_size", 30, "px", "computed_style", False, "ss-home-mobile"),
    m("home", "mobile", "hero-h1", "line_height", 39, "px", "computed_style", False, "ss-home-mobile"),
    m("home", "all", "section-h2", "font_size", 35, "px", "computed_style", False, "ss-home-desktop", "What do we do? — same 35/35 at 1440, 768, 390"),
    m("home", "all", "section-h2", "line_height", 35, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "all", "section-h2", "font_weight", 800, "n/a", "computed_style", False, "ss-home-desktop"),
    m("home", "all", "service-card-h3", "font_size", 20, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "what-we-do-section", "height", 620.71875, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "what-we-do-section", "padding_top", 50, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "what-we-do-section", "padding_bottom", 50, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "tablet", "what-we-do-section", "height", 1255.921875, "px", "DOM_measurement", False, "ss-home-tablet", "Taller than desktop: cards stack."),
    m("home", "mobile", "what-we-do-section", "height", 1232.125, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("home", "desktop", "service-cards", "column_count", 3, "count", "screenshot_estimate", True, "ss-home-desktop"),
    m("home", "tablet", "service-cards", "column_count", 1, "count", "screenshot_estimate", True, "ss-home-tablet", "Inferred from section height ~2x desktop."),
    m("home", "mobile", "service-cards", "column_count", 1, "count", "screenshot_estimate", True, "ss-home-mobile"),
    m("home", "desktop", "service-card-image", "width", 300, "px", "DOM_measurement", False, "ss-home-desktop", "First service still 300x200; others 200x200 — mixed."),
    m("home", "desktop", "service-card-image", "height", 200, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "overlay-row-1", "height", 380, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "overlay-row-2", "height", 400, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "overlay-tiles", "column_count", 3, "count", "screenshot_estimate", True, "ss-home-desktop", "Six tiles in two full-bleed rows."),
    m("home", "tablet", "overlay-row", "height", 450, "px", "DOM_measurement", False, "ss-home-tablet", "Both overlay sections 450px."),
    m("home", "tablet", "overlay-tiles", "column_count", "unknown", "count", "screenshot_estimate", True, "ss-home-tablet", "Not counted from DOM; do not invent."),
    m("home", "mobile", "overlay-row", "height", 300, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("home", "mobile", "overlay-tiles", "column_count", 1, "count", "screenshot_estimate", True, "ss-home-mobile"),
    m("home", "desktop", "about-instagram-section", "padding_top", 54, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "about-instagram-section", "background", "rgba(155, 108, 0, 0.07)", "color", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "cta-band", "padding_top", 100, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "cta-band", "padding_bottom", 100, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "cta-band", "background_color", "rgb(71, 71, 71)", "color", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "footer-section", "height", 401.171875, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "footer-section", "padding_top", 54, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "footer-section", "padding_bottom", 54, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "tablet", "footer-section", "height", 634.9375, "px", "DOM_measurement", False, "ss-home-tablet"),
    m("home", "tablet", "footer-section", "padding_top", 50, "px", "computed_style", False, "ss-home-tablet"),
    m("home", "mobile", "footer-section", "padding_top", 50, "px", "computed_style", False, "ss-home-mobile"),
    m("home", "desktop", "page", "scroll_height", 4984, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "instagram-tile", "width", 353.328125, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "instagram-tile", "height", 353.3125, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "instagram-tile", "aspect_ratio", 1, "ratio", "DOM_measurement", True, "ss-home-desktop"),
    m("home", "desktop", "google-rating-badge", "width", 108, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "google-rating-badge", "height", 58.5625, "px", "DOM_measurement", False, "ss-home-desktop"),
]

# Buttons
rows += [
    m("home", "desktop", "primary-cta", "height", 58, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "primary-cta", "padding", "12px 78px", "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "primary-cta", "border_radius", 10, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "primary-cta", "font_size", 20, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "primary-cta", "line_height", 34, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "primary-cta", "width", 262.953125, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "view-portfolio-cta", "height", 58, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "view-portfolio-cta", "padding", "12px 75px", "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "view-portfolio-cta", "border_radius", 10, "px", "computed_style", False, "ss-home-desktop"),
    m("home", "desktop", "view-portfolio-cta", "width", 288.203125, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "mobile", "primary-cta", "width", 262.953125, "px", "DOM_measurement", False, "ss-home-mobile", "Same computed width as desktop; still fits 390."),
    m("home", "desktop", "load-more", "width", 65.296875, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("home", "desktop", "load-more", "height", 18, "px", "DOM_measurement", False, "ss-home-desktop"),
    m("contact", "desktop", "submit", "height", 41.375, "px", "computed_style", False, "ss-contact-desktop"),
    m("contact", "desktop", "submit", "width", 100.125, "px", "DOM_measurement", False, "ss-contact-desktop"),
    m("contact", "desktop", "submit", "padding", "5.4px 18px", "px", "computed_style", False, "ss-contact-desktop"),
    m("contact", "desktop", "submit", "border_radius", 5, "px", "computed_style", False, "ss-contact-desktop"),
    m("contact", "desktop", "submit", "font_size", 18, "px", "computed_style", False, "ss-contact-desktop"),
    m("contact", "desktop", "submit", "line_height", 30.6, "px", "computed_style", False, "ss-contact-desktop"),
]

# Contact / map / form
rows += [
    m("contact", "desktop", "h1", "font_size", 40, "px", "computed_style", False, "ss-contact-desktop"),
    m("contact", "desktop", "h1", "line_height", 64, "px", "computed_style", False, "ss-contact-desktop"),
    m("contact", "mobile", "h1", "font_size", 40, "px", "computed_style", False, "ss-contact-mobile", "Did not scale down at 390."),
    m("contact", "desktop", "map-iframe", "width", 1080, "px", "DOM_measurement", False, "ss-contact-desktop"),
    m("contact", "desktop", "map-iframe", "height", 450, "px", "DOM_measurement", False, "ss-contact-desktop"),
    m("contact", "tablet", "map-iframe", "width", 614.390625, "px", "DOM_measurement", False, "ss-contact-tablet"),
    m("contact", "tablet", "map-iframe", "height", 450, "px", "DOM_measurement", False, "ss-contact-tablet"),
    m("contact", "mobile", "map-iframe", "width", 312, "px", "DOM_measurement", False, "ss-contact-mobile"),
    m("contact", "mobile", "map-iframe", "height", 450, "px", "DOM_measurement", False, "ss-contact-mobile"),
    m("contact", "desktop", "page", "scroll_height", 1848, "px", "DOM_measurement", False, "ss-contact-desktop"),
    m("contact", "desktop", "form-fields", "grid_columns", 2, "count", "screenshot_estimate", True, "ss-contact-desktop", "First/Last and Email/Mobile side by side."),
    m("contact", "mobile", "form-fields", "grid_columns", 1, "count", "screenshot_estimate", True, "ss-contact-mobile"),
    m("contact", "desktop", "main-section", "padding_top", 54, "px", "computed_style", False, "ss-contact-desktop"),
    m("contact", "tablet", "main-section", "padding_top", 50, "px", "computed_style", False, "ss-contact-tablet"),
    m("contact", "mobile", "main-section", "padding_top", 50, "px", "computed_style", False, "ss-contact-mobile"),
]

# Portfolio
rows += [
    m("portfolio", "desktop", "carousel", "height", 405.5, "px", "DOM_measurement", False, "ss-portfolio-desktop"),
    m("portfolio", "tablet", "carousel", "height", 216.25, "px", "DOM_measurement", False, "ss-portfolio-tablet"),
    m("portfolio", "mobile", "carousel", "height", 109.796875, "px", "DOM_measurement", False, "ss-portfolio-mobile"),
    m("portfolio", "desktop", "testimonials-section", "height", 672.5, "px", "DOM_measurement", False, "ss-portfolio-desktop"),
    m("portfolio", "desktop", "testimonials-section", "padding_top", 54, "px", "computed_style", False, "ss-portfolio-desktop"),
    m("portfolio", "desktop", "testimonials", "column_count", 3, "count", "screenshot_estimate", True, "ss-portfolio-desktop"),
    m("portfolio", "tablet", "testimonials", "column_count", "unknown", "count", "screenshot_estimate", True, "ss-portfolio-tablet", "Not counted from DOM."),
    m("portfolio", "mobile", "testimonials", "column_count", 1, "count", "screenshot_estimate", True, "ss-portfolio-mobile"),
    m("portfolio", "all", "testimonials-h2", "font_size", 35, "px", "computed_style", False, "ss-portfolio-desktop"),
    m("portfolio", "desktop", "gallery-section", "height", 2878.5, "px", "DOM_measurement", False, "ss-portfolio-desktop"),
    m("portfolio", "desktop", "gallery", "column_count", 4, "count", "screenshot_estimate", True, "ss-portfolio-desktop", "First row appearance; exact CSS grid unknown."),
    m("portfolio", "desktop", "page", "scroll_height", 4358, "px", "DOM_measurement", False, "ss-portfolio-desktop"),
]

# Call widget
rows += [
    m("shared", "mobile", "call-widget", "position", "fixed", "n/a", "computed_style", False, "ss-contact-mobile"),
    m("shared", "mobile", "call-widget", "width", 390, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("shared", "mobile", "call-widget", "height", 60, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("shared", "mobile", "call-widget", "offset_top", 784, "px", "DOM_measurement", False, "ss-home-mobile", "Viewport 844 minus 60."),
    m("shared", "mobile", "call-widget", "offset_left", 0, "px", "DOM_measurement", False, "ss-home-mobile"),
    m("shared", "mobile", "call-widget", "z_index", 2147483647, "n/a", "computed_style", False, "ss-home-mobile"),
    m("shared", "desktop", "call-widget", "box", "0x0 / not in fixedEls", "n/a", "DOM_measurement", False, "ss-home-desktop", "Node exists; on-screen geometry unknown."),
    m("shared", "tablet", "call-widget", "box", "not in fixedEls", "n/a", "DOM_measurement", False, "ss-home-tablet"),
]

# Body type
rows += [
    m("shared", "all", "body", "font_size", 14, "px", "computed_style", False, "ss-home-desktop"),
    m("shared", "all", "body", "line_height", 23.8, "px", "computed_style", False, "ss-home-desktop", "Header phone paragraph; body default line-height not separately dumped."),
    m("shared", "all", "html", "font_family", "Times New Roman", "n/a", "computed_style", False, "ss-home-desktop", "html computed stack; visible UI uses Open Sans/Inter."),
    m("blog-post", "desktop", "page", "scroll_height", 6232, "px", "DOM_measurement", False, "ss-blog-post-desktop"),
]

payload = {
    "inspected_at": "2026-08-31T10:44:33.717370+00:00",
    "methods": {
        "computed_style": "window.getComputedStyle or equivalent Playwright evaluation",
        "DOM_measurement": "element.getBoundingClientRect or scrollHeight",
        "screenshot_estimate": "visual count or ratio from full-page PNG; approximate true",
    },
    "notes": [
        "No CSS media-query list was dumped; breakpoint behaviour is inferred from 1440 / 768 / 390 captures.",
        "Do not copy Metalworks assets or copy. Measurements describe geometry only.",
        "Header sticky class exists; computed position after scroll was static.",
    ],
    "measurements": rows,
}

(ROOT / "reference-measurements.json").write_text(
    json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
)
print("measurements", len(rows))
