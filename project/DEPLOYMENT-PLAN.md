# Deployment plan

One Render Static Site. Nothing else.

## Blueprint

`render.yaml` defines a single service:

| Field | Value |
| --- | --- |
| Name | `ats-public-web` |
| Runtime | `static` |
| Build | `npm ci && npm run content:check && npm run build --workspace=@ats/web` |
| Publish directory | `apps/web/out` |
| Environment variables | `NODE_VERSION` only |

No value is left for the operator to supply, so applying the Blueprint asks for
no input. There is no start command, no health check and no plan line, because a
static site needs none of them.

`next build` is invoked directly. `scripts/build-web.mjs` is a Windows-only
local helper that shells out to `cmd.exe` and `mklink`; it must never run on
Render.

## First deployment

1. In Render choose **New → Blueprint** and select this repository.
2. Render reads `render.yaml` and creates `ats-public-web`.
3. Deploy. The site is live; there is nothing to configure afterwards.

## Subsequent deployments

Push to `main`. Render rebuilds and republishes automatically.

## Removing the old API service

Deleting `ats-api` from `render.yaml` does **not** delete a service that Render
has already created. If `ats-api` was ever deployed, open the Render dashboard
and delete or suspend it by hand, otherwise its paid plan keeps billing.

## Rollback

Redeploy any previous commit from the Render dashboard, or revert the commit on
`main` and push.
