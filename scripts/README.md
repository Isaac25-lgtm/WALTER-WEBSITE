# Scripts

Everything here runs against committed files only. Nothing reads an environment
variable, a database or the network.

| Script | Purpose |
| --- | --- |
| `generate-public-content.mjs` | Validates `context/canonical/*.json` and writes the browser-safe snapshot to `apps/web/src/generated/public-content.{ts,json}`. Run via `npm run content:generate`. |
| `check-public-content.mjs` | Regenerates the snapshot in memory, compares it with the committed one, runs the leak scan and confirms every referenced photograph exists under `apps/web/public/media/`. Run via `npm run content:check`. |
| `content-leak.test.ts` | Vitest coverage for the generator: contact channels, WhatsApp destination, map coordinates, published routes and withheld records. |
| `build-web.mjs` | **Windows-only** local static-export helper. Falls back to building from a temporary copy when the editor holds `apps/web/.next`. Render calls `next build` directly and must never run this. |
| `run-in-workspace.mjs` | Runs npm commands from the real workspace path on Windows. |
| `clean-generated.mjs` | Removes regenerable artefacts: `node_modules/`, `.next/`, `out/`, `*.tsbuildinfo` and `package-lock.json`. |
| `prepare-brand-assets.py` | Regenerates the logo derivatives in `apps/web/public/media/brand/` from the committed 200 dpi brand raster. Requires Pillow. |
| `inspect-static-site.py` | Serves `apps/web/out` and inspects `/`, `/portfolio/` and `/contact/` at 1440×900, 768×1024 and 390×844: horizontal overflow, broken images, WhatsApp floater size and clearance above the mobile call bar, contact links and map size. Writes screenshots and `project/visual-checks/static-site/measurements.json`. Requires Playwright with Chrome. |

## Editing content

Edit `context/canonical/*.json`, then:

```bash
npm.cmd run content:generate
npm.cmd run content:check
```

Commit the regenerated snapshot together with the canonical edit — `content:check`
fails the build if they drift apart.

The WhatsApp number comes from `context/canonical/site-settings.json` and the map
coordinates from the `map` block on `loc-dodoma-branch` in
`context/canonical/locations.json`. The only presentation literal left in
`generate-public-content.mjs` is `WHATSAPP_MESSAGE`.
