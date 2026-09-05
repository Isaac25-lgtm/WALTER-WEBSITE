# Content model

This describes the shape of the canonical JSON in this folder. There is no
database, API or admin UI: the website is a pure static export, and developers
edit these files directly in the repository.

`scripts/generate-public-content.mjs` reads these files and writes the
browser-safe snapshot consumed by the static build. Anything not emitted into
that snapshot never reaches the public site.

The public visual architecture is **not** defined here. Section order, geometry and interaction come from the recorded reference site in a later prompt. ATS determines content; the reference determines presentation.

## Company settings

One settings record (singleton).

Fields: public name, abbreviation, slogan/mark, Uganda legal footer name, Tanzania branch legal name, primary/secondary/Tanzania phones, WhatsApp number + confirmation state, email, logo source, favicon derivative status, default currency, pricing mode, social links, opening hours, map status.

Provenance and unresolved flags stay attached. The owner's personal name is never a settings field.

## Locations

One record per site. Seed: Jinja primary operation; Dodoma Tanzania branch.

Fields: display name, organizational role (`primary_operation` | `branch`), country, postal address, physical address, phones, WhatsApp, email, map coordinates (nullable), public label, evidence-only labels that must not be copied into public copy (for example raw `HEAD OFFICE`).

Do not model Uganda and Tanzania as separate companies.

## Services

Owner-editable service records grouped from source bullets without inventing capabilities.

Fields: id, slug (unique), name, short/medium description, supporting project ids, supporting asset ids, evidence strength, publication status, editorial notes, provenance.

Labour supply, insulation/lagging and maintenance/commissioning may exist with text and **no** photographs.

No equipment inventories, guarantees, certifications or prices on service records.

## Projects

One record per documented job. Do not merge because photographs look similar.

Fields: id, slug (unique), title (editorial), client (nullable; publication-review), location, country, summary, service ids, primary image asset id, gallery asset ids, featured flag, spelling/identity issue, evidence strength, publication-review required, provenance, editorial notes.

Raw captions remain in evidence (`context/extracted/projects.json`); public title uses corrected grammar only where allowed.

## Galleries

Ordered asset lists attached to a project (and optionally a service).

Each gallery item stores: asset id, the committed public file under `apps/web/public/media/`, alt text derived from `visible_subject`, sort order, recommended placement, publication-rights status, watermark flag, identifiable-people flag, third-party-marks flag.

Hero/feature/background choices are editorial placements, not extra content types.

## Pricing

Empty by default.

`pricing_mode`: `quote_only_provisional`. Prices are not published.

A future price row may have: id, label, amount, currency (`UGX` default), unit, visibility, revision. **No seed rows.** Do not invent hardware SKUs.

Public pages must not render a catalogue from empty data.

## People

Only documented names.

Fields: canonical name, titles, jurisdiction context, short factual profile, public-profile status (`allowed_factual_summary` | `internal_only_until_role_confirmed`), portrait asset id (nullable; never filled from uncaptioned photos), provenance.

Ochan Tony remains internal until role is confirmed. The owner is not a people record.

## Enquiries

There is no inquiry form and no stored submissions. Enquiries arrive directly
through the published contact channels: WhatsApp, the three telephone numbers
and the email address. Nothing is persisted by the website.

## Publication states

Publication is decided in `context/canonical/publication-controls.json`. A
record is either withheld or emitted into the generated snapshot; there is no
draft editor, no preview environment and no publish action.

Publishing a change is: edit the canonical file, run `npm run content:generate`,
run `npm run verify`, commit, push. Render rebuilds the static site from `main`.

## Revisions

Git history is the revision record. Roll back by reverting a commit; the
evidence files under `context/extracted/` are never rewritten.

Evidence provenance (`source_file`, page) is immutable and is not a revision of
marketing copy.

## Provenance

Every factual public claim that came from the PDFs keeps `source_file` + page citations (PDF page numbers, not printed footers).

Inferences and provisional defaults are labelled. User authority (one company, Tanzania branch) is recorded as decision provenance, not as a PDF quote.

## Publication-rights status

Per asset and per named client:

- `internal_only`
- `review_required`
- `cleared_for_public`

Identifiable people, client names and third-party marks default to `review_required`. Only cleared assets are committed under `apps/web/public/media/` and enter the static export; the rest stay in the local evidence archive and are never published.

Do not generate third-party client-logo artwork.
