# Authentication and management-session security

This note describes the Prompt 15 management-auth, inquiry-inbox, content-draft, and prepared-publication contract. Neon Auth is **not provisioned**. No real administrator exists. Prompt 11–14 history remains in `project/PROGRESS.md`.

## What is not security

`/walter/` being absent from public navigation is not access control. The route is a static HTML page. Anyone who knows the URL can load the sign-in form. Discovering `/walter/` grants **no** inquiry data. Secrets and management data stay behind Fastify after a verified bearer token whose `sub` is allowlisted.

The public site remains a static export. It does not use Next.js middleware, route handlers, server actions, request-time cookies, dynamic rendering, database access, or server secrets.

## Browser identity

- Package: `@neondatabase/auth` 0.5.0-beta via the documented **`createAuthClient(url)`** factory.
- Persist one client per adapter instance. Do not create a client inside `signIn` and discard it.
- Call `signIn.email` and `signOut` on that client.
- Read tokens **only** from `getJWTToken()` when `typeof client.getJWTToken === "function"`. Do not guess `session.token` or `session.accessToken`. If `getJWTToken` is missing at runtime, sign-in is unavailable.
- Derive the client type from `ReturnType` of the installed `createAuthClient`. Do not cast with `as NeonAuthClient`.
- Sign-out clears bearer token, inquiries, selected inquiry, drafts, unsaved preview content, and publication data immediately, then calls Neon `signOut()` with a finite timeout. Protected data stays cleared if Neon fails or hangs.
- On `/walter/` mount, restore the Neon session, then call `GET /management/session` before showing the inbox.
- `NEXT_PUBLIC_NEON_AUTH_BASE_URL` is inlined at static-export build time as a static `process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL` member access. A documented Auth path such as `/neondb/auth` is permitted. Username, password, query, and fragment are rejected.
- When that URL is empty, the identity adapter returns unavailable. There is no fake success.
- Passwords are posted to the Neon Auth origin, not to Fastify, and not stored in ATS tables.
- Access tokens are held in React memory only. They are not written to `localStorage`, `sessionStorage`, URLs, logs, or generated HTML.

## API verification and authorisation

- Package: `jose` 6.2.10, used only on Fastify.
- Protected probe: **`GET /management/session`**. `GET /session` is retired and returns **404**.
- Success body is exactly `{ "authenticated": true, "role": "administrator" }`. The `role` field is a response label, not the authorisation source.
- Authorisation is only: valid JWT signature + allowed asymmetric algorithm + `exp` + `nbf` when present + exact issuer + exact audience + non-empty `sub` that exists in `WALTER_ADMIN_USER_IDS`.
- Ignore `role`, `roles`, email, name, metadata, and browser-supplied role headers for authorisation.
- A token with `role: "administrator"` and a non-allowlisted `sub` is **403**.
- A token with no role claim and an allowlisted `sub` is authorised.
- Missing or invalid bearer tokens are **401**. Management auth disabled is **503** `management_auth_unavailable`. Persistence unavailable on management inquiry, draft, or publication routes is **503** `management_storage_unavailable`. These envelopes are not the public inquiry `service_unavailable` body.
- Tests inject an `AuthVerifier` or local jose keys. Production environment parsing does **not** accept `AUTH_JWT_PUBLIC_JWK`.

## Management environment

`MANAGEMENT_AUTH_ENABLED` is a literal `"true"` / `"false"` flag (default **false**). Incomplete Auth configuration must not prevent the public API from starting.

When **true**, all of these are mandatory:

| Name | Rule |
| --- | --- |
| `NEON_AUTH_JWKS_URL` | HTTP(S) JWKS URL; **HTTPS in production** |
| `NEON_AUTH_ISSUER` | HTTP(S) issuer; **HTTPS in production** |
| `NEON_AUTH_AUDIENCE` | Non-empty audience; no silent default |
| `NEON_AUTH_JWT_ALGORITHMS` | Explicit comma-separated asymmetric list; no silent default |
| `WALTER_ADMIN_USER_IDS` | Comma-separated JWT `sub` values; at least one; emails are rejected |

Allowed algorithms: `ES256`, `ES384`, `ES512`, `RS256`, `RS384`, `RS512`, `PS256`, `PS384`, `PS512`, `EdDSA`. `none` and every `HS*` algorithm are rejected. Values are trimmed and deduplicated.

Administrator IDs are trimmed and deduplicated. They are not logged and are not exposed to the browser.

Invalid enabled configuration fails API startup with `Invalid server environment`.

Removed from production configuration: `AUTH_JWT_PUBLIC_JWK`, `AUTH_JWT_ISSUER`, `AUTH_JWT_AUDIENCE`, `AUTH_JWT_JWKS_URL`, Fastify `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`.

## Bearer parsing

Require exactly `Authorization: Bearer <token>`.

Reject missing headers, empty bearer values, multiple Authorization values, comma-joined values, Basic authentication, whitespace in the token, control characters, tokens longer than **8192** characters (`MAX_BEARER_TOKEN_LENGTH`), and tokens in query parameters or cookies.

Do not return parser details. Do not log tokens.

## Cache

Every `/management` response, including errors, sends:

- `Cache-Control: private, no-store`
- `Pragma: no-cache`
- `Vary` that preserves any existing values such as `Origin` and adds `Authorization` without duplicates

## Management inquiry routes

Canonical authenticated endpoints:

- `GET /management/session`
- `GET /management/inquiries` — query may include only `status`, `cursor`, and `limit` (default 20, min 1, max 50). Unknown, repeated, or malformed query values are **400**.
- `GET /management/inquiries/:id`
- `PATCH /management/inquiries/:id/status` with `{ "status": "new" | "in_progress" | "closed" }`

`PATCH /management/inquiries/:id` is not registered and returns **404**. There is no inquiry delete and no public inquiry list, detail, update, or delete.

List JSON is `{ "inquiries", "nextCursor" }`. Summary rows include `id`, `firstName`, `lastName`, `email`, `phone`, `status`, `createdAt`, `updatedAt`, and `hasAttachment`. They do not include `message`. The cursor is opaque, versioned, URL-safe, and encodes only the last row’s `createdAt` and `id`.

## Content drafts

Authenticated endpoints:

- `GET /management/content/drafts`
- `GET /management/content/drafts/:key`
- `PUT /management/content/drafts/:key`
- `POST /management/content/drafts/:key/reset`

The retired `/management/content-drafts*` paths return **404**.

Keys are limited to the shared `CONTENT_DRAFT_KEYS` registry generated from `context/canonical/content-draft-fields.json`. Unknown keys are **404**. Values are plain text; `<` and `>` are rejected. Save body is `{ "value", "expectedVersion" }`. Canonical fallback is version **0** with null timestamps and null `updatedBySubject`. A version mismatch returns **409** `content_version_conflict`. Saved drafts do not change `scripts/generate-public-content.mjs` or the public static export.

## Prepared publications

Authenticated endpoints:

- `GET /management/content/publications` — bounded list (`cursor`, `limit`; default 20, max 50)
- `GET /management/content/publications/:id`
- `POST /management/content/publications/prepare` with `{ "expectedDraftVersions": { "<key>": <version> } }`

Omitted keys use **canonical** copy even if a live draft exists for that key. Only listed keys are locked and version-checked. Listed versions must be integers **≥ 1**; version `0` is **400** `bad_request`. A listed version must match the live draft exactly. A mismatch returns **409** `content_version_conflict`. Empty `{}` is an all-canonical publication. Prepare runs as one database transaction: lock selected drafts, compile sorted canonical and selected-draft entries, hash, insert the publication and every entry, or commit nothing. API JSON includes `id`, `status` (`prepared`), SHA-256 `contentHash`, `entryCount`, `createdAt`, and entries with `key`, `value`, `source`, and `sourceDraftVersion`. `createdBySubject` is stored internally and is omitted from responses.

Retired `/management/content/snapshots*` and `POST /management/content/publish` return **404**. Preparing a publication does **not** invoke `STATIC_SITE_DEPLOY_HOOK_URL` or rebuild `apps/web/out`.

## Browser management fetch

Management `fetch` uses one shared helper, `credentials: "omit"`, `cache: "no-store"`, an explicit `Authorization` header, and an AbortController timeout of **15 seconds** (`DEFAULT_MANAGEMENT_FETCH_TIMEOUT_MS`). Failures distinguish unauthorized, forbidden, authentication unavailable, storage unavailable, version conflict, timeout, network failure, malformed JSON/schema, and unexpected errors. Malformed bodies are not classified as `network_error`.

## Rate limiting and client IP

`TRUST_RENDER_CLIENT_IP` is a literal `"true"` / `"false"` flag (default **false**). Fastify `trustProxy` stays **false**.

| Flag | Identity used for inquiry rate limits |
| --- | --- |
| `false` | Socket-derived `request.ip`. `X-Forwarded-For` and `CF-Connecting-IP` are ignored. |
| `true` | A single valid `CF-Connecting-IP` (IPv4 or IPv6 via `net.isIP`). Comma-separated or invalid values fall back to the socket address. `X-Forwarded-For` is never used. |

The in-memory `@fastify/rate-limit` store is suitable only for the **single free Render instance**. Horizontal scaling would need a shared store. Client addresses are not persisted and are redacted from logs.

## CORS and credentials

Public inquiry `fetch` uses `credentials: "omit"`. Management `fetch` uses `credentials: "omit"`, `cache: "no-store"`, an AbortController timeout, and sends `Authorization` explicitly. Fastify CORS `credentials` is false.
