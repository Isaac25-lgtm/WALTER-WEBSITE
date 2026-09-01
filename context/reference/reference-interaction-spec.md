# Reference interaction specification

Observed 2026-08-31 in Chrome via Playwright. Unobserved behaviour is marked **unknown**.

Do not copy Metalworks URLs, copy, or embeds. Reproduce the **interaction model**.

## Desktop navigation

- Logo → `/`.
- Residential → `/#what-we-do` (in-page hash, not a separate route).
- Commercial → `/#what-we-do` (same target as Residential).
- Contact → `/contact/`.
- Header tel → `tel:` (Irish number on the reference; ATS uses canonical phone).
- Hover colour/underline on nav links: **unknown** (not captured).

## Mobile / tablet menu

- Trigger: `.mobile_menu_bar`, **32×32**.
- Open: panel `display:block`, `position:absolute`, height **320.375** at 390, text:

  Residential  
  Commercial  
  Contact

- Close: second toggle **succeeds** (`mobile_menu_toggle_close.ok = true`). Overlay click-outside, Esc, and focus trap: **unknown**.
- Tablet 768 hamburger click sequence: **not recorded**.

## Header scroll

- `et_pb_sticky_module` is on the header section.
- After `window.scrollTo(0,400)`, header computed `position: static`, `transform: none`, `top` negative (scrolled away).
- **Treat as not sticky.** Do not invent a pin animation.

## Hover and active states

| Control | Rest | Hover (captured) | Active / focus |
| --- | --- | --- | --- |
| Primary Contact us | bg `rgb(224,43,32)`, white text, border `0px solid rgb(255,255,255)` | Fill **unchanged**; border-color went **transparent** | unknown |
| View Portfolio | black fill | unknown | unknown |
| Submit | red, radius 5 | unknown | unknown |
| Nav links | white 15px | unknown | unknown |
| Service / overlay / gallery cards | unknown | unknown | unknown |

Transition duration on captured H1 was **0s**. Do not invent button easing.

## CTA destinations

- Hero / band **Contact us** → `/contact/` (full page).
- **View Portfolio** → `/portfolio/` (full page).
- Footer About us → `/#what-we-do`.
- Footer Contact → `/contact/`.
- Footer Privacy / Terms: **visible labels, no captured `href`** — destination **unknown**.
- Form success analogue: `/thank-you/` (not linked in nav; inferred as post-submit).

## Portfolio images

- Carousel with **dot pagination** at the bottom. Autoplay, swipe, keyboard, and click-to-advance: **unknown**.
- Gallery hover zoom/lightbox: **unknown**.
- No pagination numbered control observed besides dots.

## Instagram / social

- Six `instagram.com/p/...` items on the homepage.
- **Load More** is visible (box ~65×18 at y≈3581 on desktop home). Whether it appends posts in-page or navigates: **unknown** (button not clicked to completion in capture).
- **Follow on Instagram** → external `instagram.com/metalworksdublin/` (ATS must not use this URL).
- Footer Facebook / Instagram / TikTok → new-tab behaviour **unknown** (`target` not dumped).

## Contact form validation

- Empty submit shows a Divi message:

  Please fill in the following fields: First Name, Last Name, Email, Mobile Number, Message

- File upload is **not** in that required list.
- `invalids` array was **empty** (no per-field `aria-invalid` dump).
- HTML `required` attributes on inputs were **false**; validation is scripted.
- Successful submit → `/thank-you/` was **not** executed (no test payload sent). Destination is inferred from the live thank-you URL existing.

## File upload

- Visible affordance: “Upload File Here (optional)”, “Choose Files”, “No Files Chosen”.
- Copy states **max 1 MB**.
- `accept` attribute was **null** in the DOM dump; allowed types listed in nearby help text on the page (exact MIME list: prefer screenshot; do not invent).
- Upload success/error UI: **unknown**.

## Map / embed

- Google Maps iframe on `/contact/` only.
- Headless screenshots may show a **blank** map surface; iframe is still in the DOM.
- Pan/zoom/marker click: **not exercised**.
- ATS must **not** reuse this embed.

## Call widget

- `id="callnowbutton"`, `tel:+35315847177`, text “Call Us Now”.
- **Mobile 390:** `position:fixed`, full width, **60px** tall, bottom of viewport, z-index **2147483647**.
- **Desktop/tablet:** node exists; measurable fixed box **not** observed.
- Scroll-hide / expand: **unknown**.

## External links

- Social profile URLs and Instagram posts are third-party.
- `rel` / `target`: **unknown**.
- ATS must substitute or omit; never keep Metalworks profiles.

## Animation, lazy load, carousels

- CSS transition on sampled heading: **0s**.
- Portfolio carousel motion: **unknown**.
- Lazy-loading attributes: **not dumped**.
- Content-reveal on scroll: **not observed** as a distinct animation in capture.

## Keyboard and focus-visible

- Tab order, skip link, focus rings: **unknown** (headless capture did not walk the tab sequence).
- Do not assert WCAG pass/fail.

## Routes not in public nav

Reachable by URL or WP API, not by header/footer:

- `/blog/`
- `/metal-fabrication-vs-stainless-steel/`
- `/thank-you/`
- `/project/` (empty archive)
- `/projects/` (404)

ATS should **not** add these as public IA items except a thank-you success page after inquiry submit.
