# Active Technical Services — Website

The public website and private management application for **Active Technical Services (ATS)**, an East African engineering, civil-construction, fabrication and industrial-services company based in **Jinja, Uganda**, with a branch in **Dodoma, Tanzania**.

The repository is an npm-workspaces monorepo containing a statically exported Next.js public site, a Fastify API, shared contract and config packages, and the canonical content that the public site is generated from.

> **Status:** feature-complete locally and fully tested. No cloud service has been provisioned — see [Not provisioned](#not-provisioned).

---

## Contents

- [What ATS does](#what-ats-does)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Commands](#commands)
- [Content pipeline](#content-pipeline)
- [The private /walter section](#the-private-walter-section)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Source control and large files](#source-control-and-large-files)
- [Documentation](#documentation)
- [Ownership](#ownership)

---

## What ATS does

Nine documented service lines drive the public site's structure:

| | |
| --- | --- |
| Civil and construction | Mechanical and plant installation |
| Welding and fabrication | Structural steel and warehouses |
| Mild-steel and stainless-steel pipework | Industrial storage tanks |
| Labour supply | Insulation and lagging |
| Plant maintenance and commissioning | |

Uganda and Tanzania are **one company**. Uganda is the primary public operation; Tanzania is a branch. Public branding is *Active Technical Services* / *ATS* with the *Gift of God* mark — the jurisdiction-specific legal names are used only where they belong. Documented project work spans Uganda, Tanzania, Burundi and Rwanda.

---

## Architecture

| Concern | Implementation |
| --- | --- |
| Public website | Next.js 16 App Router, **static export** (`output: 'export'`, `trailingSlash: true`) |
| Public hosting | Render Static Site, serving `apps/web/out` |
| Public data | Deterministic build-time snapshot generated from `context/canonical/` |
| Protected API | Fastify 5, bundled with tsup, run as `node apps/api/dist/server.js` |
| API hosting | Render Web Service |
| Database | Neon PostgreSQL via `drizzle-orm/neon-serverless` |
| Schema and migrations | Drizzle ORM — `inquiries`, `content_drafts`, `content_publications`, `content_publication_entries` |
| Authentication | Neon Auth; JWTs verified server-side with `jose` against an allowlist of `sub` values |
| Private management | `/walter` — static route, gated by `GET /management/session` |
| Shared contracts | Zod schemas in `@ats/contracts`, used by both browser and server |
| Language | TypeScript, `strict` throughout |

### Why the public site is static

Render's free API tier sleeps when idle. Visitors must still get HTML, CSS and images, so the public site never depends on the API at request time. It has no API routes, no server actions, no middleware, and reads no cookies.

Inquiry submission is the only API-dependent feature, and it **fails safely**: with no configured origin the form stays on `/contact/` and shows an honest unavailable message; with an origin but no database the API returns `503`.

### Public routes

| Route | Notes |
| --- | --- |
| `/` | Hero, nine-service grid, portfolio CTA, about split, closing CTA |
| `/contact/` | Inquiry form, validated client-side against the shared Zod contracts |
| `/portfolio/` | Gallery — renders nothing while publication controls withhold data |
| `/thank-you/` | Reached only after a verified `201`; not in navigation |
| `/walter/` | Private management sign-in and inbox; not in navigation |

---

## Repository layout

```
apps/
  web/                 @ats/web   — Next.js static export
    app/(public)/      public routes sharing the public chrome
    app/walter/        private management route (visually independent)
    src/generated/     public-content.ts — generated, do not hand-edit
  api/                 @ats/api   — Fastify service
    src/routes/        public + authenticated route handlers
    src/db/schema/     Drizzle schema
    drizzle/           generated SQL migrations (never applied remotely)
packages/
  contracts/           @ats/contracts — Zod schemas and inferred types
  config/              @ats/config    — non-secret env names and defaults
context/
  canonical/           factual source of truth (JSON) + publication controls
  extracted/           structured extraction from the source documents
  assets/              classified imagery extracted from the source PDFs
  reference/           recorded layout/geometry specs for the visual build
project/               architecture, deployment, policy and decision records
scripts/               content generation, verification and build tooling
render.yaml            Render blueprint (no secrets)
```

---

## Getting started

### Prerequisites

- **Node.js** `>=20.9.0` (the Render blueprint pins `24.11.1`)
- **npm** `>=10`
- **Git LFS**, to get a usable `active logo.pdf`

### Install

```bash
git lfs install
git clone https://github.com/Isaac25-lgtm/WALTER-WEBSITE.git
cd WALTER-WEBSITE
npm install
```

> **Windows:** if PowerShell's execution policy blocks `npm.ps1`, use `npm.cmd` instead of `npm` for every command below.

### Run the public site

```bash
npm run dev
```

Serves <http://localhost:3000>. The API does **not** need to be running.

### Run the API (optional)

```bash
npm run dev:api
```

Serves <http://localhost:3001>. `GET /health` returns exactly `{"status":"ok"}` even without a database.

---

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` / `dev:web` | Next.js dev server |
| `npm run dev:api` | Fastify dev server with watch |
| `npm run build` | API build, then web static export |
| `npm run build:web` | Content check, then static export to `apps/web/out` |
| `npm run build:api` | Bundle the API to `apps/api/dist` |
| `npm run content:generate` | Regenerate the public content snapshot |
| `npm run content:check` | Verify the snapshot matches canonical input and leaks nothing |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` across workspaces |
| `npm test` | Vitest — 155 tests across 33 files |
| `npm run db:generate` | Generate Drizzle migrations from the schema |
| `npm run db:check` | Validate migrations against the schema |
| `npm run verify` | Everything above, in order; any failure fails the run |

`npm run verify` is the gate to use before committing or deploying.

> **Known flake:** Vitest runs with `maxWorkers: 4` and a 5 s default timeout. Under load, `apps/api/tests/inquiries.test.ts` can exceed that and time out despite passing in roughly 350 ms in isolation. Re-run the file on its own before treating it as a regression. See [LOCAL-DEVELOPMENT.md](project/LOCAL-DEVELOPMENT.md).

---

## Content pipeline

The public site is never hand-authored. It is generated:

1. **`context/canonical/*.json`** is the factual source of truth, carrying provenance for every claim.
2. **`context/canonical/publication-controls.json`** is a separate editorial layer marking each item draft / published / archived.
3. **`scripts/generate-public-content.mjs`** validates the inputs and emits a public-safe snapshot to `apps/web/src/generated/public-content.ts`.
4. **`npm run content:check`** regenerates in memory, compares against the committed snapshot, and scans for leaks.

Anything unpublished is omitted from the snapshot entirely — unpublished projects, media, people, client names, logos, testimonials, social links, maps and prices. The leak scan asserts that source-document filenames and private paths never appear in generated public output.

Regenerate and verify after any canonical edit:

```bash
npm run content:generate
npm run content:check
```

---

## The private /walter section

`/walter/` is a static route that lives outside the public chrome. It is **not** access control by itself — the authentication gate is `GET /management/session` on the API, which verifies a Bearer JWT with `jose` and returns `{ authenticated: true, role: "administrator" }` only for an allowlisted `sub`. Role claims are never trusted for authorisation.

Behind that gate it provides an inquiry inbox, a content draft editor with optimistic concurrency (`{ value, expectedVersion }`), and prepared publications. Preparing a publication locks the selected drafts, then compiles, hashes and inserts the parent plus entries in a single transaction.

Saved drafts and prepared publications deliberately do **not** alter the public static export or invoke a deploy hook. Publishing to the live site remains a separate, explicit step.

---

## Environment variables

Templates live at [`apps/api/.env.example`](apps/api/.env.example) and [`apps/web/.env.example`](apps/web/.env.example). Every secret value in them is intentionally empty.

**Browser-safe (`NEXT_PUBLIC_*`), inlined at build time:**

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Origin only, e.g. `http://127.0.0.1:3001`. Required at **web build time** for the inquiry form. |
| `NEXT_PUBLIC_NEON_AUTH_BASE_URL` | Required for `/walter/` sign-in. Leave empty for the honest unavailable state. |

**Server-only — never expose to the browser:** `DATABASE_URL`, the `NEON_AUTH_*` values, `WALTER_ADMIN_USER_IDS`, the `R2_*` keys, `RESEND_API_KEY`, and `STATIC_SITE_DEPLOY_HOOK_URL`.

Notable defaults: `MANAGEMENT_AUTH_ENABLED=false`, `TRUST_RENDER_CLIENT_IP=false` (only set `true` behind Render/Cloudflare), and `INQUIRY_RATE_LIMIT_MAX=5` per `INQUIRY_RATE_LIMIT_WINDOW=900000` ms.

---

## Deployment

[`render.yaml`](render.yaml) is a Render blueprint defining two services — `ats-public-web` (static) and `ats-api` (Node). Every secret is declared `sync: false`, so values are set in the Render dashboard and never committed.

### Not provisioned

Nothing below has been created, configured or deployed. The repository is prepared for all of it, and no remote migration has been run:

- Neon PostgreSQL database and Neon Auth
- Render services
- Cloudflare R2 media storage
- Resend email notifications

Drizzle migrations under `apps/api/drizzle/` exist as local files only. **Do not** run `npm run db:migrate` or `drizzle-kit push` until a real `DATABASE_URL` is provisioned.

---

## Source control and large files

The two source documents this project was built from — `COMPANY CONTEXT.pdf` (110 MB) and `active company profile new 2025 civil and construction-1.pdf` (64 MB) — are **deliberately excluded** from this repository and exist on the build machine only.

They were context for the build, not deliverables. Nothing in `build`, `test`, `lint`, `typecheck` or the content pipeline reads them, and the imagery and facts derived from them are already committed under `context/assets/` and `context/canonical/`, with provenance recorded in `context/assets/inventory.json`. **They are not recoverable from this remote — keep them in an external archive.**

`active logo.pdf` (16 KB) is kept, because it is the canonical logo master that `scripts/prepare-brand-assets.py` hashes. It is stored in **Git LFS**, and `.gitattributes` routes any future PDF there automatically:

```
*.pdf filter=lfs diff=lfs merge=lfs -text
```

Also excluded by `.gitignore`: `node_modules/`, build output (`.next/`, `out/`, `dist/`), environment files and secrets, and the private raw-extraction, preview and reference-screenshot artefacts. Full rationale in [SOURCE-CONTROL-POLICY.md](project/SOURCE-CONTROL-POLICY.md).

---

## Documentation

| Document | Covers |
| --- | --- |
| [ARCHITECTURE.md](project/ARCHITECTURE.md) | Repository shape, data flow, API foundation |
| [DECISIONS.md](project/DECISIONS.md) | Locked hosting, visual and organisational decisions |
| [LOCAL-DEVELOPMENT.md](project/LOCAL-DEVELOPMENT.md) | Toolchain, every command, what not to run |
| [DEPLOYMENT-PLAN.md](project/DEPLOYMENT-PLAN.md) | Render deployment sequence |
| [DATABASE-SCHEMA.md](project/DATABASE-SCHEMA.md) | Drizzle tables and migration policy |
| [AUTHENTICATION.md](project/AUTHENTICATION.md) | Neon Auth and the `/walter` gate |
| [CONTENT-MANAGEMENT.md](project/CONTENT-MANAGEMENT.md) | Drafts, versioning, prepared publications |
| [PUBLICATION-POLICY.md](project/PUBLICATION-POLICY.md) | What may become public, and how |
| [PRIVACY-AND-LOGGING.md](project/PRIVACY-AND-LOGGING.md) | Privacy-safe logging rules |
| [INQUIRY-API-CONTRACT.md](project/INQUIRY-API-CONTRACT.md) | The inquiry contract, server side |
| [INQUIRY-FRONTEND-CONTRACT.md](project/INQUIRY-FRONTEND-CONTRACT.md) | The inquiry contract, browser side |
| [SOURCE-CONTROL-POLICY.md](project/SOURCE-CONTROL-POLICY.md) | What is committed, ignored, or archived |
| [PROGRESS.md](project/PROGRESS.md) | Build history |

---

## Ownership

© Active Technical Services. All rights reserved.

This repository is private company property and is published under no open-source licence (`"license": "UNLICENSED"`). The ATS name, the *Gift of God* mark, the logo files and all project imagery are the property of Active Technical Services and may not be reused.
