# Inquiry frontend contract

Prompt 10 connects the public Contact form to `POST /inquiries` from the static Next.js export. The browser may know only the public API base URL.

## Visible fields

| Label | Name | Required | Autocomplete | Control |
| --- | --- | --- | --- | --- |
| First Name | `firstName` | yes | `given-name` | text |
| Last Name | `lastName` | yes | `family-name` | text |
| Email | `email` | yes | `email` | email |
| Mobile Number | `phone` | yes | `tel` | tel |
| Message | `message` | yes | — | textarea |
| Upload File Here | `attachment` | no | — | file |
| Submit | — | — | — | submit button |

A hidden honeypot named `website` exists. It is removed from normal visual and keyboard flow. Legitimate users leave it empty. The API ignores empty values and returns a decoy 201 for non-empty values without persisting. The honeypot is **not** sufficient anti-spam protection.

Do not add product, quantity, budget, payment, password, account, marketing-consent, or newsletter fields.

## Shared schema

Validation rules live in `@ats/contracts` (`inquiryInputSchema`, `inquiryCreateRequestSchema`, `inquiryAttachmentMetaSchema`). The Contact form must not invent a second rule set.

Current limits:

- `firstName` / `lastName`: trimmed, 1–80 characters
- `email`: trimmed, valid email, max 254
- `phone`: trimmed, 7–32 characters, international formatting allowed (`+`, digits, spaces, `()`, `.`, `/`, `-`). Not Uganda-only.
- `message`: trimmed, 1–4000 characters
- `attachment`: optional metadata only (`originalName`, `mimeType`, `byteSize`)

The schema is `.strict()`. Unknown properties fail.

## Public API configuration

`NEXT_PUBLIC_API_BASE_URL` is inlined at **static-export build time**. It must be an `http:` or `https:` **origin only** (hostname, optional port, no credentials, no application path, no query, no fragment). Empty, missing, or rejected values leave the form in the unavailable state and perform **no** `fetch`.

Never put `DATABASE_URL`, Neon Auth secrets, R2 keys, Resend keys, or deploy-hook URLs in `NEXT_PUBLIC_*`.

## Attachment policy

Maximum size: **1,000,000 bytes**.

Accepted extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`.

Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.

The browser `accept` attribute and client checks of extension, MIME type, and byte size are **convenience validation only**. They are not security.

File bytes are never read, encoded, uploaded, or retained. If a file is selected, only metadata is included in the JSON body. The API currently returns **422** `attachment_not_available` for that metadata. The user can remove the file and retry.

## Frontend validation behaviour

- Validate on submit.
- Show a concise field error and an error summary after a failed submit.
- Associate errors with `aria-describedby` and set `aria-invalid` on invalid controls.
- Move focus to the error summary after a failed submit.
- Update or clear a field error when that field is corrected.
- Do not show a wall of errors before the first submit.
- Preserve entered values. Do not clear the form on failure.
- Disable the form while a request is in flight (`aria-busy`). The Submit label becomes **Submitting…** (`min-width: 100px`; the idle Submit control remains 100px-class). A polite `role="status"` announces the same submitting copy.
- `fetch` uses `credentials: "omit"` and an `AbortController` timeout (`DEFAULT_INQUIRY_FETCH_TIMEOUT_MS`, 15 seconds). Timeout and generic network failure are distinct codes.
- Do not expose Zod internals or raw exception strings.

## Submission states

On a valid submit the form:

1. Prevents the browser default.
2. Posts JSON to `{NEXT_PUBLIC_API_BASE_URL}/inquiries` with `Content-Type: application/json` and `credentials: "omit"`.
3. Uploads nothing (no multipart, no file bytes).
4. On **201**, navigates to `/thank-you/`.
5. On missing origin or **503**, shows the canonical unavailable message and `tel:` / `mailto:` alternatives.
6. On **timeout**, shows the timeout message. On a generic network failure, shows the network-error message. These are not the same state.
7. On **429**, shows the rate-limit message; Submit remains usable for retry.
8. On **422**, shows the attachment-unavailable message; the user can remove the file and retry.
9. On **400** or **415**, shows the invalid-details message.
10. On **500** or an unexpected envelope, shows the internal-error message.
11. Announces failure with `role="status"`.
12. Does not use a success colour or success icon on the Contact page.

`/thank-you/` is not in the public navigation. Direct visits still render because the site is a static export.

## JSON payload

```json
{
  "firstName": "Ada",
  "lastName": "Okello",
  "email": "ada@example.com",
  "phone": "+256 700 000 000",
  "message": "Please quote a warehouse frame in Jinja.",
  "attachment": {
    "originalName": "drawing.pdf",
    "mimeType": "application/pdf",
    "byteSize": 12000
  }
}
```

`attachment` is omitted when no file is selected. File bytes are not part of this JSON.

## Privacy

Inquiry names, emails, phone numbers, messages, and files are personal data. Do not log message text or file content. Do not place selected filenames in application logs. Browser telemetry must not capture form values.
