# Implementation fidelity checklist

For a later QA prompt. Compare the ATS **public** site to `context/reference/` evidence. Fail if Metalworks identity appears. `/walter` is out of scope.

Evidence: `reference-site-inventory.json`, `screenshot-register.json`, `reference-layout-spec.md`, `reference-measurements.json`, `reference-design-tokens.json`, `reference-component-map.json`, `reference-responsive-spec.md`, `reference-interaction-spec.md`.

Mark each item pass / fail / not-run. Viewports: **1440×900**, **768×1024**, **390×844**.

## Route structure

- [ ] Public routes analogue: home, contact, portfolio (or named ATS equivalents)
- [ ] Hash scroll to services from header items that are not separate pages
- [ ] Thank-you exists only as post-submit (not in header)
- [ ] No public `/blog`, `/project` empty archive, or `/projects` 404-as-feature
- [ ] `/walter` absent from public nav, footer, and visible copy

## Section order

- [ ] Home: header → hero → services cards → overlay projects → portfolio CTA → about split → social slot (empty ok) → client-logo slot (empty ok) → CTA band → footer
- [ ] Contact: header → heading → intro contacts → form card → map placeholder → footer
- [ ] Portfolio: header → carousel → testimonials slot (empty ok) → Contact us → gallery → Contact us → footer

## Desktop geometry (1440)

- [ ] Content max-width ~**1080px**, side gutters ~**180px**
- [ ] Header row ~**84px**, logo left, nav, tel right
- [ ] Hero full-bleed; H1 ~**50px/65px**, centred, white
- [ ] Primary button ~**58px**, padding ~12×78, radius **10px**, red `rgb(224,43,32)`
- [ ] Services **3+ columns wrapping** (nine ATS cards, not forced to three total)
- [ ] Overlay tiles **3 across** in two rows when six projects exist
- [ ] Footer **three columns**

## Tablet geometry (768)

- [ ] Header ~**80px** with hamburger
- [ ] Home H1 ~**40px/52px**
- [ ] Content width ~**614px**, gutters ~**77px**
- [ ] Service cards **stacked**
- [ ] Map iframe width tracks content (~614), height **450**
- [ ] Footer stacked, padding ~**50px**

## Mobile geometry (390)

- [ ] Header ~**80px**, hamburger **32×32**
- [ ] Home H1 ~**30px/39px**
- [ ] Content width ~**312px**, gutters **39px**
- [ ] Overlay tiles **single column**, row height ~**300px**
- [ ] Contact H1 still ~**40/64** (does not shrink like home H1)
- [ ] Fixed call bar **full width × 60px** at bottom
- [ ] Map width ~**312**, height **450**

## Typography

- [ ] Body **Open Sans** (or equivalent licensed stack), **14px**, grey `rgb(102,102,102)`
- [ ] Headings Open Sans; home H2 **35px** weight **800**
- [ ] Primary CTAs **Inter** 700 **20px/34px** (or documented equivalent)
- [ ] Submit Open Sans 700 **18px**, radius **5px**
- [ ] No unidentified display font asserted without evidence

## Spacing

- [ ] Section padding ~**54px** desktop / ~**50px** tablet-mobile where measured
- [ ] CTA band padding **100px** vertical
- [ ] Overlay rows 0 vertical padding

## Image crops

- [ ] Hero cover/centre full-bleed (ATS assets only)
- [ ] Service cards rounded photos
- [ ] Overlay tiles edge-to-edge with dark title overlay
- [ ] Portfolio carousel height scales down (405 → 216 → 110 class)
- [ ] No reference-site photographs

## Navigation

- [ ] Desktop inline; 768/390 hamburger
- [ ] Hamburger opens absolute panel; toggle closes
- [ ] Header **not** sticky unless later evidence contradicts this record
- [ ] Logo home; Contact to contact route

## Interactions

- [ ] Primary hover: fill stays red; border may go transparent (do not invert to a new invented colour)
- [ ] Contact us → contact page
- [ ] View Portfolio → gallery
- [ ] Empty form lists First Name, Last Name, Email, Mobile, Message
- [ ] File optional, max **1 MB**
- [ ] Carousel dots present if carousel is implemented
- [ ] Social Load More / Follow omitted or empty until ATS URLs exist

## Form behaviour

- [ ] Fields: First, Last, Email, Mobile, Message *, optional file
- [ ] Desktop 2×2 + full message; mobile single column
- [ ] Submit bottom-right of white card (radius ~10px on card)
- [ ] Success → thank-you analogue

## Footer

- [ ] Logo + social slots (empty ok) | About/Contact/legal | phones, email, Jinja + Dodoma
- [ ] Copyright line
- [ ] No Dublin address, no Metalworks email/phone

## Fixed widgets

- [ ] Mobile full-width call bar 60px, `tel:` ATS number
- [ ] Desktop call control not invented as a FAB if still unobserved
- [ ] No cookie/chat widgets copied from reference (none observed)

## Accessibility

- [ ] Real H1 per page
- [ ] Logo and hamburger have accessible names
- [ ] Form labels associated
- [ ] Map placeholder named when shown
- [ ] Do not copy empty or hashtag `alt` from the reference

## ATS identity substitution

- [ ] Public name Active Technical Services / ATS
- [ ] Gift of God logo only
- [ ] Nine services from `services.json`
- [ ] Projects from `projects.json` with publication review
- [ ] Quote-only; no price cards
- [ ] Testimonials empty
- [ ] Client logos empty
- [ ] Map unpinned placeholder
- [ ] Walter absent

## Prohibition on reference assets / copy / code

- [ ] No Metalworks / metalfabrication.ie images in `public/` or served media
- [ ] No copied marketing sentences, testimonials, or customer names
- [ ] No Irish phone, Dublin address, or hello@metalworksdublin.ie
- [ ] No Google rating graphic
- [ ] No Instagram embed of metalworksdublin
- [ ] No copied CSS/JS/HTML from the reference
- [ ] Screenshots remain only under `context/reference/screenshots/`
