# Architecture

Active Technical Services runs as a **pure static website**. There is no API, no
database, no authentication and no server process of any kind. Everything the
visitor sees is pre-rendered at build time from files committed to this
repository.

## Shape

| Concern | Decision |
| --- | --- |
| Website | Next.js App Router static export (`apps/web`) |
| Hosting | Render Static Site publishing `apps/web/out` |
| Content | Deterministic build-time snapshot generated from `context/canonical/` |
| Media | Curated photographs committed under `apps/web/public/media/` |
| Contact | WhatsApp, three telephone numbers, one email address, one map embed |
| Runtime configuration | **None.** No environment variable is read at build or run time |
| Language | TypeScript, `strict` |
| Tests | Vitest |

## Public routes

| Route | File |
| --- | --- |
| `/` | `apps/web/app/(public)/page.tsx` |
| `/portfolio/` | `apps/web/app/(public)/portfolio/page.tsx` |
| `/contact/` | `apps/web/app/(public)/contact/page.tsx` |
| 404 | `apps/web/app/not-found.tsx` |

There are no other routes. Every page is wrapped by `SiteFrame`, which supplies
the header, footer, mobile Call Us Now bar and the floating WhatsApp action.

## Content pipeline

1. `context/canonical/*.json` holds the factual record — company, locations,
   services, public copy and the curated media manifest.
2. `scripts/generate-public-content.mjs` validates those inputs and writes a
   browser-safe snapshot to `apps/web/src/generated/public-content.{ts,json}`.
3. `scripts/check-public-content.mjs` regenerates the snapshot in memory,
   compares it with the committed one, and runs the leak scan.

The generator validates that every referenced photograph exists under
`apps/web/public/media/`. It never reads anything outside the repository, so a
clean checkout on Render builds exactly what a developer sees locally.

Withheld by design: named projects, identifiable people, client names, client
logos, testimonials, social links and prices. The publication controls in
`context/canonical/publication-controls.json` are still validated so those
records cannot leak into the public snapshot.

## What was removed

The Fastify API, Neon PostgreSQL, Neon Auth, Drizzle ORM and its migrations, the
private `/walter/` management application, the inquiry inbox, the content-draft
and publication systems, the `/thank-you/` route, the R2 and Resend
placeholders, the deploy-hook placeholder and the `@ats/contracts` and
`@ats/config` packages have all been deleted.

Website changes are now made directly in this repository by developers,
validated with `npm run verify`, committed, and deployed by Render from `main`.
