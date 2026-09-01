# Deployment plan

This is a **blueprint**. Prompt 5 does not deploy, create cloud accounts, or store secrets.

## Target topology

1. **Render Static Site** — `ats-public-web`
   - Build from the workspace root: `npm ci && npm run content:check && npm run build --workspace=@ats/web`
   - Publish: `apps/web/out`
   - Node version: 24.11.1
   - Browser-safe env only: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_NEON_AUTH_BASE_URL` (`sync: false`)

2. **Render Web Service** — `ats-api`
   - Plan: **free**
   - Build: `npm ci && npm run build --workspace=@ats/api`
   - Start: `node apps/api/dist/server.js` (compiled JavaScript; not `tsx`)
   - Health: `GET /health`
   - `HOST=0.0.0.0`, `NODE_ENV=production`
   - Do not manually require `PORT`; Render supplies it
   - Future server-only names with `sync: false`: `CORS_ORIGINS`, `DATABASE_URL`, Neon Auth, R2, Resend, deploy-hook URL
   - Inquiry rate-limit defaults may be set as non-secret values: `INQUIRY_RATE_LIMIT_MAX`, `INQUIRY_RATE_LIMIT_WINDOW`, `TRUST_RENDER_CLIENT_IP=true`
   - Fastify does **not** enable global `trustProxy`. When `TRUST_RENDER_CLIENT_IP=true`, inquiry rate limits use a single validated `CF-Connecting-IP` and ignore `X-Forwarded-For`. The in-memory limiter is for one free instance only.
   - Management auth stays off until provisioned: `MANAGEMENT_AUTH_ENABLED=false`. JWKS, issuer, audience, algorithms, and `WALTER_ADMIN_USER_IDS` remain `sync: false`. Do not put a public JWK, cookie secret, or administrator email in the blueprint.

3. **Neon PostgreSQL + Neon Auth** — not provisioned in this prompt. Local Drizzle schema and migration SQL exist under `apps/api/drizzle/` and have **not** been applied remotely.

4. **Cloudflare R2** — public project media vs private inquiry attachments, later.

5. **Resend** — inquiry notifications, later.

`render.yaml` at the repo root describes this split. Applying the Blueprint in the Render dashboard is **out of scope**.

## Publish workflow (later)

Draft in Neon → local `/walter/` preview → later publish snapshot → API calls the Render **deploy hook** (server-side) → static site rebuilds. A saved content draft must **not** silently alter the public static export. The public site never holds the hook URL.

## Free-tier constraints

- The API may sleep. Static HTML must still load.
- Do not store media in Neon or on Render’s ephemeral disk.
- Recheck free-tier limits before production.

## Checklist before first production deploy (not this prompt)

- [ ] Git remote and source-control decisions in `SOURCE-CONTROL-POLICY.md`
- [ ] Secrets only on the API service
- [ ] `NEXT_PUBLIC_API_BASE_URL` points at the API origin
- [ ] Visual pages implemented against `context/reference/`
- [ ] Publication-review assets only in `apps/web/public/` or the static export
- [ ] No Metalworks identity
- [ ] `/walter` not linked from the public site (the static route may exist; it is not a nav item and is not access control)
