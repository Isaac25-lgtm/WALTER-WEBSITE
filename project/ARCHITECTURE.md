# Architecture

Prompt 5 repaired the Prompt 4 foundation and added the canonical public-content pipeline. Locked hosting decisions remain those in `DECISIONS.md`. This document describes the repository shape, not a live deployment.

## High-level split

| Concern | Decision |
| --- | --- |
| Public website | Next.js App Router static export (`apps/web`) |
| Public hosting | Render Static Site (`apps/web/out`) |
| Public data | Deterministic build-time snapshot from `context/canonical/` |
| Private management | `/walter` — static sign-in and inquiry inbox; Fastify `GET /management/session` is the authentication gate |
| Protected API | Compiled Fastify (`apps/api/dist`) on a Render Web Service |
| Database | Neon PostgreSQL (not provisioned) |
| Auth | Neon Auth (not provisioned) |
| ORM / migrations | Drizzle ORM (`inquiries`, `content_drafts`, `content_publications`, `content_publication_entries`; local migrations generated, not applied remotely) |
| Media | Curated static company photography in `apps/web/public/media/company/`; Cloudflare R2 remains unprovisioned for future management uploads |
| Email | Resend (not provisioned) |
| Package manager | npm workspaces (array form) |
| Language | TypeScript, `strict` |
| Source control | Git repository initialised; `origin` points to `Isaac25-lgtm/WALTER-WEBSITE` |

## Why the public site is static

The Render free API may sleep. Visitors must still receive HTML, CSS, and images from the static host. The Next.js app therefore:

- Sets `output: 'export'` and `trailingSlash: true`
- Uses unoptimized images (compatible with static export)
- Has no Next.js API routes, server actions, or middleware
- Does not read cookies or query Neon at request time
- Builds from `apps/web/src/generated/public-content.ts`, produced by `npm run content:generate`

## Public-content pipeline

1. Canonical JSON under `context/canonical/` remains the factual source.
2. `context/canonical/publication-controls.json` is a separate editorial layer (draft / published / archived).
3. `scripts/generate-public-content.mjs` validates inputs and emits a public-safe snapshot.
4. `npm run content:check` regenerates in memory and compares with the saved snapshot, then scans for leaks.
5. The 21 named canonical project records and their extracted PDF media remain omitted. Owner-supplied company photography is separately curated through `context/canonical/company-media.json`, emitted with generic capability labels, and contains no client names or prices.

## Data flow (later)

1. Editors change drafts in `/walter` against the API (authenticated).
2. Publish writes a snapshot to Neon and invokes a **server-side** Render deploy hook.
3. The static site rebuilds from that snapshot.
4. Inquiries POST to the API when it is awake. If it is asleep, the public pages still render; the form must fail safely.

## API foundation

- Production start: `node dist/server.js` (bundled with tsup; workspace packages inlined)
- `GET /health` returns exactly `{"status":"ok"}` even without `DATABASE_URL`
- Validated CORS, 256 KiB global body limit, 32 KiB inquiry body limit, structured 404, privacy-safe logger, production-safe error handler
- Shared Zod contracts in `@ats/contracts`
- Runtime Drizzle uses `drizzle-orm/neon-serverless` so `POST /management/content/publications/prepare` can lock selected drafts, compile, hash, and insert parent plus entries in one transaction. Inquiries, drafts, and publications share one pool, which Fastify ends on close.
- `POST /inquiries` validates independently, rate-limits per client identity (see `TRUST_RENDER_CLIENT_IP`), and persists through an `InquiryRepository`. Without a database it returns **503**. Attachment metadata returns **422**. The public form posts JSON to this route when `NEXT_PUBLIC_API_BASE_URL` is set at build time.
- `GET /management/session` verifies a Bearer JWT with `jose` when `MANAGEMENT_AUTH_ENABLED=true` and the JWKS/issuer/audience/algorithm/admin-subject configuration is complete. It returns `{ authenticated: true, role: "administrator" }` only for an allowlisted JWT `sub`. `GET /session` returns **404**. Management inquiry list/detail/status routes are authenticated the same way. They do not authorise from `role` claims.

## Secrets

Browser code may only see `NEXT_PUBLIC_*` values that are not credentials. Database URLs, Neon Auth server secrets, R2 keys, Resend keys, and deploy-hook URLs stay on the API service.

## Public routes

| Route | File |
| --- | --- |
| `/` | `apps/web/app/(public)/page.tsx` |
| `/contact/` | `apps/web/app/(public)/contact/page.tsx` |
| `/portfolio/` | `apps/web/app/(public)/portfolio/page.tsx` |
| `/thank-you/` | `apps/web/app/(public)/thank-you/page.tsx` (not in nav; reached after a verified 201) |
| `/walter/` | `apps/web/app/walter/page.tsx` (static sign-in and inquiry inbox; not in public nav; not access control by itself) |
| not-found | `apps/web/app/not-found.tsx` |

Intentionally **absent** from public navigation: `/blog`, `/project`, `/projects`, `/walter`, Residential/Commercial pages. `/walter/` exists as a static route and is visually independent of the Metalworks-derived public chrome.

## Packages

- `@ats/web` — static Next.js app
- `@ats/api` — Fastify process, compiled to `apps/api/dist`
- `@ats/contracts` — Zod runtime schemas and inferred types
- `@ats/config` — non-secret env names and defaults

Root workspace commands that need npm workspace discovery run through `scripts/run-in-workspace.mjs` so they execute against the real folder `F:\MY FILES\DATA SCIENCE\WALTER'S WEBSITE`.

## Visual implementation

Prompt 6 implements shared public chrome from recorded reference geometry with ATS content. Prompt 7 corrects the desktop header row (922px / 259px) and footer height (401px), and implements the public homepage section order:

- Photographic hero, nine illustrated service cards, a six-tile featured-work mosaic, portfolio CTA, illustrated about split, and photographic closing CTA
- `LatestWorkSection` and `ClientBrandsSection` remain conditional and hidden while their generated collections are empty
- Canonical homepage copy in `context/canonical/public-copy.json` (provenance stripped from the public snapshot)

The Portfolio route displays 21 selected company photographs in five generic capability groups. Named clients and the 21 older canonical project records remain unpublished. Contact-form API integration is Prompt 10 (repaired in Prompt 11). `/walter/` is a static management sign-in route; see `project/AUTHENTICATION.md`. Metalworks assets and copy are forbidden.

## Contact page (Prompt 8)

Public Contact is a static route. Implementation lives in `apps/web/src/components/public/contact/`. `apps/web/app/contact/page.tsx` only exports metadata and the page component.

The inquiry form validates with `@ats/contracts` on the client and posts JSON to `POST /inquiries` when `NEXT_PUBLIC_API_BASE_URL` is configured. File bytes are never sent. Failure states stay on `/contact/` with canonical notices. A verified 201 navigates to `/thank-you/`. See `project/INQUIRY-FRONTEND-CONTRACT.md` and `project/INQUIRY-API-CONTRACT.md`.

`ApprovedMapSlot` renders nothing while `mapCoordinates` is empty. The future 1080×450 map area is reserved in CSS only.

Prompt 9 centres the Contact heading and introduction, sets the desktop form card to 1051px inside the 1080px container, and removes the extra Jinja/Dodoma line from the introduction (those labels remain in generated content and the footer).

## Thank you page (Prompt 10)

Black page, centred H1 **Thank you** (40px / 64px), two canonical support lines, telephone and email actions, return-home and return-contact links, and one photograph from the curated company-media shortlist. Shared public chrome only; not a nav item.

## Private `/walter/` (Prompt 15)

Route group `(public)` keeps Metalworks-derived chrome off `/walter/`. After a verified management session, `/walter/` shows an inquiry inbox, a Website Content draft editor with optimistic concurrency, and prepared publications. Neon Auth is used only as a browser `createAuthClient` when `NEXT_PUBLIC_NEON_AUTH_BASE_URL` is inlined. The client type is derived from that factory. Tokens are read from `getJWTToken` when that function exists. Fastify verifies JWTs with `jose` and allowlisted `sub` values. Saved drafts and prepared publications stay in API storage and must not alter the public static export or call a Render deploy hook.
