# ATS adaptation of the reference layout

Private engineering record. The live site https://metalfabrication.ie/ supplies **visual structure**. Canonical ATS files supply **facts**.

Do not copy Metalworks names, phones, addresses, emails, logos, photos, testimonials, Instagram posts, Google ratings, or marketing sentences.

## Locked ATS defaults (do not reopen here)

- Public name: **Active Technical Services**
- Short name: **ATS**
- Logo: canonical **Gift of God** mark only (`active logo.pdf` / raster fallback)
- Primary operation: **Jinja, Uganda**
- Tanzania: **Dodoma branch** (not public HQ)
- Primary contact candidate: **+256 782 318 727** (WhatsApp still provisional)
- Email: **activetechnicalservices@gmail.com**
- Services: the **nine** canonical services
- Projects: canonical records **only**, subject to publication review
- Pricing: **quote only**; no catalogue; no invented prices
- `/walter` never appears in public nav, footer, or this comparison

Carried-forward launch review (unchanged): photo rights; named clients and third-party marks; WhatsApp confirmation; which projects go live; KANJANSI/Kajjansi; PEPSE/Pepsi; Burundi vs Birarudi; footer one vs two legal entities; Ochan Tony’s public role.

## Route adaptation

| Reference | ATS public analogue | Notes |
| --- | --- | --- |
| `/` | Home | Same section order |
| `/contact/` | Contact / inquiry | Same form + placeholder map |
| `/portfolio/` | Work / projects gallery | Canonical projects only |
| `/thank-you/` | Post-submit thank-you | Optional; not in nav |
| `/#what-we-do` | Home services band | Hash scroll |
| `/blog/`, article | **None** | Do not add a blog |
| `/project/`, `/projects/` | **None** | Empty archive / 404 are not ATS features |

Suggested public nav rhythm (labels are editorial, not copied): two items that scroll to services (or one Services + one Projects) + Contact. Do not use Residential / Commercial.

## Content-area replacements

| Reference area | ATS replacement | Status |
| --- | --- | --- |
| Header logo | Gift of God logo | ready |
| Header tel | +256 782 318 727 | ready (WhatsApp icon pending) |
| Hero photograph | Shortlisted ATS hero assets | requires_editorial_copy |
| Hero headline/sub | ATS message slot; no unverified claims | requires_editorial_copy |
| Google rating | Omit | empty_until_approved |
| 3 service cards | **Nine** services as additional card rows | ready (layout wrap) |
| 6 overlay tiles | Featured canonical projects | requires_editorial_copy / publication review |
| View Portfolio | ATS gallery route | ready |
| About copy | company.json descriptions | requires_editorial_copy |
| Instagram grid + Follow | Omit or empty | empty_until_approved (`social_links` null) |
| Client logos | Omit | empty_until_approved |
| Bottom CTA line | Quote/inquiry slot; no prices | requires_editorial_copy |
| Testimonials | Omit / empty three-card shell | empty_until_approved |
| Portfolio carousel + grid | Approved ATS project stills | requires_editorial_copy |
| Contact intro | ATS email + phones | ready |
| Form fields | Same visible set → inquiries model | ready |
| Map iframe | Non-pinned placeholder | empty_until_approved |
| Footer identity | ATS names; Jinja + Dodoma | requires_editorial_copy (legal-entity line pending) |
| Footer social | Empty until URLs | empty_until_approved |
| Footer Privacy/Terms | ATS legal pages later; reference href unknown | requires_editorial_copy |
| Call widget | `tel:+256782318727`; mobile full-width bar | ready |
| Thank-you photo | Approved ATS still | requires_editorial_copy |

## Intentionally empty ATS slots

1. Testimonials  
2. Client / brand logos  
3. Instagram / social feed and Follow  
4. Google rating badge  
5. Map pin / coordinates  
6. Public prices and product cards  
7. Blog  
8. Named testimonials or customer quotes  
9. Metalworks (or any third-party) images and copy  

If a slot is empty, **do not invent filler**. Hide the block or show a non-claim placeholder.

## Service-count adaptation

The reference shows **three** service cards. ATS has **nine** canonical services. Keep the card visual language and **add rows**. Do not delete services to match three. Do not create extra public section types (retail shop, price grid, certificate wall) because ATS PDFs contain more material.

## Project-count adaptation

The homepage shows **six** overlay tiles and the portfolio a larger grid. Fill only from publication-reviewed canonical projects. Unused tiles stay empty; do not duplicate jobs to fill a grid.

## Map decision

`site-settings.map_status` is `no_coordinates_in_sources`. Keep a location/contact **placeholder**. Do not drop a pin on Jinja or Dodoma until coordinates are approved.
