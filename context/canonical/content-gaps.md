# Content gaps

The organisation model is **settled** and must not be reopened:

- one company
- Uganda is the primary public operation
- Jinja is the headquarters / primary operation
- Tanzania is a branch
- Dodoma is the Tanzania branch location
- Tanzania must not be called the public head office

Questions already provisionally resolved in `editorial-decisions.md` are **not** repeated here as open organisation questions. Remaining items below are publication rights, contacts confirmation, and footer *legal-name presentation* — not the branch structure.

## Required before public launch

1. **Publication rights** for identifiable people in project, crew, group and Administration photographs.
2. **Permission to name clients** on the public site (including Uganda Police, Mount Meru Millers, Oil Libya / Oil Libia, Sunafric Industries, Musumba Steel, BURUNDI BREWARIES, BIRARUDI BREWARIES, PEPSE DEPOT SITE).
3. **Permission to show third-party marks** that appear in photographs (hired-plant liveries such as RICHFLO / ZOOMLION and B.M.K. RWANDA LTD; DAZHONG formwork; SUNOLA gate lettering; Dell laptop on an uncaptioned portrait; COSCO containers if used).
4. **Which client-named projects may go live** if some names must stay internal.
5. **KANJANSI / Kajjansi** spelling if that project is published.
6. **PEPSE / Pepsi** confirmation if that warehouse page is published.
7. **Whether Burundi Breweries and Birarudi Breweries are one client or two.**
8. **Footer legal-name treatment:** Uganda only, or Uganda plus Tanzania branch name.
9. **Ochan Tony current role** if the public About page lists directors.

## Resolved: there is no backend

The questions previously listed here concerned Neon Auth, `/walter` access,
Resend notification inboxes, Cloudflare R2 bucket splits, Render deploy-hook
handling and draft/preview hosts. None of them apply any more.

The website is a pure static export with no API, database, authentication,
file storage, email backend or deploy hook. Enquiries reach ATS directly by
WhatsApp, telephone and email. Nothing needs to be supplied to deploy it.

## Helpful but optional

1. Street / plot address for Dodoma (only a P.O. Box is documented).
2. Confirmation that P.O. Box 122 and Plot 23A, Lubas Road are one Jinja site (already treated as one provisionally).
3. Short public biographies beyond the source sentences for Nyeko Francis and Adolf Serete.
4. Named captions for the two Administration portraits.
5. Dedicated photographs for labour supply, insulation/lagging, and maintenance/commissioning.
6. Opening hours.
7. Preferred public CTA wording.

## Rights and consent confirmations

- Identifiable workers, including ATS-branded overalls.
- Uncaptioned Administration portraits (do not assign names until captioned).
- Outdoor group photograph on the Philosophy page (~20 people; one T-WINNERS BASKETBALL shirt).
- Kanjansi-page selfie (`profile_2025-p30-img140`).
- Client names and logos as they appear in captions or on site.

Images are retained for the private build. They are not discarded pending consent.

## Retail catalogue / pricing information

The supplied documents do not establish a hardware catalogue or numeric prices.

Pending additional user content:

- Any retail SKUs (if they exist at all)
- Public price list (if any)
- Currency display besides the provisional default `UGX`

Until then the public model is **quote only**, and no price is published.

## Maps and social profiles

- **Resolved.** No map coordinates appear in the source documents, but the owner
  supplied Dodoma coordinates directly for public website use. They are recorded
  on `loc-dodoma-branch` in `context/canonical/locations.json` and published on
  **both the homepage and the Contact page**, labelled as the Tanzania branch and
  never as a headquarters.
- Jinja still has no coordinates; no evidence supports any, so no Jinja map is
  published.
- **Still absent:** no Facebook, LinkedIn, X, Instagram, YouTube or website URLs
  appear in the source files, so `social_links` remains `null` until supplied.
