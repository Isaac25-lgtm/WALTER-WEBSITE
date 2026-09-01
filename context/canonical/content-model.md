# Content model (contract only)

This is a later-application content contract. It does **not** create SQL, Drizzle schemas, API routes or UI.

Canonical JSON in this folder is the first seed. Neon will later hold drafts; the public site will consume **published** snapshots at static-export time.

The public visual architecture is **not** defined here. Section order, geometry and interaction come from the recorded reference site in a later prompt. ATS determines content; the reference determines presentation.

## Company settings

One settings record (singleton).

Fields: public name, abbreviation, slogan/mark, Uganda legal footer name, Tanzania branch legal name, primary/secondary/Tanzania phones, WhatsApp number + confirmation state, email, logo source, favicon derivative status, default currency, pricing mode, social links, opening hours, map status.

Provenance and unresolved flags stay attached. Walter is never a settings field.

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

Each gallery item stores: asset id, path/R2 key (later), alt text derived from `visible_subject`, sort order, recommended placement, publication-rights status, watermark flag, identifiable-people flag, third-party-marks flag.

Hero/feature/background choices are editorial placements, not extra content types.

## Pricing

Empty by default.

`pricing_mode`: `quote_only_provisional` until the owner adds rows in `/walter/pricing`.

A future price row may have: id, label, amount, currency (`UGX` default), unit, visibility, revision. **No seed rows.** Do not invent hardware SKUs.

Public pages must not render a catalogue from empty data.

## People

Only documented names.

Fields: canonical name, titles, jurisdiction context, short factual profile, public-profile status (`allowed_factual_summary` | `internal_only_until_role_confirmed`), portrait asset id (nullable; never filled from uncaptioned photos), provenance.

Ochan Tony remains internal until role is confirmed. Walter is not a people record.

## Inquiries

Public quote/contact submissions.

Fields: created at, name, organisation, email, phone, location of interest, related service/project ids (optional), message, status (`new` | `in_progress` | `closed`), assignment (Walter/admin only), attachment ids (R2, private policy).

Do not store attachments in Neon or on Render’s ephemeral disk.

## Draft / published states

Every public content type (settings, locations, services, projects, people, galleries) has:

- `draft` — editable in `/walter`
- `preview` — authenticated or secret preview, not the static public export
- `published` — snapshot used by the next static build

The public site is a static Next.js export. It must remain fast if the Render API is asleep. Publish writes to Neon, then a **server-side** deploy hook rebuilds the static site.

## Revisions

Retain prior published snapshots (who, when, payload hash). Owners can roll back without rewriting evidence files.

Evidence provenance (`source_file`, page) is immutable and is not a revision of marketing copy.

## Provenance

Every factual public claim that came from the PDFs keeps `source_file` + page citations (PDF page numbers, not printed footers).

Inferences and provisional defaults are labelled. User authority (one company, Tanzania branch, Walter private) is recorded as decision provenance, not as a PDF quote.

## Publication-rights status

Per asset and per named client:

- `internal_only`
- `review_required`
- `cleared_for_public`

Identifiable people, client names and third-party marks default to `review_required`. Cleared assets may enter the static export; others stay available in `/walter`.

Do not generate third-party client-logo artwork.
