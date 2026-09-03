<div align="center">

<img src="apps/web/public/media/brand/ats-logo-master.png" alt="Active Technical Services — Gift of God" width="360">

<h1>Active Technical Services — Website</h1>

<p><strong>Engineering &nbsp;·&nbsp; Civil construction &nbsp;·&nbsp; Fabrication &nbsp;·&nbsp; Industrial services</strong></p>

<p>Jinja, Uganda &nbsp;·&nbsp; Dodoma, Tanzania</p>

<p>
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-087EA4?style=flat-square&logo=react&logoColor=white">
  <img alt="Fastify 5" src="https://img.shields.io/badge/Fastify-5-202020?style=flat-square&logo=fastify&logoColor=white">
  <img alt="TypeScript 5.9 strict" src="https://img.shields.io/badge/TypeScript-5.9%20strict-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="Drizzle ORM" src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black">
  <img alt="Neon PostgreSQL" src="https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=flat-square&logo=postgresql&logoColor=black">
  <img alt="Render" src="https://img.shields.io/badge/Render-Blueprint-46E3B7?style=flat-square&logo=render&logoColor=black">
</p>

</div>

---

## Overview

**Active Technical Services (ATS)** is an East African engineering, civil-construction, fabrication and industrial-services company. The primary operation is in **Jinja, Uganda**; **Dodoma, Tanzania** is a branch of the same company. Documented project work spans Uganda, Tanzania, Burundi and Rwanda.

This repository holds the complete website: a statically exported public site, a protected Fastify API, and a private `/walter/` management application, together with the canonical content the public pages are generated from.

The site presents nine documented service lines:

| | | |
| --- | --- | --- |
| Civil and construction | Mechanical and plant installation | Welding and fabrication |
| Structural steel and warehouses | Mild-steel and stainless-steel pipework | Industrial storage tanks |
| Labour supply | Insulation and lagging | Plant maintenance and commissioning |

---

## Contents

- [Routes](#routes)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Local development](#local-development)
- [Validation](#validation)
- [Build and output](#build-and-output)
- [Environment variables](#environment-variables)
- [Deploying to Render](#deploying-to-render)
- [Neon PostgreSQL setup](#neon-postgresql-setup)
- [Neon Auth setup](#neon-auth-setup)
- [Inquiry form requirements](#inquiry-form-requirements)
- [`/walter/` requirements](#walter-requirements)
- [Security and secret handling](#security-and-secret-handling)
- [Current limitations](#current-limitations)
- [Deployment checklist](#deployment-checklist)

---

## Routes

### Public

| Route | Contents |
| --- | --- |
| `/` | Photographic hero, nine illustrated service cards, six featured-work tiles, illustrated About section, photographic closing CTA |
| `/portfolio/` | 21 curated photographs arranged into five capability groups |
| `/contact/` | Inquiry form, validated in the browser against the shared Zod contracts |
| `/thank-you/` | Reached only after a verified `201`; carries a curated photograph. Not in navigation |

A `404` page is exported as well. The site is responsive across desktop, tablet and mobile.

### Private

| Route | Contents |
| --- | --- |
| `/walter/` | Management sign-in, inquiry inbox, content draft editor, prepared publications |

`/walter/` is **deliberately absent from public navigation**, and that absence is not access control — see [`/walter/` requirements](#walter-requirements).

---

## Technology stack

| Layer | Technology |
| --- | --- |
| Public site | **Next.js 16** App Router, **static export** (`output: 'export'`, `trailingSlash: true`), React 19 |
| Public hosting | **Render Static Site**, publishing `apps/web/out` |
| API | **Fastify 5**, bundled with tsup to `apps/api/dist` |
| API hosting | **Render Web Service** (`0.5c-512mb`: 0.5 CPU / 512 MB) |
| Language | **TypeScript 5.9**, `strict` throughout |
| Database | **Neon PostgreSQL** via `drizzle-orm/neon-serverless` |
| Schema / migrations | **Drizzle ORM** — `inquiries`, `content_drafts`, `content_publications`, `content_publication_entries` |
| Authentication | **Neon Auth** in the browser; JWTs verified server-side with `jose` |
| Shared contracts | Zod schemas in `@ats/contracts`, used by browser and server alike |
| Tests | Vitest |

**The public site never contacts the API at render time.** It has no API routes, no server actions, no middleware, and reads no cookies. This keeps the website fast and complete while the separate API is restarting, redeploying, under maintenance, or temporarily unreachable.

---

## Repository structure

```
apps/
  web/                          @ats/web — Next.js static export
    app/(public)/               /, /portfolio/, /contact/, /thank-you/
    app/walter/                 private management route
    public/media/brand/         ATS logo derivatives (PNG)
    public/media/company/       21 curated company photographs
    src/components/public/      home, portfolio, contact, thank-you
    src/generated/              public-content.ts — generated, never hand-edited
  api/                          @ats/api — Fastify service
    src/routes/                 public and authenticated handlers
    src/db/schema/              Drizzle schema
    drizzle/                    generated SQL migrations
packages/
  contracts/                    @ats/contracts — Zod schemas and inferred types
  config/                       @ats/config — non-secret names and defaults
context/
  canonical/                    factual source of truth + publication controls
  assets/                       classified imagery and brand rasters
  extracted/                    structured extraction records
  reference/                    recorded layout and geometry specifications
project/                        architecture, deployment and policy documents
scripts/                        content generation, verification, build tooling
render.yaml                     Render Blueprint (contains no secrets)
```

---

## Local development

### Prerequisites

- **Node.js** `>=20.9.0` — the Blueprint pins `24.11.1`
- **npm** `>=10`

### Install

```bash
npm.cmd install
```

> On Windows, use `npm.cmd` when PowerShell's execution policy blocks `npm.ps1`. On macOS and Linux use plain `npm`.

### Run

```bash
npm.cmd run dev          # public site   → http://localhost:3000
npm.cmd run dev:api      # API           → http://localhost:3001
```

The public site runs fully without the API. `GET /health` returns exactly `{"status":"ok"}` even with no database configured.

### Content

Regenerate and re-verify after editing anything under `context/canonical/`:

```bash
npm.cmd run content:generate
npm.cmd run content:check
```

### Database (local files only)

```bash
npm.cmd run db:generate    # generate migrations from the schema
npm.cmd run db:check       # validate migrations against the schema
```

Do **not** run `npm.cmd run db:migrate` until a real `DATABASE_URL` is provisioned.

---

## Validation

One command gates everything:

```bash
npm.cmd run verify
```

It runs, in order, and stops at the first failure:

1. `content:check` — public-content freshness and leak scan
2. `content:compile-publication:test` — publication compiler check
3. `lint` — ESLint
4. `typecheck` — `tsc --noEmit` across all workspaces
5. `test` — the full Vitest suite
6. `db:check` — Drizzle schema/migration validation
7. `build:api` — API production build
8. `build:web` — Next.js static export

> **Known flake:** Vitest runs with `maxWorkers: 4` and a 5 s default timeout. Under heavy parallel load `apps/api/tests/inquiries.test.ts` can exceed it while passing in roughly 350 ms on its own. Re-run that file alone before treating it as a regression.

---

## Build and output

```bash
npm.cmd run build:web
```

Static output is written to:

```
apps/web/out/
```

That directory is what Render publishes. It is generated, and is not committed.

> `scripts/build-web.mjs` (used by `build:web`) is a **Windows-only** local helper — it shells out to `cmd.exe` and `mklink` to work around locked `.next` caches. Render must call `next build` directly, which is exactly what `render.yaml` does.

---

## Environment variables

### Static site — browser-safe only

Both are **inlined into the client bundle at build time**, so changing either requires a rebuild and redeploy of the static site.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | For the inquiry form | Origin only, no path — e.g. `https://ats-api.onrender.com`. Empty ⇒ the form shows its honest unavailable state. |
| `NEXT_PUBLIC_NEON_AUTH_BASE_URL` | For `/walter/` sign-in | Neon Auth browser base URL; a documented path such as `/neondb/auth` is permitted. Username, password, query and fragment are rejected. Empty ⇒ sign-in unavailable. |

Nothing else may be added to the static site. Everything in that service reaches the browser.

### API — server only

| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | Yes | `production` on Render |
| `HOST` | Yes | `0.0.0.0` |
| `PORT` | Supplied by Render | Do **not** set it yourself |
| `CORS_ORIGINS` | Yes | Comma-separated exact origins. A wildcard is rejected when `NODE_ENV=production` |
| `DATABASE_URL` | For persistence | Neon pooled connection string. Absent ⇒ `POST /inquiries` returns `503` |
| `INQUIRY_RATE_LIMIT_MAX` | No | Default `5` |
| `INQUIRY_RATE_LIMIT_WINDOW` | No | Default `900000` ms |
| `TRUST_RENDER_CLIENT_IP` | No | Default `false`. Set `true` only behind Render/Cloudflare |
| `MANAGEMENT_AUTH_ENABLED` | For `/walter/` | Literal `"true"` / `"false"`, default `false` |
| `NEON_AUTH_JWKS_URL` | When auth enabled | JWKS URL, **HTTPS in production** |
| `NEON_AUTH_ISSUER` | When auth enabled | Exact expected `iss`, **HTTPS in production** |
| `NEON_AUTH_AUDIENCE` | When auth enabled | Exact expected `aud`; no silent default |
| `NEON_AUTH_JWT_ALGORITHMS` | When auth enabled | Comma-separated asymmetric list; no silent default |
| `WALTER_ADMIN_USER_IDS` | When auth enabled | Comma-separated JWT `sub` values; at least one; values containing `@` are rejected |

Allowed algorithms: `ES256`, `ES384`, `ES512`, `RS256`, `RS384`, `RS512`, `PS256`, `PS384`, `PS512`, `EdDSA`. `none` and every `HS*` algorithm are rejected.

Declared in the Blueprint but **not yet implemented** — setting them has no effect today: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`, `RESEND_API_KEY`, `INQUIRY_NOTIFICATION_TO`, `STATIC_SITE_DEPLOY_HOOK_URL`.

Templates: [`apps/web/.env.example`](apps/web/.env.example), [`apps/api/.env.example`](apps/api/.env.example). Every secret value in them is intentionally empty.

---

## Deploying to Render

[`render.yaml`](render.yaml) is a Blueprint defining two services. It contains **no secrets** — every sensitive value is marked `sync: false` and must be entered by hand in the dashboard.

| Service | Type | Build | Serves |
| --- | --- | --- | --- |
| `ats-public-web` | Static Site | `npm ci && npm run content:check && npm run build --workspace=@ats/web` | `apps/web/out` |
| `ats-api` | Web Service (Node, `0.5c-512mb`) | `npm ci && npm run build --workspace=@ats/api` | `node apps/api/dist/server.js`, health check `/health` |

Content validation runs **before** the static build, so a stale or leaking public snapshot fails the deploy rather than shipping.

### Sequence

1. In Render, choose **New → Blueprint** and point it at this repository. It will detect `render.yaml`.
2. Render prompts for every `sync: false` value. Leave the unimplemented ones blank.
3. Deploy `ats-public-web` first. **It deploys and works with no database and no API** — only the inquiry form is inert.
4. Deploy `ats-api`. It starts and serves `/health` even with no `DATABASE_URL`.
5. Set `CORS_ORIGINS` on the API to the static site URL.
6. Set `NEXT_PUBLIC_API_BASE_URL` on the static site to the API URL, then **redeploy the static site** so the origin is inlined.

Steps 5–6 are mutually dependent by design: each service needs the other's public URL, which only exists after its first deploy.

---

## Neon PostgreSQL setup

Enables inquiry persistence and management storage. It does **not** by itself enable `/walter/` login.

1. Create a Neon project and database.
2. Copy the **pooled** connection string.
3. Set it as `DATABASE_URL` on `ats-api`.
4. Apply the migrations in `apps/api/drizzle/` to that database.

Until `DATABASE_URL` is set, `POST /inquiries` returns `503` and the public form displays its unavailable message. The rest of the website is unaffected.

---

## Neon Auth setup

> **A Neon database connection string alone does not enable secure `/walter/` login.** Authentication is entirely separate from `DATABASE_URL`.

Sign-in requires configuration on **both** services:

**Static site**

- `NEXT_PUBLIC_NEON_AUTH_BASE_URL` — the Neon Auth browser base URL. Then redeploy, because it is inlined at build time.

**API** — all five, plus the flag:

- `MANAGEMENT_AUTH_ENABLED=true`
- `NEON_AUTH_JWKS_URL`
- `NEON_AUTH_ISSUER`
- `NEON_AUTH_AUDIENCE`
- `NEON_AUTH_JWT_ALGORITHMS`
- `WALTER_ADMIN_USER_IDS` — the Neon Auth **user IDs** (`sub` claims) permitted to administer. These are opaque subject identifiers, not email addresses; values containing `@` are rejected.

Enabling the flag with incomplete configuration **fails environment validation and the API will not start**. While the flag is `false`, `GET /management/session` returns `503` and `/walter/` cannot be signed into — public inquiry submission is unaffected.

Authorisation is *only*: valid signature, allowed asymmetric algorithm, `exp`/`nbf`, exact issuer, exact audience, and a non-empty `sub` present in the allowlist. A token claiming `role: "administrator"` whose `sub` is not allowlisted is rejected with `403`.

---

## Inquiry form requirements

For `/contact/` to submit successfully:

1. `ats-api` deployed and awake.
2. `DATABASE_URL` set on the API — otherwise `503`.
3. `CORS_ORIGINS` on the API includes the static site origin.
4. `NEXT_PUBLIC_API_BASE_URL` set on the static site **at build time**, then redeployed.

If any is missing the form fails safely: it stays on `/contact/` and shows a canonical notice. It never fabricates success. A verified `201` navigates to `/thank-you/`.

Rate limiting defaults to 5 submissions per 15 minutes per client identity. Set `TRUST_RENDER_CLIENT_IP=true` on Render so limits key on the forwarded client IP.

---

## `/walter/` requirements

`/walter/` being absent from public navigation **is not access control**. It is a static HTML page; anyone who knows the URL can load the sign-in form. Loading it grants no data.

The gate is `GET /management/session` on the API. Everything protected sits behind Fastify, reached only with a bearer token whose `sub` is allowlisted.

To make it usable you need, in addition to the database: the Neon Auth browser URL on the static site, and the full JWKS / issuer / audience / algorithms / administrator-subject allowlist on the API, with `MANAGEMENT_AUTH_ENABLED=true`. See [Neon Auth setup](#neon-auth-setup).

Access tokens are held in React memory only — never in `localStorage`, `sessionStorage`, URLs, logs or generated HTML.

---

## Security and secret handling

- **Never put a secret in `render.yaml`, in this README, or in any `NEXT_PUBLIC_*` variable.** Everything on the static site reaches the browser.
- Database URLs, JWKS/issuer/audience settings, administrator IDs, R2 keys, Resend keys and deploy-hook URLs stay on the API service only.
- `.env` and `.env.*` are gitignored; only `.env.example` templates with empty values are committed.
- The public build runs a **leak scan** asserting that source-document filenames and private paths never appear in generated public output.
- Administrator IDs are never logged and never exposed to the browser.
- Bearer tokens are rejected in query parameters and cookies, and are never logged.
- Uploaded media must never be stored in Neon or on Render's ephemeral filesystem.
- No PDF is tracked in this repository. The original ATS source documents are archived outside it.

---

## Current limitations

Honest statement of what is **not** built yet:

- **No R2 upload.** The `R2_*` variables are declared for stability but no storage path exists.
- **No Resend notifications.** No email is sent when an inquiry arrives; read them in `/walter/`.
- **No live content-publication deploy hook.** Preparing a publication in `/walter/` writes to API storage and transactionally records it, but does **not** alter the public static export or trigger a Render rebuild. Publishing to the live site is still a manual redeploy.
- **File attachments are not uploaded.** The contact form validates attachment metadata client-side, but file bytes are never sent; the API answers attachment metadata with `422`.

The API and `/walter/` are **not operational** until their database and authentication variables are configured. The public website is fully operational without either.

---

## Deployment checklist

- [ ] `npm.cmd run verify` passes locally
- [ ] Blueprint applied in Render from `render.yaml`
- [ ] `ats-public-web` deployed — public pages, images and portfolio all render
- [ ] `ats-api` deployed — `GET /health` returns `{"status":"ok"}`
- [ ] Neon project created, migrations applied
- [ ] `DATABASE_URL` set on `ats-api`
- [ ] `CORS_ORIGINS` on `ats-api` set to the static site URL
- [ ] `NEXT_PUBLIC_API_BASE_URL` set on `ats-public-web`, **static site redeployed**
- [ ] Contact form submits and reaches `/thank-you/`
- [ ] *(Optional, for `/walter/`)* Neon Auth configured; `NEXT_PUBLIC_NEON_AUTH_BASE_URL` set and redeployed; all five API auth variables set; `MANAGEMENT_AUTH_ENABLED=true`
- [ ] No secret committed to the repository

---

## Documentation

| Document | Covers |
| --- | --- |
| [ARCHITECTURE.md](project/ARCHITECTURE.md) | Repository shape, data flow, API foundation |
| [DECISIONS.md](project/DECISIONS.md) | Locked hosting, visual and organisational decisions |
| [LOCAL-DEVELOPMENT.md](project/LOCAL-DEVELOPMENT.md) | Toolchain, every command, what not to run |
| [DEPLOYMENT-PLAN.md](project/DEPLOYMENT-PLAN.md) | Render deployment sequence |
| [DATABASE-SCHEMA.md](project/DATABASE-SCHEMA.md) | Drizzle tables and migration policy |
| [AUTHENTICATION.md](project/AUTHENTICATION.md) | Neon Auth and the `/walter/` gate |
| [CONTENT-MANAGEMENT.md](project/CONTENT-MANAGEMENT.md) | Drafts, versioning, prepared publications |
| [PUBLICATION-POLICY.md](project/PUBLICATION-POLICY.md) | What may become public, and how |
| [PRIVACY-AND-LOGGING.md](project/PRIVACY-AND-LOGGING.md) | Privacy-safe logging rules |
| [INQUIRY-API-CONTRACT.md](project/INQUIRY-API-CONTRACT.md) | The inquiry contract, server side |
| [INQUIRY-FRONTEND-CONTRACT.md](project/INQUIRY-FRONTEND-CONTRACT.md) | The inquiry contract, browser side |
| [SOURCE-CONTROL-POLICY.md](project/SOURCE-CONTROL-POLICY.md) | What is committed, ignored, or archived |
| [BRAND-ASSET-REPORT.md](project/BRAND-ASSET-REPORT.md) | How the logo derivatives were produced |
| [PROGRESS.md](project/PROGRESS.md) | Build history |

---

## Ownership

© Active Technical Services. All rights reserved.

This repository is private company property and is published under no open-source licence (`"license": "UNLICENSED"`). The ATS name, the *Gift of God* mark, the logo files and all company photographs are the property of Active Technical Services and may not be reused.
