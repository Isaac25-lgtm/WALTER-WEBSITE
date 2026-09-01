# Local development

## Toolchain (this machine)

- Node.js **v24.11.1** (Next.js 16 requires `>=20.9.0`)
- npm **11.6.2**. On this Windows setup, use `npm.cmd` when PowerShell execution policy blocks `npm.ps1`.
- The authoritative workspace root is `F:\MY FILES\DATA SCIENCE\WALTER'S WEBSITE`. Do not create a substituted drive.

Do not install Node.js system-wide from this project.

## Install

From the repository root:

```bash
npm.cmd install
```

If a terminal is not already on the real `F:` path, run:

```bash
node scripts/run-in-workspace.mjs install
```

This creates `node_modules/` and `package-lock.json`. Internal `@ats/*` links must resolve inside the `F:` workspace.

## Public site

```bash
npm.cmd run dev
```

or `npm.cmd run dev:web`.

Default Next.js dev URL is http://localhost:3000. Trailing slashes are enabled (`/contact/`).

Regenerate public content after canonical or publication-control edits:

```bash
npm.cmd run content:generate
npm.cmd run content:check
```

Static export (used by Render later):

```bash
npm.cmd run build:web
```

Output: `apps/web/out/`. Preview with any static file server. `next start` is not the production path for this app. The public site does **not** require the API to be running. Inquiry submission needs `NEXT_PUBLIC_API_BASE_URL` at **web build time** (for example `http://127.0.0.1:3001`) plus a running API. With an empty origin the form stays on `/contact/` and shows the unavailable message. Without `DATABASE_URL` a configured origin receives **503**.

Copy `apps/web/.env.example` locally if you need to set the public API origin for `next dev`. Do not put secrets in `NEXT_PUBLIC_*` variables.

## API (optional)

```bash
npm.cmd run dev:api
```

Production-style start after `npm.cmd run build:api`:

```bash
set NODE_ENV=development
set HOST=127.0.0.1
set PORT=3001
set CORS_ORIGINS=http://localhost:3000
node apps/api/dist/server.js
```

- http://localhost:3001/health → `{"status":"ok"}`
- `POST /inquiries` persists through a repository when `DATABASE_URL` is set. Without a database it returns **503**. The public form posts JSON here when the web build has `NEXT_PUBLIC_API_BASE_URL` set to this origin.
- Rate limits: `TRUST_RENDER_CLIENT_IP` defaults to **false**. Local/test traffic uses the socket address. Do not set this to `true` unless the process sits behind Render/Cloudflare and you intend to key limits on `CF-Connecting-IP` only.
- `MANAGEMENT_AUTH_ENABLED` defaults to **false**. Public `POST /inquiries` and `GET /health` start without Neon Auth configuration.
- `GET /management/session` returns **503** `management_auth_unavailable` until management auth is enabled with JWKS, issuer, audience, explicit asymmetric algorithms, and `WALTER_ADMIN_USER_IDS`. Tests inject an `AuthVerifier`; they do not put a public JWK into production environment parsing. `GET /session` returns **404**.
- Authenticated inquiry inbox routes: `GET /management/inquiries`, `GET /management/inquiries/:id`, `PATCH /management/inquiries/:id/status`. `PATCH /management/inquiries/:id` returns **404**. List queries accept only `status`, `cursor`, and `limit`. There is no inquiry delete and no public inquiry read.
- Authenticated content-draft routes: `GET /management/content/drafts`, `GET /management/content/drafts/:key`, `PUT /management/content/drafts/:key`, `POST /management/content/drafts/:key/reset`. Saves require `{ value, expectedVersion }`. Retired `/management/content-drafts*` routes return **404**. Saved drafts do not change the public static export.
- Authenticated local publication routes: `GET /management/content/publications`, `GET /management/content/publications/:id`, `POST /management/content/publications/prepare`. Prepare is one transactional operation. Listed keys must use draft versions **≥ 1**; omitted keys stay canonical. Version `0` is rejected. Retired `/management/content/snapshots*` and `POST /management/content/publish` return **404**. These do not invoke a Render deploy hook.

Copy `apps/api/.env.example` to `apps/api/.env` only if you need local overrides. Do not put real Neon/R2/Resend values in this prompt.

Optional rate-limit names: `INQUIRY_RATE_LIMIT_MAX` (default 5), `INQUIRY_RATE_LIMIT_WINDOW` (default 900000 ms), `TRUST_RENDER_CLIENT_IP` (default `false`).

`/walter/` is served by the static site (`http://localhost:3000/walter/`). Sign-in requires `NEXT_PUBLIC_NEON_AUTH_BASE_URL` at web build/dev time. Leave it empty for the honest unavailable state. See `project/AUTHENTICATION.md`.

Database commands (local files only until Neon exists):

```bash
npm.cmd run db:generate
npm.cmd run db:check
```

Do not run `npm.cmd run db:migrate` until a real `DATABASE_URL` is provisioned in a later prompt.

## Quality commands

```bash
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run verify
```

`verify` runs content check, lint, typecheck, tests, API production build, then the web static build. A failed step fails the whole command.

Vitest is capped at **4** workers (`maxWorkers: 4`, file isolation retained, default timeout 5s). The ES256 management-auth tests use a 15s timeout only because key generation is expensive. Run the suite three times after worker changes before treating it as deterministic.

To prove `NEXT_PUBLIC_API_BASE_URL` inlining without changing the official export:

```bash
node scripts/prove-public-api-inlining.mjs
```

That command builds a temporary copy with `https://api.example.test`, confirms the origin in the browser bundle, intercepts a Contact submit, then deletes only the temporary copy. The official `apps/web/out` remains the empty-origin export.

## What not to run here

- Git init
- `npm.cmd run db:migrate` / `drizzle-kit push` against a live database
- Render deploy
- Cloudflare or Resend provisioning
- Copying PDFs, extracts, or reference screenshots into `apps/web/public/`
