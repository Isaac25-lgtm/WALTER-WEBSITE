# Visual implementation notes

Current state of the public pages. The site is a static export with no form, no
upload, no API and no `/thank-you/` route.

## Shared chrome

Every public page is wrapped by `SiteFrame`:

- Skip link
- Header: logo, `Services` / `Portfolio` / `Contact`, primary telephone
- Footer: logo, footer navigation, telephone, email, Jinja address, Tanzania
  branch postal address, legal name
- Mobile **Call Us Now** bar, fixed to the bottom below 480px
  (`--ats-call-bar-height: 60px`)
- Floating **WhatsApp** action, fixed bottom-right, 56×56
  (`--ats-whatsapp-size`), stacked `60px + 16px` above the call bar on mobile

## Homepage `/`

Section order:

1. Photographic hero
2. Nine illustrated service cards
3. Six featured-work tiles linking to Portfolio group anchors
4. Portfolio CTA
5. About split, cream band
6. **Where to find us** location band, white — the shared map
7. Closing quotation CTA, dark band over a photograph

The location band sits between the cream About block and the dark closing CTA,
so the white map band separates them rather than butting two dark bands
together.

## Portfolio `/portfolio/`

21 curated photographs in five capability groups, each with a heading anchor
targeted by the homepage featured-work tiles.

## Contact `/contact/`

Black page, centred `Contact Us` heading (40px / 64px) and a short enquiry
introduction. There is **no form**: nothing on this page submits anywhere.

Three cards in a responsive grid:

| Card | Contents |
| --- | --- |
| Chat on WhatsApp | Supporting line and a green WhatsApp action button |
| Telephone | Uganda primary, Uganda alternative and Tanzania numbers, each a `tel:` link |
| Email | Supporting line and a `mailto:` link |

Below the cards:

- **Where we work** — two cards: Jinja, Uganda (street and postal address) and
  the Tanzania branch (Dodoma, postal address)
- **Tanzania branch location** — the shared map

The grid is three columns on desktop, two below 980px and one below 767px.

## Shared map

`apps/web/src/components/public/LocationMap.tsx` renders the map on **both** the
homepage and the Contact page. It is a keyless Google Maps embed, lazily loaded,
with a meaningful iframe title, a caption and an **Open in Google Maps** external
link opening in a new tab with `rel="noopener noreferrer"`.

Coordinates come from the owner-supplied record on `loc-dodoma-branch` in
`context/canonical/locations.json`. The map is labelled as the **Tanzania
branch** and never as a headquarters or head office.

Measured frame size:

| Viewport | Map frame |
| --- | --- |
| 1440×900 | 1080×450 |
| 768×1024 | 614×450 |
| 390×844 | 312×320 |

## Removed

The contact form, its validation and notice states, file-attachment metadata
handling, the `/thank-you/` route and its photograph slot, and the `/walter/`
management interface no longer exist. Their styles and design tokens have been
deleted with them.
