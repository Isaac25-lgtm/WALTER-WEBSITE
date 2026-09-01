# Source-control policy

Git is **intentionally not initialised** in this prompt (Prompt 4). This workspace remains a local foundation until a later prompt authorises `git init` and a remote.

## What stays local until an explicit decision

These are source or private engineering evidence, not public website media:

- Original PDFs: `active company profile new 2025 civil and construction-1.pdf`, `COMPANY CONTEXT.pdf`
- Original logo files: `active logo.pdf`, `active logo.jpg`
- Raw image extracts: `context/assets/_raw_extract/`
- Page preview renders: `context/assets/previews/`
- Reference-site screenshots: `context/reference/screenshots/`
- Browser capture dumps: `context/reference/_capture_raw.json` and related `_*.json` artefacts

They must **not** be pushed casually. Several of these trees are large, private, or both.

**Before the first remote push**, decide for each of the above whether it belongs in:

- Git LFS
- An external archive (not in the Git remote)
- `.gitignore` (already used for extracts, previews, screenshots, and capture dumps)

Do not treat “it is in the workspace” as “it should be on the remote”.

## What is expected to be source-controlled later

When Git is initialised:

- Application code under `apps/` and `packages/`
- Canonical JSON and editorial documents under `context/canonical/`
- Architecture and process documents under `project/`
- Safe configuration templates (`.env.example`, `render.yaml` without secrets)
- Drizzle schema and migrations **once they exist as code** (not remote database state)
- `package-lock.json`

Classified extracts under `context/assets/{brand,people,projects,services,miscellaneous}/` still need a LFS / archive / ignore decision before push; they are ATS-owned evidence, not public `/` media.

## Never commit

- `.env`, `.env.*` (except committed `.env.example` templates with empty or non-secret placeholders)
- Database URLs, Neon Auth server secrets, R2 keys, Resend API keys, Render deploy-hook URLs
- Any other credential or key file

`.gitignore` is written to enforce this even before Git exists.

## Decision taken before the first remote push

Git was initialised on branch `main` and pushed to
`https://github.com/Isaac25-lgtm/WALTER-WEBSITE.git`. The outstanding
LFS / archive / ignore decision was resolved as follows:

| Item | Decision |
| --- | --- |
| `COMPANY CONTEXT.pdf` (110 MB) | **Ignored.** Local / external archive only. |
| `active company profile new 2025 civil and construction-1.pdf` (64 MB) | **Ignored.** Local / external archive only. |
| `active logo.pdf` (16 KB) | **Git LFS.** Canonical logo master, hashed by `scripts/prepare-brand-assets.py`. |
| `active logo.jpg` (80 KB) | **Committed normally.** |
| `context/assets/{brand,people,projects,services,miscellaneous}/` | **Committed normally.** ~77 MB, largest single file 3 MB. |
| `context/assets/_raw_extract/`, `context/assets/previews/`, `context/reference/screenshots/` | **Ignored**, as before. |

Rationale for excluding the two large documents: no build, test, lint,
typecheck or content-generation step reads them. The only references to
`COMPANY CONTEXT.pdf` in code are denylist string literals in
`scripts/check-public-content.mjs` and `scripts/content-leak.test.ts`, which
assert the filename never appears in generated public content. Their extracted
derivatives and provenance metadata are already committed under
`context/assets/`. They remain available locally and must be preserved in an
external archive — they are not recoverable from the Git remote.

`.gitattributes` retains `*.pdf filter=lfs diff=lfs merge=lfs -text`, so any
PDF that is committed in future is stored in Git LFS automatically.
