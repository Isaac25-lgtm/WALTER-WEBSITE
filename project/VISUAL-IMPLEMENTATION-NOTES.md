# Visual implementation notes (Prompt 6–8)

Recorded computed values are used where Prompt 3 captured them. Inferences are labelled.

## Breakpoints (inferred)

Exact original CSS breakpoints were not dumped.

- **Navigation collapse: `max-width: 980px`.** Desktop inline nav is proven at 1440. Hamburger chrome is proven at 768 and 390. 980px is the smallest common Divi-like cut that reproduces those three captured layouts. Not a measured stylesheet value.
- **Mobile call bar: `max-width: 480px`.** The bar is proven at 390 (`390×60`, `top: 784`). It was **not** a measurable fixed box at 768 or 1440. 480px keeps the bar off tablet and desktop.

## Header

- Height **84px** desktop and **80px** compact: measured.
- Non-sticky: after `scrollTo(400)` the reference `position` remained `static`. No pin or shrink behaviour was added.
- Three visible links only: Services, Portfolio, Contact. Logo provides Home.
- Header content uses a **header-specific 922px row** at 1440 (left 259px, right 1181px). Body content stays on the shared **1080px / 180px** container. Prompt 6 used the 1080 container in the header (logo x 180); Prompt 7 corrected it. Measured logo x **259px** (reference 259.19).
- ATS logo at 65px height is **wider** than the reference ~97×65 wordmark because the Gift of God badge is a ~3.6:1 yellow rectangle. It was not squashed.
- Compact logo height **52px** at the hamburger breakpoint is inferred so the wide ATS badge does not collide with the 32px control on 390px screens.
- Mobile menu panel height **320px** matches the recorded **320.375px** within 0.4px after rebuild.
- Nav gap **28px** and phone gap **28px** are inferred; reference hover colour was unknown, so no extra hover geometry was added.
- Phone indicator is a small red handset SVG. The reference SVG was unknown; this is an inferred indicator, not a copied asset. No WhatsApp label or URL.

## Footer

- Black, three columns desktop, stack on compact viewports: recorded.
- Padding **54px** desktop / **50px** compact: measured.
- Desktop footer height **401px** after Prompt 7 (`min-height` + brand-column space where social icons would sit). Prompt 6 measured 349px.
- Social icons omitted because the generated social collection is empty. No fake social buttons.
- Address lines: `Plot 23A, Lubas Road, Jinja, Uganda` and `Tanzania branch: P.O. Box 551, Dodoma, Tanzania`. The duplicated “Jinja, Uganda headquarters” clause from Prompt 6 was removed.
- Privacy / Terms / Blog omitted; those destinations are unknown on the reference and are not ATS public routes.
- Legal line uses `legalFooterName` only. Dual legal-name presentation remains an editorial question in `content-gaps.md`. Organisation structure (Jinja headquarters, Dodoma branch) is settled.

## Homepage (Prompt 7, updated with owner-supplied company media)

- Hero min-heights **538 / 507 / 507** use `box-sizing: border-box` so padding is inside the recorded height. A selected crane-and-erection photograph now sits behind a controlled dark overlay. No rating badge.
- Services: nine canonical cards with nine capability-matched company photographs, three columns from the inferred **981px** desktop cut, one column at 768 and 390.
- The project mosaic now shows six generic featured-work categories. Latest work and client brands still render nothing while those generated collections are empty.
- The about split includes a storage-systems photograph. The closing CTA uses an industrial-process photograph behind a controlled dark overlay.
- Homepage copy lives in `context/canonical/public-copy.json`. Provenance is stripped before the public snapshot.
- The full selection lives in `context/canonical/company-media.json`; 21 images appear in five Portfolio groups, while 65 weaker, repetitive, ceremonial, close-portrait, or distracting images remain out of the public build.

## Call bar

- **60px** tall, full width, fixed bottom, red `rgb(224,43,32)`, label “Call Us Now”: measured at 390.
- z-index **10000** (controlled). Reference used `2147483647`; that max-int value was not copied.
- Body padding-bottom **76px** on the call-bar breakpoint so the bar does not cover footer copy.

## Typography

- Open Sans 400/500/700/800 and Inter 700, self-hosted via `@fontsource/*` latin files.
- Body 14/23.8, nav 15/500, H2 35/800, contact H1 40/64, home H1 50→40→30: recorded.
- System fallbacks: Helvetica, Arial, Lucida, sans-serif.

## Motion

- Recorded heading transition was **0s**. No invented easing. `prefers-reduced-motion` forces animation/transition none.

## Contact page (Prompt 8)

- Black page, white H1 **40/64** at every captured width, **centred** in the 1080px container (Prompt 9 corrected Prompt 8 left-alignment).
- Intro and `mailto:` / `tel:` links are centred. The extra Jinja/Dodoma line was removed from the introduction; those labels remain in generated content and the footer.
- Card max width is **1051px**, centred in the 1080px container (equal ~14.5px side offsets). Radius **10px**, padding **24px**.
- Desktop first four fields: two columns from the inferred **981px** cut. Tablet/mobile: one column.
- Inputs use `rgb(238,238,238)`, ~42px tall, visible labels, `focus-visible` ring. Textarea resizes vertically only.
- Submit **100×41.375**, radius **5px**, Open Sans 700 18/30.6, lower right.
- Visible labels and file-policy copy make the card ~82px taller than the placeholder-only reference card (512px). Accessibility, not a defect.
- Map slot returns null. Missing **450px** map is a content-driven height delta. Desktop scrollHeight **1413** vs reference **1848**.
- Mobile call bar remains **390×60**. Extra contact-page bottom padding and `scroll-margin-bottom` keep Submit, file hint, and the unavailable notice clear of the bar.
- Native file control is not the reference Divi “Choose Files” widget. Accepted types are JPG, PNG, WebP, PDF; max 1 MB; bytes are not uploaded.

Prompt 9 re-measured the centred heading and 1051px card under `project/visual-checks/prompt-09/`.

## Thank you page (Prompt 10)

- Black page, centred H1 **40/64/700/white**, matching Contact.
- Two support lines from `public-copy.json`: “We will be in touch.” and the other-work invitation.
- Reference photograph is **972×648** with ~30px radius. ATS does not copy the dental-clinic still. `ThankYouPhotoSlot` now uses one owner-supplied company photograph from the curated public-media snapshot.
- `/thank-you/` is not in the header or footer. Direct visits still render because the export is static.

Prompt 10 captures live under `project/visual-checks/prompt-10/`.

