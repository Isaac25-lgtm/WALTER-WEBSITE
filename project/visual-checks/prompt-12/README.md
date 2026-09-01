# Prompt 12 visual checks

Official static export (`NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_NEON_AUTH_BASE_URL` empty) captured from `http://127.0.0.1:4173/` at **1440×900**, **768×1024**, and **390×844**. Measurements in `measured.json`.

Authenticated inbox screenshots are not possible in this prompt: Neon Auth is not provisioned and no real administrator exists. Inbox, detail, filters, and status controls are covered by Vitest (`walter.test.tsx`, management API tests).

## `/walter/` empty-origin shell

| Viewport | Sign-in | Unavailable after submit |
| --- | --- | --- |
| 1440×900 | `walter-sign-in-1440x900.png` | `walter-unavailable-1440x900.png` |
| 768×1024 | `walter-sign-in-768x1024.png` | `walter-unavailable-768x1024.png` |
| 390×844 | `walter-sign-in-390x844.png` | `walter-unavailable-390x844.png` |

Observed at every viewport:

- Title: Management sign in | Active Technical Services
- H1: Management sign in
- Public `.desktop-nav`: 0
- Unavailable notice: Management sign-in is not available yet.
- Password not left in the DOM
- Public header does not link `/walter`

Thank You recaptures at the same three viewports are stored here and under `project/visual-checks/prompt-11/`.

## Static-build inlining proof

Temporary copy built with `NEXT_PUBLIC_API_BASE_URL=https://api.example.test`, then deleted. Official `apps/web/out` kept the empty origin.

| Item | Result |
| --- | --- |
| Origin in browser bundle | `inlining-bundle.json` (`contact` and `walter` chunks) |
| Contact POST | `https://api.example.test/inquiries` |
| Classified unconfigured | no (a fetch was made; stubbed API returned 503) |
| Screenshot | `contact-sentinel-origin-desktop-1440x900.png` |
| Temp copy remaining | no |
