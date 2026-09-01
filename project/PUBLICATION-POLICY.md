# Publication policy

Publication controls in `context/canonical/publication-controls.json` are an editorial layer. They do **not** rewrite evidence or canonical project records.

## States

- `draft` — present in canonical data; withheld from the public snapshot
- `published` — may appear in `apps/web/src/generated/` only when `public_allowed` is true and a review record exists
- `archived` — previously considered; not public

A record is public only when **both** `state` is `published` and `public_allowed` is `true`. Approval fields (`reviewed_by`, `reviewed_at`) must not be invented.

Local `/walter/` drafts and prepared publications are **not** a public publish step. Prepare selects draft keys by exact version **≥ 1**; omitted keys stay canonical. Version `0` is rejected. The compiled overlay is stored immutably. It must not change `apps/web/out` or invoke a Render deploy hook.

## Current conservative defaults

- All 21 projects: draft, not public
- All project media: draft, not public
- Identifiable people: not public
- Named clients: not public
- Client logos, testimonials, social links, map coordinates, and public prices: empty
- Pricing mode: quote only

## Generator rules

The build-time generator fails if a published item lacks explicit approval, if media IDs are missing, if private fields leak, if Tanzania is treated as a separate company or public head office, or if Jinja is not the primary operation.
