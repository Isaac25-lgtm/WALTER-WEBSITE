# Content build report

Generated at 2026-09-05T08:49:20.653Z

## Canonical inputs read

- context/canonical/company.json
- context/canonical/site-settings.json
- context/canonical/locations.json
- context/canonical/services.json
- context/canonical/projects.json
- context/canonical/publication-controls.json
- context/canonical/public-copy.json
- context/canonical/company-media.json

All inputs are committed developer-managed files. The build reads nothing outside
the repository and requires no environment variable, database or network access.

## Public records emitted

- Identity: Active Technical Services / ATS / Gift of God
- Locations: Jinja primary operation; Dodoma branch
- Contacts: two Uganda telephones, one Tanzania telephone, one email, one WhatsApp action
- Services: 9
- Homepage copy slots: hero, services, about, portfolio CTA, closing CTA
- Curated company photography: hero, about, closing CTA, nine service cards, six featured-work tiles, and grouped portfolio gallery
- Contact copy slots: heading, introduction, alternatives, location labels, section headings
- Map: Tanzania branch location embed and external link
- Featured work: 6
- Portfolio media: 21
- Routes: /, /contact/, /portfolio/

## Records withheld

- All 21 named canonical project records and their extracted source media
- Identifiable people
- Named clients
- Client logos
- Testimonials
- Social links
- Public prices

## Withholding reasons

Publication controls mark the named project collections as draft with
public_allowed=false. No reviewer, consent, or client permission has been
recorded for those records. The separately supplied company-image folder is
curated through context/canonical/company-media.json using generic capability
labels and no client names. Only the curated photographs committed under
apps/web/public/media/company/ are validated and published.

## Generated output paths

- apps/web/src/generated/public-content.json
- apps/web/src/generated/public-content.ts

## Validation result

Passed.
