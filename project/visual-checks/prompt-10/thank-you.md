# Prompt 10 visual checks

Chrome captures of the static export at `http://127.0.0.1:4173/` (no `NEXT_PUBLIC_API_BASE_URL` at build time). Measurements in `measured.json`.

## Thank you `/thank-you/` (1440×900)

| Item | Value |
| --- | --- |
| Title | Thank you \| Active Technical Services |
| H1 | 40px / 64px / 700 / white / centre |
| H1 box | 1080×64 at x=180, y=138 |
| Supporting | 14px, white, centre |
| Photograph slot | **0** (unpublished project media) |
| Nav | Services, Portfolio, Contact |
| Overflow-x | 1440 |
| Scroll height | 900 (reference ~1453 with a 972×648 photo) |
| WhatsApp / Walter / Metalworks | absent |
| Call bar | hidden |

Tablet 768: H1 40/64 centre, hamburger visible, no photo, overflow-x 768.

Mobile 390: H1 40/64 centre, call bar 390×60 at y=784, no photo.

The missing rounded photograph is a **content-driven height delta**. The slot is implemented and returns null. ATS does not copy the reference dental-clinic still.

## Contact (empty public API origin)

Valid submit stays on `/contact/`, performs **no** `/inquiries` resource request, and shows:

*Online inquiry submission is being prepared. Please contact us by telephone or email.*

plus the tel and mailto alternatives. That is the honest state of this static export until `NEXT_PUBLIC_API_BASE_URL` is set at build time and a database is available.

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
