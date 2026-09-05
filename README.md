<div align="center">

<img src="apps/web/public/media/brand/ats-logo-master.png" alt="Active Technical Services — Gift of God" width="360">

<h1>Active Technical Services — Website</h1>

<p><strong>Engineering &nbsp;·&nbsp; Civil construction &nbsp;·&nbsp; Fabrication &nbsp;·&nbsp; Industrial services</strong></p>

<p>Jinja, Uganda &nbsp;·&nbsp; Dodoma, Tanzania</p>

<p>
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-087EA4?style=flat-square&logo=react&logoColor=white">
  <img alt="TypeScript 5.9 strict" src="https://img.shields.io/badge/TypeScript-5.9%20strict-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="Static export" src="https://img.shields.io/badge/build-static%20export-2F855A?style=flat-square">
  <img alt="Render Static Site" src="https://img.shields.io/badge/Render-Static%20Site-46E3B7?style=flat-square&logo=render&logoColor=black">
  <img alt="No environment variables" src="https://img.shields.io/badge/env%20vars-none-4C1?style=flat-square">
</p>

</div>

---

## Overview

**Active Technical Services (ATS)** is an East African engineering,
civil-construction, fabrication and industrial-services company. The primary
operation is in **Jinja, Uganda**; **Dodoma, Tanzania** is a branch of the same
company.

This repository is the company website: **a pure Next.js static export**. There
is no API, no database, no authentication, no admin area and no server process.
Every page is pre-rendered at build time from files committed here, and Render
publishes the result.

Enquiries reach ATS directly through **WhatsApp, telephone and email** — there is
no contact form, because there is no backend to receive one.

The site presents nine documented service lines:

| | | |
| --- | --- | --- |
| Civil and construction | Mechanical and plant installation | Welding and fabrication |
| Structural steel and warehouses | Mild-steel and stainless-steel pipework | Industrial storage tanks |
| Labour supply | Insulation and lagging | Plant maintenance and commissioning |

---

## Contents

- [Routes](#routes)
- [Technology](#technology)
- [Repository structure](#repository-structure)
- [Local development](#local-development)
- [Editing website content](#editing-website-content)
- [Validation](#validation)
- [Build and output](#build-and-output)
- [Deploying to Render](#deploying-to-render)
- [Contact channels](#contact-channels)
- [Images](#images)
- [What this repository does not contain](#what-this-repository-does-not-contain)

---

## Routes

| Route | Contents |
| --- | --- |
| `/` | Photographic hero, nine illustrated service cards, six featured-work tiles, illustrated About section, photographic closing CTA |
| `/portfolio/` | 21 curated photographs in five capability groups |
| `/contact/` | WhatsApp action, three telephone numbers, email, Jinja and Tanzania locations, Google Maps embed |
| 404 | Static not-found page |

Every page carries the shared header, footer, mobile **Call Us Now** bar and the
floating **WhatsApp** button.

---

## Technology

| Layer | Technology |
| --- | --- |
| Website | **Next.js 16** App Router, static export (`output: 'export'`, `trailingSlash: true`), React 19 |
| Hosting | **Render Static Site**, publishing `apps/web/out` |
| Language | **TypeScript 5.9**, `strict` |
| Content | Deterministic build-time snapshot generated from committed JSON |
| Tests | Vitest |
| Runtime configuration | **None** — no environment variable is read at build or run time |

---

## Repository structure

```
apps/web/                       the entire application
  app/(public)/                 /, /portfolio/, /contact/
  app/not-found.tsx             404
  public/media/brand/           ATS logo derivatives (PNG)
  public/media/company/         21 curated company photographs
  src/components/public/        header, footer, WhatsApp floater, page sections
  src/generated/                public-content.ts — generated, never hand-edited
  src/styles/                   design tokens and per-page CSS
context/canonical/              the factual source of truth (JSON) you edit
project/                        architecture, deployment and policy documents
scripts/                        content generation and validation
render.yaml                     Render Blueprint — one static site, no secrets
```

---

## Local development

**Prerequisites:** Node.js `>=20.9.0` (the Blueprint pins `24.11.1`) and npm `>=10`.

```bash
npm.cmd install
npm.cmd run dev
```

Serves <http://localhost:3000>. Nothing else needs to run, and there is no
environment variable to set.

> On Windows use `npm.cmd` when PowerShell's execution policy blocks `npm.ps1`.
> On macOS and Linux use plain `npm`.

---

## Editing website content

All website content lives in committed files. Edit them, regenerate, validate,
commit, push — Render redeploys automatically.

### 1. Which files you edit

| To change | Edit |
| --- | --- |
| Company description, mission, coverage | `context/canonical/company.json` |
| Telephone numbers, email, legal names | `context/canonical/site-settings.json` |
| Addresses for Jinja and Dodoma | `context/canonical/locations.json` |
| The nine services and their descriptions | `context/canonical/services.json` |
| Headings and paragraphs on the pages | `context/canonical/public-copy.json` |
| Which photograph appears where | `context/canonical/company-media.json` |
| WhatsApp number, prefilled message, map coordinates | `scripts/generate-public-content.mjs` (the constants at the top) |

Never edit `apps/web/src/generated/public-content.ts` or `.json` by hand — they
are overwritten by the generator.

### 2. Changing company copy

Open `context/canonical/public-copy.json`. Each copy slot is an object with a
`text` field plus provenance fields (`source_file`, `canonical_field`,
`editorial_note`). Change `text`. Keep the provenance fields — the generator
requires them, and strips them from the published snapshot.

The generator rejects unverifiable marketing claims (`best`, `award-winning`,
`industry-leading`, `guaranteed`, and similar), and rejects response-time
promises on the contact page.

### 3. Adding or replacing a service image

1. Put the photograph in `apps/web/public/media/company/` using a
   `lower-case-hyphenated.jpg` name.
2. Add an entry to the `assets` array in `context/canonical/company-media.json`
   with `id` (must start with `media-`), `file`, `width`, `height`, `alt` (at
   least 12 characters) and `object_position`.
3. Point the service at it in the `service_media` map, keyed by service id.
4. Run `npm.cmd run content:generate`.

All nine services must have exactly one image each.

### 4. Adding Portfolio images

1. Add the photograph and its `assets` entry exactly as above.
2. Add an item to the relevant group in `portfolio_groups` in
   `context/canonical/company-media.json`, with `id`, `title` and `asset_id`.

The five capability groups are `structural-steel`, `plant-installation`,
`storage-systems`, `pipework` and `lifting-erection`. The homepage
`featured_work` tiles reference the same assets and link to a group anchor.

### 5. Updating contact information

- **Telephone and email:** `context/canonical/site-settings.json` —
  `primary_phone`, `secondary_phone`, `tanzania_local_phone`, `email`. The
  `tel:` and `mailto:` links are derived automatically.
- **Addresses:** `context/canonical/locations.json`.
- **WhatsApp number, prefilled message, map coordinates:** the constants at the
  top of `scripts/generate-public-content.mjs`.

### 6. Regenerating and checking content

```bash
npm.cmd run content:generate    # rewrite the generated snapshot
npm.cmd run content:check       # verify it is fresh, leak-free and complete
```

`content:check` fails if the committed snapshot is stale, if forbidden content
leaks, or if any referenced photograph is missing from
`apps/web/public/media/`. It reads nothing outside the repository.

### 7. Running validation

```bash
npm.cmd run verify
```

### 8. Committing and deploying

```bash
git add -A
git commit -m "Describe the content change"
git push origin main
```

Render rebuilds and republishes `main` automatically. Commit the regenerated
`apps/web/src/generated/public-content.{ts,json}` together with your canonical
edit, or the build will fail on the freshness check.

---

## Validation

```bash
npm.cmd run verify
```

Runs in order, stopping at the first failure:

1. `content:check` — snapshot freshness, leak scan, media validation
2. `lint` — ESLint
3. `typecheck` — `tsc --noEmit`
4. `test` — the Vitest suite
5. `build:web` — the static export

---

## Build and output

```bash
npm.cmd run build:web
```

Output is written to **`apps/web/out/`**, which is what Render publishes. It is
generated and is not committed.

> `scripts/build-web.mjs` (used by `build:web`) is a **Windows-only** local
> helper — it shells out to `cmd.exe` and `mklink` to work around locked `.next`
> caches. Render calls `next build` directly, which is what `render.yaml` does.

---

## Deploying to Render

[`render.yaml`](render.yaml) defines exactly **one** service:

| Field | Value |
| --- | --- |
| Name | `ats-public-web` |
| Runtime | `static` |
| Build | `npm ci && npm run content:check && npm run build --workspace=@ats/web` |
| Publish directory | `apps/web/out` |
| Environment variables | `NODE_VERSION` only |

No value is left for the operator to supply, so **applying the Blueprint asks
for nothing**. No secrets, no database, no health check, no start command.

**First deployment:** in Render choose **New → Blueprint**, select this
repository, and deploy.

**Afterwards:** push to `main` and Render rebuilds and republishes
automatically.

> **If an `ats-api` service was ever created in Render, delete or suspend it by
> hand in the dashboard.** Removing it from `render.yaml` does not delete an
> already-created service, and a paid plan keeps billing until you do.

---

## Contact channels

| Channel | Value |
| --- | --- |
| WhatsApp | `+256 782 318 727` → `https://wa.me/256782318727` with a prefilled enquiry message |
| Telephone (Uganda, primary) | `+256 782 318 727` |
| Telephone (Uganda, alternative) | `+256 755 318 727` |
| Telephone (Tanzania) | `+255 764 306 184` |
| Email | `activetechnicalservices@gmail.com` |

The floating WhatsApp button appears on every page, fixed bottom-right, and
clears the mobile Call Us Now bar. It opens in a new tab with
`rel="noopener noreferrer"` and carries the accessible name
*Chat with Active Technical Services on WhatsApp*.

The Contact page embeds the **Tanzania branch location** at
`-6.1683199, 35.7260943` using a keyless Google Maps embed, lazily loaded and
titled, with an *Open in Google Maps* link beside it. It is labelled as the
Tanzania branch, never as a headquarters.

---

## Images

- **21 curated photographs** are committed under `apps/web/public/media/company/`.
  These are the only company photographs the site uses.
- The raw source set of 86 originals sits in `compan images/`, which is
  **gitignored on purpose** — it is not needed at runtime and is not committed.
- Logo derivatives are in `apps/web/public/media/brand/` and are reproducible
  from `context/assets/brand/active-logo-pdf-render-200dpi.png` with
  `scripts/prepare-brand-assets.py`.
- **No PDF is tracked** in this repository.

---

## What this repository does not contain

Deliberately removed, and not coming back without a decision to re-add them:

- No API or server process — no Fastify, no `apps/api`
- No database — no Neon PostgreSQL, no Drizzle ORM, no migrations
- No authentication — no Neon Auth, no JWT verification, no administrator accounts
- No `/walter/` management area, inquiry inbox, content drafts or publications
- No contact form and no inquiry persistence
- No file uploads, no R2, no Resend email, no deploy hooks
- No environment variables, secrets or runtime configuration of any kind

---

## Ownership

© Active Technical Services. All rights reserved.

This repository is private company property and is published under no
open-source licence (`"license": "UNLICENSED"`). The ATS name, the *Gift of God*
mark, the logo files and all company photographs are the property of Active
Technical Services and may not be reused.
