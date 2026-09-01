# Inquiry API contract

Prompt 10 documents `POST /inquiries` after the Prompt 9 hardening corrections. The public Contact form posts JSON to this route when `NEXT_PUBLIC_API_BASE_URL` is configured at static-export build time.

## Request

`POST /inquiries`  
`Content-Type: application/json` or `application/json; charset=utf-8` (exact media type, case-insensitive; parameters allowed).  
Body limit: 32 KiB (text and metadata only). File bytes, multipart, and base64 files are rejected by not being accepted.

Lookalike types are **415**: `text/plain`, `application/xml`, `text/application/json`, `application/json-malformed`, `notapplication/json`, missing Content-Type.

Validated with `inquiryCreateRequestSchema` in `@ats/contracts` (`.strict()`, trimmed).

| Field | Required | Notes |
| --- | --- | --- |
| `firstName` | yes | 1–80 |
| `lastName` | yes | 1–80 |
| `email` | yes | valid email, max 254 |
| `phone` | yes | 7–32, international formatting |
| `message` | yes | 1–4000 |
| `attachment` | no | metadata only; currently **422** |
| `website` | no | honeypot; never persisted |

Unknown fields → HTTP 400.

## Success (HTTP 201)

```json
{
  "id": "uuid",
  "createdAt": "2026-08-31T16:00:00.000Z",
  "acknowledgement": "accepted"
}
```

`createdAt` is a Zod ISO 8601 datetime (`z.iso.datetime({ offset: true })`). Empty strings, `tomorrow`, and date-only values fail.

Inquiry-create errors are the union `inquiryCreateErrorSchema` (400 / 415 / 422 / 429 / 503 / 500). Each status has a literal code schema and an inferred TypeScript type. `InquiryCreateError` is the union type. Extra properties fail.

## Rate limit

Default: **5** attempts per **15 minutes** per client (`INQUIRY_RATE_LIMIT_MAX`, `INQUIRY_RATE_LIMIT_WINDOW` in milliseconds). Applies to inquiry creation only. `/health` is not limited.

Client identity:

- Fastify `trustProxy` is **false**. The API never trusts the first `X-Forwarded-For` entry.
- `TRUST_RENDER_CLIENT_IP` is a literal `"true"` / `"false"` flag (default **false** locally and in tests; **true** on the Render API blueprint).
- When false: socket-derived `request.ip`. `X-Forwarded-For` and `CF-Connecting-IP` are ignored.
- When true: only a single valid `CF-Connecting-IP` (Node `net.isIP`, IPv4 or IPv6). Comma-separated chains and invalid values fall back to the socket address. The key generator receives the boolean; it does not read environment variables.
- The address is not persisted or logged. `"unknown"` is not used when a socket address exists.

The in-memory limiter is suitable only for the **single free Render instance**. Horizontal scaling would require a shared rate-limit store.

## Public reads

There is no public list, get, update, or delete. Authenticated management reads use `GET /management/inquiries` and `GET /management/inquiries/:id`. Status updates use `PATCH /management/inquiries/:id/status` with `{ "status": "new" | "in_progress" | "closed" }`. `PATCH /management/inquiries/:id` returns **404**. There is no inquiry delete. `GET /session` returns **404**. `GET /management/session` is the authentication probe only.

## Errors

Each of these is a **strict** Zod envelope `{ "error": { "code": "<literal>", "message": "<non-empty safe string>" } }`. Extra keys fail the contract.

| Status | Schema | Code | When |
| --- | --- | --- | --- |
| 400 | `inquiryBadRequestErrorSchema` | `bad_request` | invalid or unknown JSON fields |
| 415 | `inquiryUnsupportedMediaTypeErrorSchema` | `unsupported_media_type` | not exact `application/json` |
| 422 | `inquiryAttachmentNotAvailableErrorSchema` | `attachment_not_available` | attachment metadata present; **no row written** |
| 429 | `inquiryRateLimitErrorSchema` | `rate_limited` | too many attempts from the same client |
| 503 | `inquiryServiceUnavailableErrorSchema` | `service_unavailable` | public inquiry persistence unavailable; **no row written** |
| 503 | `managementAuthUnavailableErrorSchema` | `management_auth_unavailable` | management auth disabled or verifier unavailable |
| 503 | `managementStorageUnavailableErrorSchema` | `management_storage_unavailable` | management inquiry, draft, or publication storage unavailable |
| 409 | `contentVersionConflictErrorSchema` | `content_version_conflict` | draft or publication expected-version mismatch |
| 500 | `inquiryInternalErrorSchema` | `internal_error` | unexpected failure; generic envelope only |
| 401 | `unauthorizedErrorSchema` | `unauthorized` | missing or invalid bearer token on `/management/*` |
| 403 | `forbiddenErrorSchema` | `forbidden` | verified JWT `sub` is not in `WALTER_ADMIN_USER_IDS` |
| 404 | `inquiryNotFoundErrorSchema` | `not_found` | public GET/PATCH/DELETE of inquiries; unknown management inquiry id; retired `GET /session` |

No Zod issues, SQL, stack traces, or database URLs in responses.

## Management inquiry JSON

Authenticated `GET /management/inquiries` returns `{ "inquiries": [ { id, firstName, lastName, email, phone, status, createdAt, updatedAt, hasAttachment } ], "nextCursor": null | "<opaque cursor>" }`. The list query accepts only optional `status`, `cursor`, and `limit` (default 20, min 1, max 50). Detail adds `message` and nullable attachment metadata (never object keys). Status updates are `PATCH /management/inquiries/:id/status` with `{ "status": "in_progress" }` (`.strict()`). All management replies send `Cache-Control: private, no-store`, `Pragma: no-cache`, and a merged `Vary` that includes `Authorization` without dropping `Origin`.

## Attachment rule (temporary)

R2 is not implemented. If `attachment` is present, the API returns **422** `attachment_not_available` and does not insert a partial inquiry. Inquiries without attachment metadata may be stored when a repository is available.

## Honeypot

Non-empty `website` (after trim): no persistence, no email, no upload. Response is the same **201** shape so automated clients cannot distinguish it. Empty or omitted `website` is ignored. This is not sufficient anti-spam protection.

## Form boundary

The static site calls this route from the browser using only `NEXT_PUBLIC_API_BASE_URL`. Database credentials never appear in `NEXT_PUBLIC_*` variables. File bytes are not sent. A later Cloudflare R2 step will handle storage after server-side validation.
