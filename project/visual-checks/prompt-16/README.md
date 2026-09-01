# Prompt 16 visual checks

Official static export (`NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_NEON_AUTH_BASE_URL` empty) captured from `http://127.0.0.1:4173/` at **1440×900**, **768×1024**, and **390×844**.

Authenticated Neon sessions are not available in this prompt. Inbox, Website Content, and Publication screenshots are **fixture-driven** HTML that uses the same `walter.css` as `/walter/`. They are not live administrator screenshots. Administrator JWT `sub` values are not shown.

The Publication fixture shows a selected-draft overlay: the hero heading is the saved draft, while the omitted contact heading stays canonical (`Contact Us`).

## `/walter/` empty-origin shell

| Viewport | Sign-in |
| --- | --- |
| 1440×900 | `walter-sign-in-1440x900.png` |
| 768×1024 | `walter-sign-in-768x1024.png` |
| 390×844 | `walter-sign-in-390x844.png` |

## Fixture-driven authenticated layouts

| Viewport | Inbox | Website Content | Publication |
| --- | --- | --- | --- |
| 1440×900 | `inbox-1440x900.png` | `content-1440x900.png` | `publication-1440x900.png` |
| 768×1024 | `inbox-768x1024.png` | `content-768x1024.png` | `publication-768x1024.png` |
| 390×844 | `inbox-390x844.png` | `content-390x844.png` | `publication-390x844.png` |

Fixtures: `fixtures/inbox.html`, `fixtures/content.html`, `fixtures/publication.html`. Capture script: `scripts/capture-prompt-16-chrome.py`.
