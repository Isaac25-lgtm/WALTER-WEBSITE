# Prompt 6 visual comparison

Local static export served from `apps/web/out` and captured with Chrome/Playwright at 1440×900, 768×1024, and 390×844. Compared to Prompt 3 reference measurements and screenshots. Pixel perfection is not claimed.

## Header height

| Viewport | Reference | Implementation | Delta |
| --- | --- | --- | --- |
| 1440 | 84px | 84px | 0 |
| 768 | 80px | 80px | 0 |
| 390 | 80px | 80px | 0 |

Header `position` is static (not sticky), matching the recorded scroll probe.

## Container / gutter

| Item | Reference | Implementation | Delta |
| --- | --- | --- | --- |
| Desktop content max | 1080px | 1080px | 0 |
| Desktop content gutter | 180px | 180px | 0 |
| Header logo `x` at 1440 | 259.19px (header row) | 180px (shared 1080 container) | −79px |
| Tablet gutter | ~77px | 77px | 0 |
| Mobile gutter | 39px | 39px | 0 |

The header logo starts at the 180px content gutter rather than the tighter Theme Builder header offset. Documented in `VISUAL-IMPLEMENTATION-NOTES.md`.

## Logo bounding box (desktop)

| Property | Reference Metalworks mark | ATS implementation | Notes |
| --- | --- | --- | --- |
| Height | 65px | 65px | Matched |
| Width | 96.78px | 233.5px | ATS yellow badge is ~3.6:1; not squashed |
| Vertical centre in 84px bar | ~9.5px top offset | 9.5px | Matched |

## Navigation position

Desktop: logo left, three white 15px links, telephone at the right with a red handset. Links measured ~230px wide as a group, right of centre. No visible Home item. Hamburger hidden at 1440; visible at 768 and 390.

## Mobile menu

- Absolute panel under the header, full viewport width, black.
- Open height measured **320px** after rebuild (reference **320.375px**, delta −0.4px).
- `aria-expanded` toggles; Escape and link selection close the panel (automated tests).
- Compact absolute panel, not a full-screen drawer.

## Footer column alignment

Desktop three columns: brand / nav / address. Implementation footer height **349px** vs reference **401px** (−52px), mainly because social icons are omitted while `socialLinks` is empty. Compact viewports stack brand → nav → contact, with extra bottom space so the call bar does not cover the copyright line.

## Mobile call bar

| Property | Reference | Implementation | Delta |
| --- | --- | --- | --- |
| Size | 390×60 | 390×60 | 0 |
| Top at 844 viewport | 784 | 784 | 0 |
| Label | Call Us Now | Call Us Now | — |
| WhatsApp | n/a | none | — |

Not shown at 768 or 1440.

## Known differences caused by ATS content

- Yellow Gift of God badge instead of a white Metalworks wordmark.
- Wider logo at the same 65px height.
- Three ATS labels (Services / Portfolio / Contact) instead of Residential / Commercial / Contact.
- Uganda telephone instead of the Irish number.
- Jinja headquarters + Dodoma branch in the footer; no Dublin address.
- No social icons, testimonials, maps, or project photographs.

## Unresolved inferred breakpoint

`980px` (nav) and `480px` (call bar) remain inferences. Re-measure a live CSS breakpoint only if a later visual QA captures one from the reference stylesheets.
