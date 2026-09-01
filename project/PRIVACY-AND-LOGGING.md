# Privacy and logging

Inquiry names, emails, phone numbers, messages, and attachment metadata are personal data.

## Must never be logged

- inquiry messages
- names
- email addresses
- phone numbers
- filenames and attachment metadata
- authorization headers
- cookies
- `DATABASE_URL` and other credentials
- request or response bodies

## Fastify

Request logging of bodies is disabled. Serializers record method, URL, and status only. Pino redacts `req.headers.authorization`, `req.headers.cookie`, `req.body`, `res.body`, and `DATABASE_URL`. Unexpected errors log `{ errName, statusCode }` only. Stack traces stay on the server. Public envelopes are generic.

## Retention

Retention, access, and deletion rules for inquiry rows are **not decided** in this prompt and must be settled before launch. `/walter` must not be treated as a public mailbox.

## Attachments

The current API does not accept or store file bytes. Selected filenames must not appear in logs when R2 is added later.
