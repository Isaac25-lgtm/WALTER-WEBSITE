# Database schema

Local Drizzle/PostgreSQL only. No Neon project was created in this prompt. Migrations were generated, not applied remotely.

## Location

- Schema: `apps/api/src/db/schema/`
- Config: `apps/api/drizzle.config.ts`
- Migrations: `apps/api/drizzle/`
- Runtime driver: `@neondatabase/serverless` `Pool` via `drizzle-orm/neon-serverless` (required for `db.transaction()`). The HTTP driver is not used at runtime because it cannot wrap publication preparation in one transaction. Inquiries, drafts, and publications share one client. Fastify `onClose` ends the pool.

The database client is constructed only when a repository needs it. It is never imported by `apps/web`.

## `inquiries`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | `gen_random_uuid()` |
| `status` | enum `inquiry_status` | `new` (default), `in_progress`, `closed` |
| `first_name` | varchar(80) not null | |
| `last_name` | varchar(80) not null | |
| `email` | varchar(254) not null | |
| `phone` | varchar(32) not null | |
| `message` | text not null | not indexed |
| `attachment_object_key` | varchar(512) null | reserved; unused until R2 |
| `attachment_original_name` | varchar(255) null | reserved |
| `attachment_mime_type` | varchar(100) null | reserved |
| `attachment_byte_size` | integer null | reserved |
| `created_at` | timestamptz not null | default now |
| `updated_at` | timestamptz not null | default now |

Indexes: `created_at`; `status`; `(status, created_at)`. No message index. No IP, user-agent, password, payment, cookie, or file-byte columns. No product, order, price, or administrator tables.

File content is not stored in PostgreSQL.

## `content_drafts`

Website copy drafts with optimistic concurrency. Squashed generated migration: `0001_content_drafts_and_publications.sql`. Not applied remotely.

| Column | Type | Notes |
| --- | --- | --- |
| `key` | varchar(128) PK | Must match `CONTENT_DRAFT_KEYS` |
| `value` | jsonb not null | Object `{ "text": "<plain text>" }` with a CHECK that `text` is a non-empty string |
| `version` | integer not null | CHECK `version > 0`. Canonical fallback is version 0 with no row |
| `created_at` | timestamptz not null | Set on first save |
| `updated_at` | timestamptz not null | |
| `updated_by_subject` | varchar(128) not null | JWT `sub`, not an email |

Create uses an atomic insert (`ON CONFLICT DO NOTHING`). Update uses `WHERE key = ? AND version = expectedVersion`. Reset uses a conditional `DELETE … RETURNING`. A lost race is HTTP 409 `content_version_conflict`. Saving a row does not regenerate `apps/web/src/generated/public-content.ts` or `apps/web/out`.

## `content_publications`

Immutable prepared publications. Same squashed migration as drafts. Not applied remotely. Rows are insert-only.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | `gen_random_uuid()` |
| `status` | enum `content_publication_status` | Fixed to `prepared` (CHECK) |
| `content_hash` | varchar(64) not null | Deterministic SHA-256 hex (CHECK) |
| `entry_count` | integer not null | CHECK `> 0` |
| `created_at` | timestamptz not null | default now |
| `created_by_subject` | varchar(128) not null | JWT `sub`, internal only — omitted from API JSON |

## `content_publication_entries`

Immutable entries for a prepared publication. Composite primary key `(publication_id, key)`.

| Column | Type | Notes |
| --- | --- | --- |
| `publication_id` | uuid not null | FK to `content_publications.id` |
| `key` | varchar(128) not null | Controlled `CONTENT_DRAFT_KEYS` value |
| `value` | text not null | Validated plain text |
| `source` | enum `canonical` or `draft` | |
| `source_draft_version` | integer null | Required and `> 0` when source is `draft`; null when `canonical` |

Creating a publication does not call a Render deploy hook and does not change the public static export. Retired `publication_snapshots` is not in the current migration sequence. `POST /management/content/publications/prepare` compiles selected drafts inside one transaction; omitted keys stay canonical.

## Commands

```bash
npm.cmd run db:generate
npm.cmd run db:check
npm.cmd run db:migrate
```

- `db:generate` writes local SQL.
- `db:check` compares schema and migrations without a remote database.
- `db:migrate` **requires** `DATABASE_URL` and is **not run** in this prompt.

Do not use `drizzle-kit push` against a live database.

## Unavailable database

If `DATABASE_URL` is unset, `GET /health` still returns 200. `POST /inquiries` returns HTTP 503. The process does not crash.
