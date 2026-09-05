# Local development

## Toolchain

- Node.js `>=20.9.0` (the Blueprint pins `24.11.1`)
- npm `>=10`

On Windows use `npm.cmd` when PowerShell's execution policy blocks `npm.ps1`.

## Install

```bash
npm.cmd install
```

## Run

```bash
npm.cmd run dev
```

Serves <http://localhost:3000>. There is no API to start and no environment
variable to set — the site is entirely self-contained.

## Content

After editing anything under `context/canonical/`:

```bash
npm.cmd run content:generate
npm.cmd run content:check
```

`content:generate` rewrites `apps/web/src/generated/public-content.{ts,json}`.
Both generated files are committed; `content:check` fails the build if they are
stale, if the leak scan trips, or if a referenced photograph is missing from
`apps/web/public/media/`.

## Validation

```bash
npm.cmd run verify
```

Runs, in order, stopping at the first failure:

1. `content:check` — snapshot freshness, leak scan, media validation
2. `lint` — ESLint
3. `typecheck` — `tsc --noEmit`
4. `test` — the Vitest suite
5. `build:web` — the static export

## Build output

```bash
npm.cmd run build:web
```

Writes `apps/web/out/`. That directory is generated and is not committed.

## What not to run here

- `npm audit fix --force`
- Anything that would reintroduce an API, database or authentication dependency
