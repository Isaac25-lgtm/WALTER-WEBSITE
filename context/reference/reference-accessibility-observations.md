# Reference accessibility observations

Observed only. This is **not** an audit and does **not** diagnose hidden ARIA implementation.

Inspected 2026-08-31, Chrome/Playwright, headless.

## Document and titles

- Each captured route has a distinct `<title>` (home, contact, portfolio, blog, post, thank-you, project archive, 404).
- Home H1 computed style existed but **sample text was empty** in the DOM dump (styled heading with no readable `h1` string in that probe). Contact H1 text **Contact Us** is present.
- ATS should still provide a real H1 per page with ATS wording.

## Landmarks and semantics

- Stack is WordPress + Divi (`et_pb_*`). Landmark completeness **unknown**.
- Header/footer exist visually on every first-party page including 404.
- Contact form uses labelled placeholders (`First Name *`, etc.) plus a `label` string in the dump. Whether labels are programmatically associated: **unknown**.
- HTML `required` was **false**; requiredness is conveyed by `*` in the placeholder and by a post-submit message.

## Navigation

- Desktop nav is text links.
- Mobile control class `mobile_menu_bar` — accessible name, `aria-expanded`, and focus move into the panel: **unknown**.
- Duplicate Residential/Commercial/Contact nodes exist in the DOM (desktop + mobile copies).

## Images

- Logo `alt="Metalworks"` on the reference (ATS must use ATS alt, never this string).
- Many project/Instagram images have empty `alt` or marketing hashtags in `alt`.
- Google rating graphic `alt=""`.
- Map iframe `title` was **empty** in the dump.

## Colour and contrast

- White on black header/hero and white on red buttons are the dominant pairs.
- Numeric contrast ratios were **not** measured. Do not invent WCAG scores.

## Motion

- Transition duration **0s** on sampled heading.
- Carousel motion not characterised. `prefers-reduced-motion` behaviour: **unknown**.

## Keyboard and focus

- Tab order, skip-to-content, focus-visible rings, and modal focus traps: **unknown**.
- Form invalid fields did not populate an `invalids` array; per-field error association **unknown**.

## Widgets

- Call button is a text link (`Call Us Now`) — good that it is an `a[href=tel:]`, not an unlabelled icon-only control on mobile.
- Cookie, chat, or accessibility toolbars: **not observed** in the DOM dumps or screenshots.

## ATS implementation notes (non-diagnostic)

- Supply programmatic names for the hamburger and logo.
- Associate form labels with inputs; keep the five-field required set.
- Give the map placeholder an accessible name when coordinates exist.
- Do not copy reference `alt` text or customer names.
