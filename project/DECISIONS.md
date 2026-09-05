# Project decisions (current state)

This is the decision record for the website **as it is today**. It is not a plan
for future work, and it does not describe a backend. The build history that led
here — including the API, database and management application that were later
removed — is preserved in [`PROGRESS.md`](PROGRESS.md).

## Architecture

| Concern | Decision |
| --- | --- |
| Website | One Next.js App Router application, **static export** (`apps/web`) |
| Hosting | One Render Static Site publishing `apps/web/out` |
| Backend | **None.** No API, no server process |
| Database | **None** |
| Authentication | **None.** No accounts, no admin area |
| Content management | Developers edit committed files in this repository |
| Media | Curated photographs committed under `apps/web/public/media/` |
| Enquiries | Direct: WhatsApp, telephone, email |
| Runtime configuration | **None.** No environment variable is read at build or run time |
| Secrets | **None to hold.** Render is asked for no operator-supplied value |
| Language | TypeScript, `strict` |

## Public visual specification

- **https://metalfabrication.ie/** remains the binding visual reference for
  layout, geometry, hierarchy, responsiveness and interaction.
- ATS content replaces the reference organisation's identity entirely.
- Do not redesign or creatively reinterpret the public site.
- **ATS determines what the site says and shows. The reference determines how it
  looks and behaves.**

## Organisation

- Uganda and Tanzania are **one company**.
- Tanzania is a **branch**. Jinja is the **primary public operation**.
- Dodoma must never be presented as a headquarters.
- Public brand: Active Technical Services / ATS, mark *Gift of God*.
- The owner's personal name is not public brand content.

## Content

- Canonical JSON under `context/canonical/` is the source of truth.
- `scripts/generate-public-content.mjs` produces the browser-safe snapshot; the
  committed snapshot must stay in step with it or the build fails.
- Only curated photographs committed under `apps/web/public/media/` are
  validated and published. The raw source set is not tracked.
- Do not invent clients, prices, certifications, opening hours, response times
  or social profiles.
- Named projects, identifiable people, client names, client logos, testimonials
  and prices remain withheld.

## Contact channels

| Channel | Value |
| --- | --- |
| WhatsApp | `+256 782 318 727` with a prefilled enquiry message |
| Telephone (Uganda, primary) | `+256 782 318 727` |
| Telephone (Uganda, alternative) | `+256 755 318 727` |
| Telephone (Tanzania) | `+255 764 306 184` |
| Email | `activetechnicalservices@gmail.com` |
| Map | Tanzania branch at `-6.1683199, 35.7260943`, keyless embed |

## Deployment

- One Render Static Site, deployed from `main`.
- Applying the Blueprint asks for nothing.
- Pushing to `main` triggers a rebuild.

## Explicitly removed — do not reintroduce

The following were built and then deliberately deleted. Rebuilding any of them
is a new decision, not a restoration:

Fastify API (`apps/api`) · Neon PostgreSQL · Neon Auth · Drizzle ORM and
migrations · `jose` · the `@ats/contracts` and `@ats/config` packages · the
`/walter` management area · the inquiry inbox · content drafts · prepared
publications · the inquiry form and its persistence · the `/thank-you` route ·
Cloudflare R2 · Resend · the Render deploy hook · every `NEXT_PUBLIC_*`,
`NEON_AUTH_*`, `R2_*`, `DATABASE_URL`, `CORS_ORIGINS`, `WALTER_ADMIN_USER_IDS`,
`RESEND_API_KEY` and `STATIC_SITE_DEPLOY_HOOK_URL` variable.

Automated tests in `apps/web/src/export-safety.test.ts` fail if any of these
reappear in application source, active scripts or current architecture
documents.

## Superseded Render service

An `ats-api` Render Web Service was created during the earlier architecture.
Removing it from `render.yaml` does not delete it. **Delete or suspend it by
hand in the Render dashboard**, or its paid plan keeps billing.
