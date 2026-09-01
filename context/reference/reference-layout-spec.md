# Reference layout specification

Observed 2026-08-31 on https://metalfabrication.ie/ in Chrome (Playwright, 100% zoom). Values that are computed from the live DOM are labelled as such. Screenshot-only estimates are marked approximate.

Do not copy Metalworks names, copy, photos, logos or embeds. Reproduce **structure** with ATS slots.

## Shared chrome (every first-party page)

### Header

- Full-width **black** bar.
- **Logo left** (white wordmark + mark). Links to `/`.
- **Nav centre-right:** Residential | Commercial | Contact. Desktop font ~15px, light sans-serif, white.
- Residential and Commercial both go to **`/#what-we-do`** (same homepage section). They are not separate pages.
- Contact goes to `/contact/`.
- **Phone right:** red handset icon + `tel:` link. Do not copy the Irish number; ATS uses the canonical primary number slot.
- Desktop header **row height 84px** (computed on `.et_pb_row_0_tb_header`). Logo wrap ~76×127px. Logo image ~65×97px.
- Theme Builder class `et_pb_sticky_module` is present. After `scrollTo(0,400)`, computed `position` was **`static`** and the bar had scrolled away (`top: -400`). **Sticky behaviour is not confirmed.** Treat as document-flow header unless a later visual QA proves otherwise.
- Tablet 768 and mobile 390: **hamburger** (32×32px, ~right 48px, ~top 30px). Logo remains left. Phone-in-header is not shown as a separate text cluster on mobile (call control may appear as a bar/widget instead).

ATS substitution: ATS Gift of God logo; nav labels should map to ATS information architecture (see adaptation file), not “Residential / Commercial”.

### Footer

- Full-width **black**.
- **Three columns (desktop):**
  1. Logo + three square social icons (Facebook, Instagram, TikTok — brand-coloured).
  2. Text list: About us | Contact | Privacy | Terms. About us → `/#what-we-do`. Contact → `/contact/`. **Privacy and Terms are visible but no `href` was captured on anchors** — destination `unknown`.
  3. Phone (`tel:`), email (`mailto:`), street address.
- Bottom centred copyright line, small grey. Year observed as 2026 in footer text.
- Social destinations are Metalworks profiles — **ATS social_links are currently null**; keep icon positions, leave empty or hide until ATS URLs exist.
- Mobile: columns stack; logo, icons, links, then contact block.

ATS substitution: ATS logo; Jinja primary + Dodoma branch lines as decided in canonical locations; phones and `activetechnicalservices@gmail.com`; legal footer name from site-settings. Do not invent Privacy/Terms URLs.

### Floating / call control

- DOM id `callnowbutton`, text “Call Us Now”, `href="tel:+35315847177"`, background `rgb(224, 43, 32)`, `z-index: 2147483647`.
- **Mobile 390×844 (all captured pages):** `position:fixed`, full-width bottom bar **390×60px**, `top: 784`, `left: 0`, classes include `cnb-full cnb-full-bottom`.
- **Desktop 1440 and tablet 768:** the node exists in the DOM but was **not** in `position:fixed` with a measurable box (0×0 / empty `fixedEls`). Desktop/tablet on-screen geometry is **unknown**.
- ATS: same control type, `tel:+256782318727` (provisional WhatsApp/call candidate). Do not copy Irish numbers.

---

## Home `/`

Section sequence (desktop, top to bottom):

1. Header (black)
2. **Hero** — dark full-bleed workshop photograph, **centred** white headline and supporting line, **red** “Contact us” button (`/contact/`), Google rating badge below the button. Hero heading computed **50px / 65px line-height, weight 700, Open Sans, white, text-align center**. Button: **58px tall, padding 12px 78px, radius 10px, background rgb(224,43,32), Inter 20px/700, white**. A thin gold/scroll cue may appear at the hero base (tablet capture).
3. **What do we do?** — white section, centred H2 with a short underline accent on part of the title, intro paragraph, **three columns** of rounded-corner photos + title + short service line (Commercial / Residential / Structural). Section padding-top ~50–54px (computed on `.et_pb_section`).
4. **Featured projects** — **3×2** (desktop) full-bleed photos with **dark overlay** and centred white project titles. Not edge-rounded like the service cards.
5. **View Portfolio** — black button, white label, `/portfolio/`.
6. **About split** — light cream/off-white (`rgba(155,108,0,0.07)` computed on one section). Desktop: logo/name left, body copy right. Copy is Metalworks marketing — **ATS uses canonical company short/medium descriptions only**.
7. **Some of our latest work** — Instagram embed/grid (six posts observed) + “Load More” + “Follow on Instagram”. **ATS has no social URL** — keep the slot empty.
8. **Brands we have worked with** — heading plus logo row/stack. **ATS client-logo slot stays empty** until rights exist. Do not copy Guinness/Jones/etc.
9. **CTA band** — dark photographic full-bleed, centred white line, red Contact us.
10. Footer

Desktop content width: several modules are **1080px** wide, left offset **180px** on a 1440 viewport (gutters **180px**). Some `.et_pb_row` computed padding is `5px 259.188px` (inner ~922px). **Use 1080px / 180px gutters as the primary desktop container** unless a specific module measures otherwise.

Homepage document height ~4984px at 1440×900.

---

## Contact `/contact/`

1. Header
2. Black page ground. Centred white **Contact Us** H1 (**40px / 64px, 700, Open Sans, white, width 1080px**).
3. Intro sentence with email and phone (Metalworks values — replace with ATS email/phone slots).
4. **White form card**, radius ~10px on a parent wrapper. Form box ~1051×512px, left ~179px at 1440. Fields:
   - First Name *, Last Name *, Email *, Mobile Number * in a **2×2 grid** on desktop; **single column** on mobile
   - Message * textarea full width
   - Optional file upload: “Choose Files”, “No Files Chosen”, accepted types list, **max 1 MB**
   - **Submit** red, bottom-right of the card (~100×41px, radius 5px, Open Sans 18px/700)
5. **Google Maps iframe** 1080×450, embed of the reference company place. **ATS must not reuse this embed.** Map slot is pending coordinates; show a non-pinned placeholder.
6. Footer

Empty submit shows a Divi message listing the five required fields (file is optional).

Success page analogue: `/thank-you/`.

---

## Portfolio `/portfolio/`

1. Header
2. **Wide hero image / carousel** with **dot pagination** along the bottom centre
3. White **“What our customers say”** — **three testimonial cards** (quote mark, body, name in red). **ATS testimonials stay empty** until approved genuine quotes exist. Preserve the three-card geometry as an empty or hidden slot — do not invent quotes and do not copy Christine/Holly/John.
4. Red Contact us
5. **Dark gallery grid** of project stills (about four across on desktop in the first row; additional frames below). Overlay/hover behaviour not fully timed — unknown duration.
6. Red Contact us
7. Footer

---

## Thank you `/thank-you/`

Black page. Centred “Thank you”, two support lines, one large **rounded** project photograph, footer. Form-success target. ATS: same structure; photo from an approved ATS gallery asset, not the dental-clinic still.

---

## Blog `/blog/` and article

Present as WordPress pages **not linked from header or footer**. Blog index uses a light/sidebar WordPress layout rather than the Divi marketing chrome of Home/Contact/Portfolio. **ATS has no blog content** — do not add a public blog merely because the reference has one. If a later prompt needs a news slot, it is optional and empty.

## `/project/` and `/projects/`

- `/project/` — empty CPT archive (“No Results Found”) + search sidebar, HTTP 200.
- `/projects/` — **404** template, same chrome.

**Do not implement these as ATS public routes.** Portfolio is the public work gallery.

---

## Content-slot substitutions (structure only)

| Reference area | ATS slot |
| --- | --- |
| Header logo | Canonical Gift of God logo (`active logo.pdf` later conversion) |
| Header nav | Services (or Projects) + Contact; two items may still hash-scroll to services |
| Header tel | +256 782 318 727 |
| Hero media | Shortlisted ATS hero assets |
| Hero headline/sub | Editorial ATS slots (not invented claims) |
| 3 service cards | Nine canonical services (grid wrap / extra rows — do not drop services) |
| 6 overlay projects | Canonical featured projects, publication-review required |
| Instagram | Empty until social URL exists |
| Client logos | Empty until permission |
| Testimonials | Empty until approved ATS quotes |
| CTA copy | Quote/inquiry, no prices |
| Form | ATS inquiry fields (same visible set is compatible) |
| Map | Placeholder; no invented pin |
| Footer identity | ATS names and Jinja / Dodoma |
| Call widget | ATS tel; WhatsApp confirmation still pending |

Quote-only: the reference also has **no public price cards**. Do not invent ATS prices to “fill” a missing section.
