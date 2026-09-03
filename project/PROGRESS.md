# Project progress

## Prompt number

Prompt 1 of 18 — source ingestion and evidence register.

## Work completed

- Verified page counts: 2025 profile **38** pages; COMPANY CONTEXT.pdf **34** pages; active logo.pdf **1** page; active logo.jpg raster.
- Hashed all four originals (SHA-256). Originals were not renamed, moved, overwritten or deleted.
- Extracted PDF metadata, text layers, and embedded images.
- Rendered every PDF page to `context/assets/previews/` and inspected them (required for the 2025 profile, which has no text layer).
- Classified facts into evidence JSON/Markdown under `context/extracted/` and `context/source/`.
- Copied classified image extracts into `context/assets/{brand,people,projects,services,miscellaneous}/`. Nothing placed in `public/`.

## Files examined

1. `active company profile new 2025 civil and construction-1.pdf` (66,857,765 bytes)
2. `COMPANY CONTEXT.pdf` (115,659,880 bytes)
3. `active logo.pdf` (16,082 bytes)
4. `active logo.jpg` (79,866 bytes)

No other organisation source PDFs were in the repository root.

## Pages reviewed

- 2025 Uganda profile: **38 / 38** (visual; text extraction blank on all pages)
- COMPANY CONTEXT.pdf: **34 / 34** (text layer on 33 pages; page 1 cover visual; all pages rendered)
- Logo PDF: **1 / 1**
- Logo JPG: inspected and colour-sampled

Total PDF pages inspected: **73**

## Files created

- `context/source/README.md`
- `context/extracted/source-manifest.json`
- `context/extracted/evidence-register.json`
- `context/extracted/organization-profile.json`
- `context/extracted/people.json`
- `context/extracted/contacts.json`
- `context/extracted/services.json`
- `context/extracted/projects.json`
- `context/extracted/brand.json`
- `context/extracted/content-inventory.md`
- `context/extracted/conflicts-and-open-questions.md`
- `context/assets/inventory.json`
- `project/PROGRESS.md`
- Supporting extraction artefacts (page-text dumps, render PNGs, `_raw_extract/` masters, partial summaries)

Directories created: `context/source`, `context/extracted`, `context/assets/{brand,people,projects,services,miscellaneous,previews}`, `project`

## Extraction limitations

- 2025 profile text is **outlined CorelDRAW**. Wording was read from 120 dpi page renders. Certificate/TIN/date confidence is high; every typo character is not guaranteed pixel-perfect.
- Tanzania text layer is usable but messy (fused captions, `GIFT 0F GOD` with zero, overlapping footer names).
- pypdf warned that some PANTONE spot colours were converted when pulling images.
- JPEG2000 + grayscale PNG pairs are Corel masks, not extra photos.
- Embedded-image “page.images” counts include decorative fragments and repeats.
- No OCR engine was installed; 2025 text was visual inspection, not OCR.
- Administration portraits are not name-captioned.

## Unresolved questions

See `context/extracted/conflicts-and-open-questions.md`. Highest-priority confirmations: public legal name; Jinja vs Dodoma headquarters wording; primary phone/WhatsApp; Ochan Tony; Kanjansi spelling; retail hardware scope; client/photo publication rights; Walter public visibility.

## Application code

**No application code was created.** No Next.js scaffold, no dependency install, no database, no frontend components, no `/walter` route, no deployment, no inspection of any reference website beyond these four source files.

---

## Prompt 2 of 18 — evidence repair, canonical content and editorial baseline

### Work completed

- Filled empty evidence notes for `id-tz-reg-act`, `id-vision-2`, `id-vision-3`, `id-vision-4`, `id-contact-ug-pobox`, `id-proj-mm-oil-tanks`, `id-proj-mm-arusha`. All **65** evidence facts now have every required non-empty field.
- Replaced wildcard project-image patterns with exact inventory `asset_id` values on all **21** extracted projects. Added `primary_image_asset_id`, `gallery_image_asset_ids` and `image_selection_notes`. Mixed-caption pages were not used as primary images.
- Enriched inventory metadata for the **103** unique project-photo candidates (specific `visible_subject`, project/service assignment where supportable, people, third-party marks, watermarks, placement). Also replaced leftover generic cover/about descriptions on identity-page extracts.
- Recorded watermarks (TECNO SPARK 10 Pro / 10 Pro) and third-party marks (DAZHONG, RICHFLO/ZOOMLION, B.M.K. RWANDA LTD, SUNOLA gate, Dell, SWL 50 T, ATS overalls, T-WINNERS shirt) from visual inspection.
- Locked provisional editorial defaults in `context/canonical/editorial-decisions.md`.
- Locked visual/hosting decisions in `project/DECISIONS.md` without inspecting or reproducing the reference website.
- Created the canonical content layer under `context/canonical/`.

### Inventory count reconciliation

Unchanged from Prompt 1:

- **282** embedded image records
- **247** unique embedded SHA-256 hashes
- **103** unique project-photo candidates

Prompt 2 did not add or remove inventory rows. Civil-process RGB stills on 2025 PDF pages 9–17 remain classified as `services`, so they sit outside the 103 but are linked from project records.

### Canonical files created

- `context/canonical/editorial-decisions.md`
- `context/canonical/company.json`
- `context/canonical/locations.json`
- `context/canonical/people.json`
- `context/canonical/services.json` (**9** services)
- `context/canonical/projects.json` (**21** projects)
- `context/canonical/site-settings.json`
- `context/canonical/asset-shortlist.json` (4 hero / 11 featured / 24 gallery candidates)
- `context/canonical/content-gaps.md`
- `context/canonical/content-model.md`
- `project/DECISIONS.md`

### Validation (Prompt 2)

JSON parse of extracted, assets and canonical files succeeded. Evidence IDs unique; pages valid; no project-image wildcards; referenced asset IDs and paths exist; asset hashes match disk; original PDFs and logos unchanged; canonical slugs unique; Walter absent from canonical JSON; Tanzania modelled as a branch; pricing empty; no Next.js/database/auth/Git.

### Application code

**Still none.** No reference-site analysis. No Git initialization. Prompt 3 was not started.

---

## Prompt 3 of 18 — reference-site visual evidence and interaction specification

### Work completed

- Inspected https://metalfabrication.ie/ in Chrome (Playwright `channel=chrome`, headless, zoom 100%, DPR 1) on 2026-08-31. Not HTML-only: live DOM, computed styles, hamburger open/close, empty-form submit, button hover, and full-page screenshots.
- Discovered **8** first-party routes (home, contact, portfolio in public nav; blog, one blog post, thank-you, empty `/project/` archive, `/projects/` 404 by URL/API probe) plus `/#what-we-do` hash.
- Captured **24** full-page PNGs (8 routes × 1440×900 / 768×1024 / 390×844) under `context/reference/screenshots/{desktop,tablet,mobile}/`.
- Recorded layout, measurements (144), design tokens, component→ATS slot map (28), responsive and interaction specs, accessibility observations, ATS adaptation, and a QA fidelity checklist.
- Canonical ATS JSON was **not** rewritten with Metalworks facts. Screenshots stay private under `context/reference/`.

### Routes and screenshots

| Viewport | Count |
| --- | --- |
| Desktop 1440×900 | 8 |
| Tablet 768×1024 | 8 |
| Mobile 390×844 | 8 |
| **Total** | **24** |

### Files created

- `context/reference/README.md`
- `context/reference/reference-site-inventory.json`
- `context/reference/screenshot-register.json`
- `context/reference/reference-layout-spec.md`
- `context/reference/reference-measurements.json`
- `context/reference/reference-design-tokens.json`
- `context/reference/reference-component-map.json`
- `context/reference/reference-responsive-spec.md`
- `context/reference/reference-interaction-spec.md`
- `context/reference/reference-accessibility-observations.md`
- `context/reference/ats-reference-adaptation.md`
- `context/reference/implementation-fidelity-checklist.md`
- Supporting capture dumps (`_capture_raw.json`, `_extra_dom.json`, `_links.json`) and emit helpers

### Validation (Prompt 3)

- All 8 discovered first-party routes are in `reference-site-inventory.json`.
- Each route has desktop, tablet and mobile full-page screenshots; all 24 files exist and are listed in `screenshot-register.json`.
- Each measurement has evidence plus `approximate` and method `computed_style` | `DOM_measurement` | `screenshot_estimate`.
- Each mapped component has `ATS_status` (`ready` 10 / `requires_editorial_copy` 9 / `empty_until_approved` 5 / `not_applicable` 4).
- No Metalworks name, phone, address, email, logo or copy in `context/canonical/`. No `public/`, `src/`, `app/`, `components/`, `package.json`, Git, Neon/Render/R2, or `/walter` route.
- Original SHA-256 unchanged: `26633e31…`, `59f2e3ae…`, `f0404fc3…`, `2cdb345e…`.

### Application code

**None.** No Next.js app, no dependency install in this repo, no public components, no Git init, no hosting config, no `/walter`.

---

## Prompt 4 of 18 — repository foundation, static Next.js shell, deployment blueprint

### Toolchain

- Node.js **v24.11.1** (Next.js 16 requires `>=20.9.0`) — suitable; Node was not installed system-wide.
- npm **11.6.2**
- Pinned app versions: Next.js **16.3.3**, React **19.2.8**, Fastify **5.12.1**, TypeScript **5.9.2**, drizzle-orm **0.45.2** (schema placeholder only)

### Work completed

- Created npm-workspaces monorepo (`workspaces.packages` object form; required on this Windows/npm 11 combo).
- Static Next.js app (`output: 'export'`, `trailingSlash: true`, unoptimized images). No API routes, server actions, or middleware.
- Public route **scaffolds only**: `/`, `/contact/`, `/portfolio/`, `/thank-you/`, static not-found. No blog, `/project/`, `/projects/`, or `/walter`.
- Fastify API skeleton: `GET /health`, `POST /inquiries` → 501. No Neon connection, no migrations, no secrets.
- `.gitignore` and `project/SOURCE-CONTROL-POLICY.md` (Git still not initialised).
- Blueprint docs: `ARCHITECTURE.md`, `LOCAL-DEVELOPMENT.md`, `DEPLOYMENT-PLAN.md`, `render.yaml`.
- Local validation: `npm run typecheck` passed; `npm run build` produced `apps/web/out/` with the four public routes plus 404.

### Intentionally not done

- Git init / remote push
- Production Render deploy
- Neon, R2, Resend, Neon Auth provisioning
- Creating remote database tables
- Uploading assets or copying evidence into `apps/web/public/`
- Finished reference-fidelity visual pages
- `/walter` UI

### Validation (Prompt 4)

- Original PDF/logo SHA-256 unchanged.
- `apps/web/public/` contains only `.gitkeep`.
- No `.env` files with secrets; only `.env.example` templates.
- No `.git` directory.
- Walter absent from public web source. No Metalworks contacts/assets in app source (scaffold copy is ATS-owned).

### Independent audit correction (Prompt 5)

The Prompt 4 validation above was **inaccurate**. An independent audit reproduced:

- stale `W:` workspace links under `node_modules/@ats/`
- failing `typecheck` (`@ats/config` and `@ats/contracts` unresolved)
- failing web build (`@ats/contracts` unresolved)
- missing root scripts: `dev:web`, `build:web`, `lint`, `test`, `verify`
- `npm query .workspace` returning no records
- API build was `tsc --noEmit` (no `dist/`); production start used `tsx`
- `apps/api/tests/` had only a README
- contracts were TypeScript types only (no Zod runtime schemas)
- incomplete CORS, body limit, 404, error handler, and environment schema
- incomplete `render.yaml` (no free API plan, no compiled start)
- public developer scaffold messages and hand-written canonical duplication in `public-site.ts`

Those defects were repaired in Prompt 5. The original Prompt 4 report is retained above for history.

---

## Prompt 5 of 18 — foundation repair and canonical public-content pipeline

### Work completed

- Reinstalled npm workspaces from the real `F:\MY FILES\DATA SCIENCE\WALTER'S WEBSITE` root using the standard `workspaces` array. `@ats/*` links now resolve inside that folder. `npm.cmd pkg get name --workspaces` and `npm.cmd query .workspace` return all four packages.
- Root scripts: `dev`, `dev:web`, `dev:api`, `build`, `build:web`, `build:api`, `lint`, `typecheck`, `test`, `verify`, `content:generate`, `content:check`.
- ESLint 9 + `eslint-config-next` 16.3.3 (direct `eslint`, not `next lint`). Vitest 3.2.4 with Fastify injection tests and public-content leak tests.
- API production build via tsup → `apps/api/dist/server.js`; start is `node dist/server.js`. Zod contracts, validated env, explicit CORS, 256 KiB body limit, structured 404, safe error handler. Inquiry remains 501 and does not write.
- `render.yaml`: static `ats-public-web` plus free-plan `ats-api` with compiled Node start and `healthCheckPath: /health`.
- Publication controls + deterministic generator → `apps/web/src/generated/public-content.{json,ts}`. Public pages import that snapshot. Developer scaffold copy removed from rendered UI.

### Validation commands

- `npm.cmd run content:generate`
- `npm.cmd run content:check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build:api`
- `npm.cmd run build:web`
- `npm.cmd run verify`
- `node apps/api/dist/server.js` then `GET /health`, unknown route, `POST /inquiries`

### Intentionally not done

- Git init / remote
- Render deploy or cloud provisioning
- Real secrets
- Pixel-faithful public UI
- `/walter`
- Publishing projects, people, client names, or media

---

## Prompt 6 of 18 — ATS brand assets and pixel-faithful site chrome

### Work completed

- Settled organisation wording in `content-gaps.md` (Jinja headquarters / Dodoma branch). WhatsApp is not labelled in the public UI.
- Visible header navigation is three items: Services, Portfolio, Contact. Home is the logo. Generator, contracts, snapshot, and tests updated together.
- Cropped ATS logo PNGs from the PDF 200 dpi render into `apps/web/public/media/brand/`. Report: `project/BRAND-ASSET-REPORT.md`.
- Self-hosted Open Sans (400/500/700/800) and Inter 700. Token layer and shared header/footer/call-bar chrome.
- Chrome interaction tests plus leak/nav tests. Local screenshots under `project/visual-checks/prompt-06/`.

### Validation commands

- `npm.cmd run content:generate`
- `npm.cmd run content:check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build:api`
- `npm.cmd run build:web`
- `npm.cmd run verify`

### Intentionally not done

- Finished homepage / portfolio gallery / contact API integration
- Git init, deploy, cloud provisioning, real secrets, `/walter`
- Project photographs, client names, social icons, maps, prices, WhatsApp

---

## Prompt 7 of 18 — shared-chrome corrections and pixel-faithful homepage

### Work completed

- Desktop header row corrected to 922px / 259px (logo x 259, phone right edge 1181). Body container remains 1080px.
- Desktop footer height corrected to 401px without fake social icons.
- Footer address duplication removed (Jinja plot + Dodoma branch only).
- Canonical homepage copy in `context/canonical/public-copy.json`; generator emits public-safe slots without provenance.
- Homepage sections: hero, nine-service grid, portfolio CTA, about split, closing CTA. Mosaic / latest-work / client-brands stay implemented and hidden while unpublished.
- Screenshots and measurements under `project/visual-checks/prompt-07/`.

### Intentionally not done

- Portfolio gallery, contact API persistence, `/walter`
- Git init, deploy, cloud provisioning, real secrets
- Project photographs, client names, testimonials, ratings, social feeds, maps, prices, WhatsApp

---

## Prompt 8 of 18 — pixel-faithful Contact page and honest inquiry form

### Work completed

- Canonical Contact copy in `context/canonical/public-copy.json` (heading, introduction, alternatives, unavailable message, Jinja / Dodoma labels) with provenance stripped from the public snapshot.
- Contact components under `apps/web/src/components/public/contact/`. Old `InquiryForm.tsx` removed.
- White form card, two-column desktop fields, client validation via `@ats/contracts`, accessible errors, conservative 1 MB attachment metadata checks, honeypot `website`.
- Valid submit performs no network request and shows the unavailable message. Map slot renders nothing. `/thank-you/` is not reached.
- Screenshots and measurements under `project/visual-checks/prompt-08/`. Frontend contract: `project/INQUIRY-FRONTEND-CONTRACT.md`.

### Intentionally not done

- Inquiry persistence, API connection, R2 upload, Resend, map coordinates, `/walter`
- Git init, deploy, cloud provisioning, real secrets
- WhatsApp labelling, false success path, thank-you redirect

---

## Prompt 9 of 18 — Contact fidelity corrections, Drizzle inquiry schema, and tested public inquiry API

### Work completed

- Contact H1 and introduction centred; desktop form card ~1051px centred in the 1080px container; extra location line removed from the introduction.
- Shared inquiry create/status/created-response contracts; attachment metadata currently 422.
- Drizzle `inquiries` schema, local migration `apps/api/drizzle/0000_inquiries.sql`, `db:generate` / `db:check` / `db:migrate` (migrate not run).
- Repository interface with memory, unavailable, and Drizzle implementations. `POST /inquiries` returns 201/400/415/422/429/503/500. No public reads.
- Rate limit (5 / 15 minutes), honeypot decoy 201, privacy-safe logging. Public form still performs no network request.
- Screenshots under `project/visual-checks/prompt-09/`. Contracts: `INQUIRY-API-CONTRACT.md`, `DATABASE-SCHEMA.md`, `PRIVACY-AND-LOGGING.md`.

### Intentionally not done

- Neon provisioning, remote migrate, R2, Resend, Neon Auth, form-to-API connection, `/walter`
- Git init, deploy, cloud provisioning, real secrets

---

## Prompt 10 of 18 — Prompt 9 hardening, public inquiry connection, and Thank You page

### Work completed

- Exact JSON Content-Type parsing (media type `application/json` only; charset parameters allowed).
- Status-specific strict Zod error contracts for 400 / 415 / 422 / 429 / 503 / 500.
- Inquiry rate limits keyed by the first `X-Forwarded-For` address behind Render (`trustProxy: true`).
- Public Contact form posts JSON to `POST /inquiries` when `NEXT_PUBLIC_API_BASE_URL` is set at build time. File bytes are never sent. Failure states stay on `/contact/` with retry. 201 navigates to `/thank-you/`.
- Thank You page: centred heading and two canonical lines; photograph slot empty while project media is unpublished.
- Screenshots under `project/visual-checks/prompt-10/`.

### Intentionally not done

- Neon provisioning, remote migrate, R2, Resend, Neon Auth, `/walter`
- Git init, deploy, cloud provisioning, real secrets
- Publishing project photographs, client names, people, testimonials, maps, or social links

---

## Prompt 11 of 18 — Prompt 10 completion repair and private `/walter` authentication foundation

### Baseline (before Prompt 11 edits)

`npm.cmd run verify` was run from `F:\MY FILES\DATA SCIENCE\WALTER'S WEBSITE`. Prompt 10 left 60 tests passing, API and web builds succeeding, Drizzle check succeeding, no `.git`, no real secrets, public media limited to ATS brand assets, no `/walter/` route, and no public inquiry reads.

Independent audit of Prompt 10 defects (reproduced from source, recorded here; Prompt 10 history above is not erased):

- Fastify had `trustProxy: true`
- Rate limiting trusted the first `X-Forwarded-For` entry
- `TRUST_RENDER_CLIENT_IP` did not exist
- `CF-Connecting-IP` was not validated
- `inquiryCreatedResponseSchema.createdAt` was only a non-empty string
- No exported inquiry-creation error union or status-specific inferred error types
- Browser API client had no `AbortController` timeout; timeout and network failure were not distinguished
- 415 bodies were not validated with `inquiryUnsupportedMediaTypeErrorSchema`
- `credentials: "omit"` was not explicit
- `NEXT_PUBLIC_API_BASE_URL` was read through a dynamic environment object
- The form had no explicit submission-state union; Submit never became `Submitting…`; no polite submitting status
- Thank You lacked telephone/email and return-home / return-contact actions
- Canonical Thank You provenance pointed at unrelated fields (`email`, `pricing_mode`)
- Prompt 10 lacked `comparison.md` and required submission/error-state visual captures

### Work completed

- Repair 1: `TRUST_RENDER_CLIENT_IP` (literal true/false, default false, Render API `true`). Fastify `trustProxy` remains false. Rate-limit keys use socket IP, or a single `net.isIP`-validated `CF-Connecting-IP` when trust is on. `X-Forwarded-For` is never used. Addresses are not logged.
- Repair 2: ISO 8601 `createdAt`; `inquiryCreateErrorSchema` union and inferred status-specific types; exhaustive contract tests.
- Repair 3: static `process.env.NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_NEON_AUTH_BASE_URL` member access for Next inlining.
- Browser inquiry client: `AbortController` timeout, `credentials: "omit"`, 415 schema parse, timeout vs network codes.
- Contact submission-state union, **Submitting…** button, polite live status.
- Thank You telephone/email and return actions; provenance fields in `site-settings.json`.
- `project/visual-checks/prompt-10/comparison.md`.
- Official empty-origin Chrome captures for Thank You actions and `/walter/` under `project/visual-checks/prompt-11/`.
- `@neondatabase/auth` 0.5.0-beta browser adapter (`createAuthClient` only) and `jose` 6.2.10 on Fastify.
- Static `/walter/` email/password sign-in, identity-adapter boundary, `GET /session` JWT probe with generated test keys.
- Docs: `project/AUTHENTICATION.md`, architecture, local development, deployment, inquiry contracts.
- Final `npm.cmd run verify`: 81 tests, Drizzle check, API build, web static export including `/walter/`.

### Intentionally not done

- Git init, deploy, Neon project, Neon Auth cloud provisioning, real administrator, remote migrate
- Cloudflare R2, Resend, real secrets or credentials
- Public inquiry read/list/update/delete, inquiry management UI, public-content editing, image upload
- Publishing withheld media, clients, projects, people, prices, maps, testimonials, or social links

---

## Prompt 12 of 18 — Prompt 11 security completion and authenticated inquiry management

### Baseline (before Prompt 12 edits)

Absolute workspace root: `F:\MY FILES\DATA SCIENCE\WALTER'S WEBSITE`. CPU count: **8**. Vitest had no `maxWorkers` cap (file parallelism on, default pool).

`node scripts/run-in-workspace.mjs` / `npm.cmd run verify` from the F: path:

- content:check, lint, and typecheck passed
- tests: **2 failed | 79 passed (81)**
- `apps/api/tests/session.test.ts` first test timed out at 5s (`GET /session` 503 case, 7096ms)
- `apps/api/tests/inquiries.test.ts` first test timed out at 5s (create inquiry, 7087ms)
- Isolated reruns: session 2/2 in 2.80s; inquiries 12/12 in 3.04s
- A later full vitest run passed 81/81 in 23.52s
- Full verification therefore did not complete (stopped at tests)

Independent audit defects reproduced from source (Prompt 11 history above is not erased):

1. Protected probe was `GET /session`, not `GET /management/session`
2. JWT `role` / `roles` granted administrator access
3. No stable-subject administrator allowlist
4. `MANAGEMENT_AUTH_ENABLED` did not exist
5. `WALTER_ADMIN_USER_IDS` did not exist
6. JWT issuer and audience were optional
7. JWT algorithms were hardcoded `ES256`/`RS256`
8. `AUTH_JWT_PUBLIC_JWK` was a production environment option
9. Invalid authentication configuration silently degraded to unavailable
10. Bearer tokens had no explicit maximum length
11. Array / multiple Authorization values were not rejected
12. `/walter/` had no initial session-restoration flow
13. Sign Out changed React state only and did not call Neon Auth
14. The Neon client was created inside `signIn` and discarded
15. Token extraction fell back to guessed session properties despite `getJWTToken`
16. Public URL normalization accepted paths, queries, and fragments
17. No temporary static-build sentinel proved environment inlining
18. Prompt 11 lacked complete 1440/768/390 visual evidence
19. Documentation described optional issuer/audience and role-based access

### Repair 1 — deterministic tests

Vitest: `pool: "forks"`, `isolate: true`, `fileParallelism: true`, **`maxWorkers: 4`**, default `testTimeout: 5000`. ES256 management-auth tests use **15s** only because `jose.generateKeyPair` plus several verify round-trips are expensive on this Windows workspace.

Three consecutive `npm.cmd run test` runs, all passing:

| Run | Tests | Duration |
| --- | --- | --- |
| 1 | 90 passed / 22 files | 20.17s (elapsed 22883ms) |
| 2 | 90 passed / 22 files | 20.68s (elapsed 22986ms) |
| 3 | 90 passed / 22 files | 19.76s (elapsed 22002ms) |

No timeouts.

### Repair 2 — public URL origin-only and inlining proof

`parsePublicApiOrigin` requires `http:`/`https:`, hostname, optional port, no credentials, pathname empty or `/`, no query, no fragment; normalizes to `url.origin`. `parseNeonAuthBaseUrl` may keep a documented path such as `/neondb/auth`. Direct static member access remains `process.env.NEXT_PUBLIC_API_BASE_URL` and `process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL`.

Temporary copy built with `NEXT_PUBLIC_API_BASE_URL=https://api.example.test`. Browser bundle contained that origin (`contact` and `walter` chunks). Chrome Contact submit posted to `https://api.example.test/inquiries` and was not classified as unconfigured (a fetch occurred; the stubbed API returned 503). Temporary copy deleted. Official `apps/web/out` kept the empty origin. Evidence: `project/visual-checks/prompt-12/`.

### Repairs 3–6 — management auth

Added `MANAGEMENT_AUTH_ENABLED` (default false), `NEON_AUTH_JWKS_URL`, `NEON_AUTH_ISSUER`, `NEON_AUTH_AUDIENCE`, `NEON_AUTH_JWT_ALGORITHMS`, `WALTER_ADMIN_USER_IDS`. Removed `AUTH_JWT_*`, Fastify `NEON_AUTH_BASE_URL`, and `NEON_AUTH_COOKIE_SECRET`. Tests inject `JoseAuthVerifier` with generated keys. Authorisation is allowlisted JWT `sub` only. Bearer parsing requires exactly `Authorization: Bearer <token>` (max 8192). `GET /session` returns 404. `GET /management/session` success is `{ authenticated: true, role: "administrator" }` with `Cache-Control: no-store`.

### Neon client and inquiry inbox

Browser uses `createInternalNeonAuth` (the export that actually has `getJWTToken`), persists one handle, restores on `/walter/` mount, and calls Neon `signOut()`. Inquiry repository gained list/get/status update. Authenticated routes: `GET /management/inquiries`, `GET /management/inquiries/:id`, `PATCH /management/inquiries/:id`. No delete, no public reads.

### Final verify

`npm.cmd run verify` passed: content check, lint, typecheck, **90 tests**, Drizzle check, API build, web static export including `/walter/`.

### Intentionally not done

- Git init, deploy, Neon project, Neon Auth cloud provisioning, real administrator, remote migrate
- Cloudflare R2, Resend, real secrets or credentials
- Inquiry deletion, public inquiry reads, content editing, project/media publication, image/price/testimonial/map/social/logo publication

---

## Prompt 13 of 18 — Prompt 12 inquiry-inbox completion and controlled content-draft management

### Baseline (before Prompt 13 edits)

Absolute workspace root: `F:\MY FILES\DATA SCIENCE\WALTER'S WEBSITE`.

`npm.cmd run verify` from the F: path passed:

- content:check, lint, typecheck passed
- tests: **90 passed / 22 files**, duration **21.98s**
- Drizzle check passed
- API build passed
- static export passed (temporary copy because `apps/web/.next` existed)
- no `.git`, no committed secrets, no cloud resources, public media still brand assets only

Prompt 12 history above is not erased. Independent source review found these Prompt 12 inquiry-management defects:

1. List contract omitted `phone`, `hasAttachment`, and `nextCursor`; the summary had no pagination.
2. `listInquiries()` was unbounded; the Drizzle list query selected `message`.
3. There was no cursor pagination; identical timestamps were ordered only by `created_at DESC`.
4. Status update was `PATCH /management/inquiries/:id` instead of `PATCH /management/inquiries/:id/status`.
5. List query validation was not strict: unknown keys, arrays, and invalid limit/cursor values were not rejected.
6. Management `fetch` had no AbortController timeout.
7. The browser used undocumented `createInternalNeonAuth` instead of documented `createAuthClient`.
8. Inbox accessibility and responsiveness were incomplete: no pagination UI, no phone/attachment on the list, weak landmarks/skip.
9. Cache-Control was only `no-store` (no `private`, `Pragma`, or `Vary: Authorization`).
10. The Prompt 12 completion report overstated inquiry-management completeness.

### Repair gate

Shared Zod list query: optional `status`, opaque `cursor`, bounded `limit` (default 20, min 1, max 50). Unknown, repeated, fractional, zero, negative, and over-max values are rejected. List JSON is `{ inquiries, nextCursor }` with summary fields only.

Repository pagination is `created_at DESC, id DESC`, fetches `limit + 1`, and uses a versioned URL-safe cursor. Memory and Drizzle implementations share that order. Drizzle list selects summary columns only.

Canonical routes: `GET /management/session`, `GET /management/inquiries`, `GET /management/inquiries/:id`, `PATCH /management/inquiries/:id/status`. Retired `PATCH /management/inquiries/:id` returns 404.

Management replies send `Cache-Control: private, no-store`, `Pragma: no-cache`, and `Vary: Authorization`. Browser management fetch uses a 15s AbortController timeout and distinguishes `timeout` from `network_error`.

Browser identity uses documented `createAuthClient`, persists one client, and reads tokens only from `getJWTToken` when it is a function.

`/walter/` inbox shows phone, attachment metadata, load-more pagination, skip link, and 390/768 layout rules.

### Content drafts (after the repair gate)

Controlled `CONTENT_DRAFT_KEYS` registry. Drizzle table `content_drafts` and generated migration `0001_content_drafts.sql` (not applied remotely). Authenticated `GET/PUT/reset` endpoints. `/walter/` Website Content section with local preview and reset. Saved drafts do not change canonical generation or the public static export.

### Visual checks

Chrome captures at 1440×900, 768×1024, and 390×844 under `project/visual-checks/prompt-13/`:

- Official empty-origin `/walter/` sign-in (skip link present)
- Fixture-driven inbox (phone + load more)
- Fixture-driven Website Content (local preview notice)

Authenticated Neon sessions were not available. Inbox and content screenshots use deterministic HTML fixtures styled with `walter.css`.

### Final verify

`npm.cmd run verify` passed in **133.4s**:

- content:check, lint, typecheck passed
- tests: **109 passed / 26 files**, duration **20.93s**
- Drizzle check: Everything's fine
- API build passed
- web static export passed, including `/walter/` (`apps/web/out/walter/index.html`)

No `.git`. No remote migrate. No cloud resources. No real administrator.

---

## Prompt 14 of 18 — Complete Prompt 13 and local publication foundation

### Baseline (before Prompt 14 edits)

`npm.cmd run verify` passed with exit code 0:

- content:check, lint, typecheck passed
- tests: **109 passed / 26 files**, duration **22.04s**
- Drizzle check passed
- API build passed
- web static export passed
- no `.git`

Prompt 13 history above is not erased. Independent source review found these Prompt 13 content-draft defects:

1. Routes were `/management/content-drafts*`, not `/management/content/drafts*`
2. There was no `GET /management/content/drafts/:key`
3. Drafts had no version, `createdAt`, `updatedBySubject`, or `expectedVersion` optimistic concurrency
4. There was no local publication-snapshot foundation
5. The Prompt 13 completion report overstated content-draft completeness

### Repair

Canonical draft routes: `GET/PUT /management/content/drafts/:key`, list, and reset. Retired `/management/content-drafts*` returns 404. Saves require `{ value, expectedVersion }`. Canonical fallback is version 0 with null timestamps. Version mismatch is HTTP 409 `conflict`. `updatedBySubject` is the verified JWT `sub`.

### Local publication snapshots

Table `publication_snapshots` and generated migration `0002_content_drafts_and_publication_snapshots.sql` (not applied remotely). Authenticated `GET/POST /management/content/snapshots` store overlay values for approved copy keys only. Creating a snapshot does not rebuild the public static export or invoke a Render deploy hook.

### Visual checks

Chrome captures at 1440×900, 768×1024, and 390×844 under `project/visual-checks/prompt-14/`:

- Official empty-origin `/walter/` sign-in (skip link present)
- Fixture-driven inbox (Publication nav present; phone + load more)
- Fixture-driven Website Content (version shown; local preview notice)
- Fixture-driven Publication (local snapshot list and overlay preview; no administrator `sub`)

Authenticated Neon sessions were not available. Inbox, content, and publication screenshots use deterministic HTML fixtures styled with `walter.css`.

### Final verify

`npm.cmd run verify` passed in **206.7s**:

- content:check, lint, typecheck passed
- tests: **112 passed / 26 files**, duration **24.38s**
- Drizzle check: Everything's fine
- API build passed
- web static export passed, including `/walter/` (`apps/web/out/walter/index.html`)

No `.git`. No remote migrate. No cloud resources. No real administrator. No Render deploy hook.

### Intentionally not done

- Git init, deploy, Neon project, Neon Auth cloud provisioning, real administrator, remote migrate
- Cloudflare R2, Resend, real secrets or credentials
- Inquiry deletion, public inquiry CRUD, publishing withheld material, arbitrary HTML editing
- Changing the live/static public website from saved drafts
- Invoking `STATIC_SITE_DEPLOY_HOOK_URL` or adding `POST /management/content/publish`

---

## Prompt 15 of 18 — Complete the failed Prompt 14 requirements

### Baseline (before Prompt 15 edits)

`npm.cmd run verify` passed with exit code 0:

- content:check, lint, typecheck passed
- tests: **112 passed / 26 files**, duration **40.42s**
- Drizzle check: Everything's fine
- API build passed
- web static export passed
- no `.git`

Prompt 14 history above is not erased. Independent source review found these remaining Prompt 14 defects:

1. `content_drafts.value` is text, not JSONB, and version has no database constraint
2. Drizzle save/reset read-then-write, so concurrent updates can race
3. API registry duplicates canonical copy instead of generating from canonical source
4. Management failures reuse the public inquiry `service_unavailable` envelope
5. `Vary` is overwritten instead of merged
6. Neon Auth uses `createAuthClient(...) as NeonAuthClient`
7. Sign-out awaits Neon before clearing protected state
8. Management clients map malformed responses to `network_error`
9. Inquiry UI lacks mailto/tel, human-readable times, pagination safety
10. Website Content editor lacks grouping, canonical/draft display, exact save/reset copy, and 409 reload
11. Publication snapshots are a single text payload without hash, entries, source versions, or bounded listing
12. Snapshot routes are not the required `/management/content/publications*` model
13. Preparation is not version-safe and exposes `createdBySubject`

### Repair

Squashed unapplied `0001`/`0002` into `0001_content_drafts_and_publications.sql`. `content_drafts.value` is JSONB `{ text }` with `version > 0`. Draft saves are atomic (`ON CONFLICT DO NOTHING` for version 0; conditional update/delete with `RETURNING`). API and web field registries are generated from `context/canonical/content-draft-fields.json`. Management errors use `management_auth_unavailable`, `management_storage_unavailable`, `content_version_conflict`, and `malformed_response`. `Vary` merges `Authorization` without dropping `Origin`. Neon Auth typing is derived from `createAuthClient`. Sign-out clears protected state first. `/walter/` inquiries use mailto/tel and human-readable times. Website Content shows grouped fields, canonical/draft values, exact save/reset copy, and 409 reload. Immutable prepared publications replace snapshots.

### Visual checks

Chrome captures at 1440×900, 768×1024, and 390×844 under `project/visual-checks/prompt-15/`:

- Official empty-origin `/walter/` sign-in (skip link present)
- Fixture-driven inbox (`mailto:` / `tel:` links; Publication nav present)
- Fixture-driven Website Content (page/section group, save copy, local preview)
- Fixture-driven Publication (prepare control, overlay preview, no administrator `sub`)

Authenticated Neon sessions were not available. Inbox, content, and publication screenshots use deterministic HTML fixtures styled with `walter.css`.

### Final verify

`npm.cmd run verify` passed in **268.8s**:

- content:check, lint, typecheck passed
- tests: **122 passed / 28 files**, duration **33.80s**
- Drizzle check: Everything's fine
- API build passed
- web static export passed, including `/walter/` (`apps/web/out/walter/index.html`)

No `.git`. No remote migrate. No cloud resources. No real administrator. No Render deploy hook.

### Intentionally not done

- Git init, deploy, Neon project, Neon Auth cloud provisioning, real administrator, remote migrate
- Cloudflare R2, Resend, real secrets or credentials
- Inquiry deletion, public inquiry CRUD, publishing withheld material, arbitrary HTML editing
- Changing the live/static public website from saved drafts or prepared publications
- Invoking `STATIC_SITE_DEPLOY_HOOK_URL` or adding a working `POST /management/content/publish`

## Prompt 16 of 18 — Final publication-foundation repair

### Baseline (before Prompt 16 edits)

`npm.cmd run verify` passed with exit code 0:

- content:check, lint, typecheck passed
- tests: **122 passed / 28 files**, duration **22.44s**
- Drizzle check: Everything's fine
- API build passed
- web static export passed
- no `.git`

Prompt 15 history above is not erased. Independent source review found these remaining publication-foundation defects:

1. Prepare loads drafts, checks versions, inserts the publication parent, then inserts entries as separate steps. That allows stale overlays and orphan publication rows.
2. `expectedDraftVersions` treats omitted keys as version 0, so any unselected live draft causes 409 instead of compiling that key from canonical copy.
3. Entries are not explicitly sorted before the SHA-256 hash, and prepare is not one transactional repository operation.

### Repair

`POST /management/content/publications/prepare` now calls one repository operation. Drizzle runs that operation inside `db.transaction()`: `SELECT … FOR UPDATE` on **listed keys only**, compile canonical plus selected-draft entries, validate values, sort by key, SHA-256 hash, insert the publication parent and every entry, or roll back. Memory prepare serializes on the same exclusive draft lock and does not insert on conflict. Runtime Drizzle uses `drizzle-orm/neon-serverless` because the HTTP driver cannot transactionally prepare. Draft and publication repositories share one client.

Omitted keys stay canonical even when a live draft exists. Empty `{}` is an all-canonical 201. A listed version must match the live row; listed `0` means no draft row. Mismatch is 409 `content_version_conflict`. `/walter/` sends only `isDraft` keys. `createdBySubject` stays internal.

### Visual checks

Chrome captures at 1440×900, 768×1024, and 390×844 under `project/visual-checks/prompt-16/`:

- Official empty-origin `/walter/` sign-in (skip link present)
- Fixture-driven inbox (`mailto:` / `tel:` links; Publication nav present)
- Fixture-driven Website Content (page/section group, save copy, local preview)
- Fixture-driven Publication (prepare control; selected-draft hero overlay with canonical contact heading; no administrator `sub`)

Authenticated Neon sessions were not available. Inbox, content, and publication screenshots use deterministic HTML fixtures styled with `walter.css`.

### Final verify

`npm.cmd run verify` passed in **243.3s**:

- content:check, lint, typecheck passed
- tests: **129 passed / 29 files**, duration **32.58s**
- Drizzle check: Everything's fine
- API build passed
- web static export passed, including `/walter/` (`apps/web/out/walter/index.html`)

No `.git`. No remote migrate. No cloud resources. No real administrator. No Render deploy hook.

### Intentionally not done

- Git init, deploy, Neon project, Neon Auth cloud provisioning, real administrator, remote migrate
- Cloudflare R2, Resend, real secrets or credentials
- Inquiry deletion, public inquiry CRUD, publishing withheld material, arbitrary HTML editing
- Media management, changing the live/static public website from saved drafts or prepared publications
- Invoking `STATIC_SITE_DEPLOY_HOOK_URL` or adding a working `POST /management/content/publish`

## Prompt 17 of 18 — Complete the remaining Prompt 16 requirements

### Baseline (before Prompt 17 edits)

`npm.cmd run verify` passed with exit code 0:

- content:check, lint, typecheck passed
- tests: **129 passed / 29 files**, duration **22.63s**
- Drizzle check: Everything's fine
- API build passed
- web static export passed
- no `.git`

Prompt 16 history above is not erased. Independent source review found these remaining Prompt 16 defects:

1. `contentPublicationPrepareSchema` accepts `expectedDraftVersions` values of `0`, so `{ "homepage.heroHeading": 0 }` is a valid prepare body.
2. The compiler treats listed version `0` as “this key must have no draft row” and can emit a canonical entry, instead of rejecting version `0`.
3. The Neon `Pool` is created without a close path: `createDb` discards the pool handle, persistence is cached by `DATABASE_URL`, inquiry and content clients are separate, and Fastify never ends the pool on shutdown.

### Repair

Prepare bodies require listed draft versions **≥ 1**. `{ "homepage.heroHeading": 0 }` is **400**. Omitted keys still stay canonical; empty `{}` is still an all-canonical **201**. The compiler rejects listed version `0` instead of compiling a canonical row. `/walter/` continues to send only live `isDraft` versions.

Inquiries, drafts, and publications share one `createAppPersistence` client. `createDb` keeps the Neon `Pool` and exposes `end()`. Fastify `onClose` ends the pool. Persistence is no longer cached by `DATABASE_URL`. Tests that inject all three repositories do not construct a pool.

### Visual checks

Chrome captures at 1440×900, 768×1024, and 390×844 under `project/visual-checks/prompt-17/`:

- Official empty-origin `/walter/` sign-in (skip link present)
- Fixture-driven inbox (`mailto:` / `tel:` links; Publication nav present)
- Fixture-driven Website Content (saved draft version 1, local preview)
- Fixture-driven Publication (prepare control; selected-draft hero overlay with canonical contact heading; no administrator `sub`)

Authenticated Neon sessions were not available. Inbox, content, and publication screenshots use deterministic HTML fixtures styled with `walter.css`.

### Final verify

`npm.cmd run verify` passed in **237.4s**:

- content:check, lint, typecheck passed
- tests: **129 passed / 29 files**, duration **30.37s**
- Drizzle check: Everything's fine
- API build passed
- web static export passed, including `/walter/` (`apps/web/out/walter/index.html`)

No `.git`. No remote migrate. No cloud resources. No real administrator. No Render deploy hook.

### Intentionally not done

- Git init, deploy, Neon project, Neon Auth cloud provisioning, real administrator, remote migrate
- Cloudflare R2, Resend, real secrets or credentials
- Inquiry deletion, public inquiry CRUD, publishing withheld material, arbitrary HTML editing
- Media management, changing the live/static public website from saved drafts or prepared publications
- Invoking `STATIC_SITE_DEPLOY_HOOK_URL` or adding a working `POST /management/content/publish`

---

## Prompt 18 of 18 — Final integrity repair and release-readiness audit

### Baseline (before Prompt 18 edits)

`npm.cmd run verify` passed with exit code 0:

- content:check, lint, typecheck passed
- tests: **129 passed / 29 files**, duration **24.70s**
- Drizzle check: Everything's fine
- API build passed
- web static export passed
- no `.git`
- elapsed **161.4s**

Prompt 17 history above is not erased. Independent source review found these remaining defects:

1. `DrizzlePublicationRepository.listPublications()` selects every publication, then filters with `isBeforeCursor()` and slices in application memory.
2. There is no prepared-publication-to-public-content compiler, no `content:compile-publication:test` command, and no compiler step in `verify`.
3. Transaction rollback is not proven by executable injected failures after parent insert, during entry insert, or after a partial entry insert.
4. Publication tests do not cover the full required matrix (identical-timestamp SQL pagination, simultaneous prepares, missing selected draft, immutable routes).
5. Management-client classification returns `unexpected` for a valid **415** envelope.
6. Sign-out still uses an unmanaged `Promise.race` that does not clear its timer, catch provider rejection, or show a signed-out notice.
7. `project/CONTENT-MANAGEMENT.md` is missing.
8. Prompt 17 visual evidence is handwritten HTML fixtures without `comparison.md`.

### Remaining defects reproduced

Source inspection confirmed all eight baseline defects before the Prompt 18 repairs: Drizzle listed every publication then filtered with `isBeforeCursor`; no compiler command; rollback was not injected; publication coverage was incomplete; 415 mapped to `unexpected`; sign-out used an unmanaged `Promise.race`; `project/CONTENT-MANAGEMENT.md` was missing; Prompt 17 used handwritten HTML fixtures.

### SQL publication pagination

`DrizzlePublicationRepository.listPublications()` now orders `created_at DESC`, `id DESC`, applies the cursor in SQL (`created_at < cursor` or same timestamp and `id < cursor`), uses `.limit(query.limit + 1)`, returns at most `limit` rows, and sets `nextCursor` only when another database row exists. It no longer contains `isBeforeCursor` and does not load the full table.

### Complete public-content compiler

`scripts/compile-publication-content.mjs` compiles canonical browser-safe public content with a validated prepared publication: status `prepared`, exact controlled keys, no missing/duplicate/unknown entries, field lengths, plain-text policy, recomputed SHA-256, canonical selectors, locked fields preserved, publication metadata excluded. `npm.cmd run content:compile-publication:test` writes temporary output, deletes it, and is part of `verify`. Official `content:generate` remains canonical.

### Transaction rollback evidence

`MemoryPublicationRepository` injects failures after parent insert, during entry insert, and after a partial entry insert. Executable tests prove no parent, no entries, and no leftover `homepage.heroHeading` row remain.

### Management-client and sign-out corrections

Valid 415 envelopes return `unsupported_media_type`. Malformed JSON, network failure, timeout, schema-invalid JSON, and unexpected valid JSON stay distinct. `signOutWithTimeout` clears its timer, catches provider rejection, reports timeout separately, and prevents unhandled rejection. `/walter/` clears protected state first, ignores stale management responses after sign-out, and shows a signed-out notice.

### Content-management documentation

`project/CONTENT-MANAGEMENT.md` records controlled fields, the generated registry, versioned drafts, optimistic concurrency, conflict recovery, selected-draft semantics, transactional prepared publications, immutable entries, SQL pagination, SHA-256, the compiler, the canonical official build, future deployment, migration status, and unauthorised future work.

### Real React visual evidence

A temporary `/walter-visual/{state}/` route rendered production `InquiryInbox`, `InquiryDetail`, `ContentDraftEditor`, `ContentPublications`, and `WalterSignInPage` with deterministic adapters. Chrome captured 16 states at 1440×900, 768×1024, and 390×844 (48 PNGs). The route was deleted before the official export. `apps/web/out` has no `walter-visual` path. There are no `prompt-18/fixtures/*.html` files. Evidence: `project/visual-checks/prompt-18/README.md`, `comparison.md`, `measurements.json`.

### Three consecutive test results

1. **33 files**, **147 tests**, **39.74s**, passed
2. **33 files**, **147 tests**, **38.81s**, passed
3. **33 files**, **147 tests**, **38.71s**, passed

### Final verification

- `content:generate` passed
- `content:check` passed (fresh and leak-free)
- `content:compile-publication:test` passed
- `lint` passed
- `typecheck` passed
- tests ×3 passed as above
- `db:generate`: no schema changes
- `db:check`: Everything's fine
- `build:api` passed
- `build:web` passed (six emitted route paths: `/`, `/_not-found`, `/contact`, `/portfolio`, `/thank-you`, `/walter`; no `/walter-visual`)
- `npm.cmd run verify` passed, elapsed **298.0s**, tests **147 passed / 33 files**, duration **38.91s**
- Original SHA-256 unchanged: `26633e31…`, `59f2e3ae…`, `f0404fc3…`, `2cdb345e…`
- no `.git`

### Intentionally not done

- Git init, deploy, Neon project, Neon Auth cloud provisioning, real administrator, remote migrate
- Cloudflare R2, Resend, real secrets or credentials
- Media management, live publication, withheld-content publication
- Invoking `STATIC_SITE_DEPLOY_HOOK_URL` or adding a working `POST /management/content/publish`

### Post-completion consistency audit

A direct audit after the Prompt 18 report corrected five inconsistencies:

1. Publication history now uses **Load more publications** / **Loading more publications…** instead of inquiry-specific copy. Inquiry pagination keeps its own label.
2. A rejected identity-provider sign-out is propagated through the production Neon adapter and no longer displays an unqualified success message. Protected state is still cleared first, while timeout and provider failure each receive an honest, distinct notice.
3. The publication compiler derives controlled keys from the generated registry instead of maintaining another hard-coded list. It also rejects duplicate registry keys and missing final canonical selectors. Regression tests now cover duplicate, unknown, missing, HTML, length, version, hash, registry, and selector failures.
4. The web-build record now names the six emitted route paths accurately; `/walter` is a private management route, not a public-navigation route.
5. The retained publication-pagination PNG is documented as the defect capture. `screenshot-dimensions.json` verifies all **48** PNG dimensions. The capture script now records DOM scroll/client dimensions and horizontal overflow on future recaptures.

Final `npm.cmd run verify` passed after these corrections: **155 tests / 33 files**, content and compiler checks, lint, typecheck, Drizzle check, API build, and the static web export. No Git, cloud provisioning, remote migration, secrets, media publication, deploy, or live publication was performed.

---

## Post-Prompt 18 — company photography curation and Portfolio completion

- Reviewed all **86** files under `compan images/` using contact sheets and full-resolution inspection of shortlisted candidates.
- Selected **21** public photographs and left **65** out of the public build because they were repetitive, weaker, ceremonial, close identifiable portraits, duplicate branding, or visually distracting.
- Added `context/canonical/company-media.json` as the deterministic selection and placement registry. Original filenames remain canonical provenance only and are not emitted into browser content.
- Added a photographic hero, images for all **9** service cards, a six-tile featured-work mosaic, an illustrated about section, and a photographic closing CTA.
- Replaced the Portfolio scaffold with **5** capability groups and **21** generic work entries. No client names, prices, project locations, certifications, or other unsupported claims were added.
- Added one curated company photograph to the Thank You page.
- Added public-media existence checks, content-pipeline regression coverage, Portfolio component tests, and Chrome visual checks under `project/visual-checks/company-media/`.
- Chrome at **1440×900**, **768×1024**, and **390×844** found no broken images and no horizontal overflow on Home or Portfolio.
- Final `npm.cmd run verify` passed: content and publication-compiler checks, lint, typecheck, **157 tests / 34 files**, Drizzle check, API build, and static web export.

---

