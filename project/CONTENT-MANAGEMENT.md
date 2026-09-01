# Content management

Local `/walter/` content management is an authenticated editorial overlay. It is not a live publish step. The official public static export remains the canonical `content:generate` snapshot until a future, approved deployment process exists.

## Controlled fields

Fourteen public-copy fields may be drafted:

- Homepage: `homepage.heroHeading`, `homepage.heroSupporting`, `homepage.servicesHeading`, `homepage.servicesIntroduction`, `homepage.aboutEyebrow`, `homepage.aboutHeading`, `homepage.aboutParagraph1`, `homepage.aboutParagraph2`, `homepage.closingCtaHeading`, `homepage.closingCtaSupporting`
- Contact: `contact.heading`, `contact.introduction`
- Thank you: `thankYou.heading`, `thankYou.supporting`

Field metadata lives in `context/canonical/content-draft-fields.json`. Unknown keys are rejected. Values are plain text; `<` and `>` are rejected. Other public-content fields (identity, services, withheld projects, contact form messages, portfolio CTA labels) are locked.

## Generated registry

`scripts/generate-public-content.mjs` emits `CONTENT_DRAFT_FIELDS` to `apps/web/src/generated/content-draft-fields.ts` and `apps/api/src/generated/content-draft-fields.ts`. API and web registries must stay generated from the canonical JSON. They must not duplicate copy by hand.

## Versioned drafts

A missing row is canonical fallback: version **0**, null timestamps, null `updatedBySubject`. The first save uses `expectedVersion: 0` and creates version **1**. Each successful save increments version. Reset deletes the row when the expected version matches.

## Optimistic concurrency

Save and reset require `{ expectedVersion }`. The database updates or deletes only when `version` matches. A lost race is HTTP **409** `content_version_conflict`. Draft writes do not regenerate `apps/web/out`.

## Conflict recovery

`/walter/` keeps unsaved text on 409, shows the conflict notice, and offers **Reload Server Draft**. Reloading replaces the server draft and clears the conflict for that key without publishing.

## Selected-draft semantics

`POST /management/content/publications/prepare` accepts `{ expectedDraftVersions }`.

- Omitted keys stay canonical even if a live draft exists.
- Empty `{}` is an all-canonical publication (**201**).
- Listed versions must be integers **≥ 1**. Version `0` is **400**.
- A listed version must match the live draft row. A missing or changed row is **409**.
- `/walter/` sends only `isDraft` keys.

## Transactional prepared publications

Prepare is one repository operation inside one database transaction: lock listed draft rows (`SELECT … FOR UPDATE`), compile, validate, sort by key, SHA-256 hash, insert the publication parent and every entry, or roll back. Inquiries, drafts, and publications share one Neon pool. Fastify `onClose` ends the pool.

## Immutable entries

Prepared publications are insert-only. API JSON includes `id`, `status` (`prepared`), `contentHash`, `entryCount`, `createdAt`, and entries with `key`, `value`, `source`, and `sourceDraftVersion`. `createdBySubject` is stored internally and omitted from responses. Retired snapshot and publish routes return **404**.

## SQL pagination

`GET /management/content/publications` pages with `created_at DESC`, `id DESC`, a SQL cursor predicate, and `limit + 1`. `nextCursor` is returned only when another database row exists. The Drizzle repository does not load the full table into memory to filter.

## SHA-256 calculation

The hash is SHA-256 hex of `JSON.stringify({ entries })` after sorting entries by `key`. Each hashed entry includes `key`, `value`, `source`, and `sourceDraftVersion`. Prepare and the public-content compiler recompute the same digest.

## Complete public-content compiler

`scripts/compile-publication-content.mjs` compiles canonical browser-safe public content with a validated prepared publication. It derives the exact controlled key set from the generated field registry, then requires status `prepared`, unique known entries, field lengths, plain-text policy, and a matching SHA-256. Values are applied only through existing canonical selectors. Locked fields are preserved. Publication metadata is excluded from the result.

`npm.cmd run content:compile-publication:test` runs that compiler against temporary output and deletes it. The command is part of `npm.cmd run verify`. It does not rewrite the official generated snapshot.

## Canonical official build

`npm.cmd run content:generate` and `npm.cmd run build:web` emit the canonical public snapshot. Prepared publications and `/walter/` drafts must not appear in `apps/web/src/generated/public-content.ts` or public HTML in `apps/web/out`.

## Future deployment process

A later prompt may load a prepared publication, compile public content, rebuild the static export, and invoke a server-side Render deploy hook. That process is not implemented. `STATIC_SITE_DEPLOY_HOOK_URL` is not read. `POST /management/content/publish` returns **404**.

## Migration status

Local Drizzle migrations exist under `apps/api/drizzle/`. They have **not** been applied remotely. No Neon project was created in this prompt.

## Unauthorised future work

Do not, without explicit business approval and credentials:

- Initialise Git or push a remote
- Provision Neon, Neon Auth, Cloudflare R2, Resend, or Render
- Apply remote migrations
- Store real secrets
- Upload media
- Publish withheld projects, people, clients, or prices
- Change the live public website from drafts or prepared publications
