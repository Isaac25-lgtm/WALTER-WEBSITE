# Prompt 10 visual comparison

Chrome captures of the static export at `http://127.0.0.1:4173/` (empty `NEXT_PUBLIC_API_BASE_URL` unless noted). Measurements in `measured.json`.

Prompt 11 repaired the missing comparison and incomplete state captures. Prompt 10 history is not rewritten.

## Thank you `/thank-you/` versus recorded structure

| Item | ATS export | Recorded reference structure |
| --- | --- | --- |
| Title | Thank you \| Active Technical Services | Thank-you route, not in nav |
| H1 | 40px / 64px / 700 / white / centre | Large centred thank-you heading |
| H1 box (1440) | 1080×64 at x=180, y=138 | Full content column |
| Supporting lines | 14px, white, centre | Two supporting sentences |
| Photograph slot | **0** images (unpublished project media) | Rounded project photograph |
| Telephone / email | Prompt 11 repair: canonical `tel:` and `mailto:` | Contact alternatives on the page |
| Return actions | Prompt 11 repair: Return home `/`, Return to contact `/contact/` | Post-submit navigation |
| Nav | Services, Portfolio, Contact | No thank-you nav item |
| Overflow-x 1440 / 768 / 390 | 1440 / 768 / 390 | No horizontal overflow |
| WhatsApp / `/walter` / Metalworks | absent from this public page | ATS identity only |

The missing rounded photograph is a **content-driven height delta**. The slot is implemented and returns null until project media is published.

## Contact submission states

| State | How captured | Expected |
| --- | --- | --- |
| Empty origin / unavailable | Official empty-origin export, valid submit | Stays on `/contact/`, no `/inquiries` request, canonical unavailable notice plus tel/mailto |
| Client validation | Empty submit on mobile | Error summary, fields remain |
| Submitting… | Delayed `/inquiries` intercept (Prompt 11 repair) | Button label **Submitting…**, polite `role="status"` |
| Timeout / network | Distinct client codes (Prompt 11 repair) | Timeout message vs network-error message |
| 503 | Temporary API-origin build against an API without `DATABASE_URL` | Unavailable storage notice; values kept |

The official `verify` web build keeps `NEXT_PUBLIC_API_BASE_URL` empty. A 503 capture requires a temporary rebuild with `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3001` and must not be left as the committed export.

## Screenshots

- `thank-you-full-desktop-1440x900.png`
- `thank-you-heading-desktop-1440x900.png`
- `thank-you-full-tablet-768x1024.png`
- `thank-you-full-mobile-390x844.png`
- `thank-you-call-bar-mobile-390x844.png`
- `contact-full-desktop-1440x900.png`
- `contact-unavailable-desktop-1440x900.png`
- `contact-full-mobile-390x844.png`
- `contact-mobile-validation-390x844.png`
- Prompt 11 repair captures: `project/visual-checks/prompt-11/thank-you-actions-desktop-1440x900.png` (tel, mailto, return-home, return-contact). Submitting… and timeout cannot be photographed from the official empty-origin export; they are covered by tests.
