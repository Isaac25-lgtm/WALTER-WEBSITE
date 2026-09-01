# Prompt 11 visual checks

Chrome captures of the official static export (`NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_NEON_AUTH_BASE_URL` empty) at `http://127.0.0.1:4173/`. Prompt 12 filled the missing 768 and 390 viewports. Measurements in `measured.json`.

## Thank you `/thank-you/`

| Item | Value |
| --- | --- |
| Telephone | `tel:+256782318727` |
| Email | `mailto:activetechnicalservices@gmail.com` |
| Return home | `/` |
| Return to contact | `/contact/` |
| Photographs | 0 |
| `/walter` in header | absent |

Screenshots: `thank-you-actions-desktop-1440x900.png`, `thank-you-1440x900.png`, `thank-you-768x1024.png`, `thank-you-390x844.png`

## Contact (empty public API origin)

Valid submit stays on `/contact/`, Submit remains **Submit**, and the canonical unavailable notice is shown. Submitting… and timeout screenshots cannot be produced from this official export because no `/inquiries` fetch is made. Those states are covered by Vitest (`contact.test.tsx`, `submit-inquiry.test.ts`).

## `/walter/`

| Item | Value |
| --- | --- |
| Title | Management sign in \| Active Technical Services |
| H1 | Management sign in |
| Public `.desktop-nav` | 0 |
| Email / password fields | present |
| Empty Neon Auth origin | “Management sign-in is not available yet.” |
| Password left in DOM after submit | false |

Screenshots: `walter-sign-in-desktop-1440x900.png`, `walter-unavailable-desktop-1440x900.png`, plus Prompt 12 recaptures `walter-sign-in-1440x900.png`, `walter-sign-in-768x1024.png`, `walter-sign-in-390x844.png`.
