# Prompt 8 visual comparison

Local static export served from `apps/web/out` and captured with Chrome/Playwright at 1440×900, 768×1024, and 390×844. Compared to Prompt 3 reference Contact measurements. Pixel perfection is not claimed. Full-page pixel equivalence is impossible while the map is intentionally absent and while visible labels replace the reference’s placeholder-only fields.

## H1 geometry

| Item | Reference | Implementation | Delta |
| --- | --- | --- | --- |
| Font size | 40px | 40px | 0 |
| Line height | 64px | 64px | 0 |
| Weight | 700 | 700 | 0 |
| Colour | white | `rgb(255,255,255)` | 0 |
| Width at 1440 | 1080px | 1080px | 0 |
| Left at 1440 | 180px | 180px | 0 |
| Height | 64px | 64px | 0 |
| Mobile size | 40px (did not scale) | 40px | 0 |
| Alignment | centred (layout spec) | left (Prompt 8 phase 4) | instructed |

## Container and form card

| Item | Reference | Implementation | Delta |
| --- | --- | --- | --- |
| Form parent width | 1080px | 1080px | 0 |
| Form parent left | 180px | 180px | 0 |
| Card width | 1050.59px | 1080px | +29.4px (full 1080 content width) |
| Card height | 512.28px | 594.53px | +82.3px |
| Radius | 10px | 10px | 0 |
| Internal padding | not dumped | 24px | inferred |
| Background | white on black | `rgb(255,255,255)` on `rgb(0,0,0)` | match |

Card height is taller because ATS uses visible associated labels, an error-summary slot, and file-policy copy. The reference used placeholder text inside the controls. That is an accessibility delta, not a layout defect.

## Fields

| Item | Reference | Implementation |
| --- | --- | --- |
| Desktop grid | 2 columns | `506px 506px`, gap 20×18 |
| Tablet/mobile grid | 1 column | `566px` / `272px` |
| Input surface | light grey | `rgb(238,238,238)` |
| First-name height | ~40px | 41.8px |
| Message height | not dumped | 160.8px, `resize: vertical` |
| File control | Divi “Choose Files” plugin chrome | native file input + conservative accept list |

Native file chrome is not copied from the reference plugin. Accepted types are JPG, PNG, WebP, and PDF only.

## Submit button

| Item | Reference | Implementation | Delta |
| --- | --- | --- | --- |
| Width | 100.125px | 100px | −0.125px |
| Height | 41.375px | 41.375px | 0 |
| Radius | 5px | 5px | 0 |
| Font | Open Sans 700 18/30.6 | Open Sans 700 18/30.6 | 0 |
| Placement | lower right | x=1136 (24px from card right) | match |

## Black-page spacing

Desktop main padding-top **54px**. Tablet/mobile **50px**. Matches the recorded Contact main section. Header remains 84px desktop / 80px compact.

## Missing map height delta

Reference map iframe **1080×450**. Generated `mapCoordinates` is empty, so `ApprovedMapSlot` returns null. No iframe, blank tile, or invented pin.

Desktop `scrollHeight` **1413px** vs reference **1848px** (Δ **−435px**). The missing 450px map accounts for most of the shortfall. Extra form height from visible labels (~82px) and the omitted map margin fill the remainder. This is a publication/content-driven delta.

## Footer

Desktop footer height **401px**. Address lines remain Jinja plot + Tanzania branch. No social icons, Privacy, Terms, or Blog.

## Mobile call-bar clearance

Call bar **390×60** at y=784. Label “Call Us Now”. Not WhatsApp.

When Submit and the file-policy hint are scrolled into view:

- Submit bottom to bar: **+383px**
- Hint bottom to bar: **+444px**
- Unavailable notice bottom to bar: **+182px**

Contact page adds 128px bottom padding at the call-bar breakpoint, plus `scroll-margin-bottom` on controls. No horizontal overflow (`scrollWidth` equals viewport at 1440, 768, and 390).

## Validation-state differences

Reference empty submit used a Divi plugin message listing required fields. ATS shows an accessible error summary (`role="alert"`), field-level copy, `aria-invalid`, and `aria-describedby`. Invalid borders use the accent red. Values are preserved.

Valid submit stays on `/contact/`, shows the canonical unavailable message with `tel:` and `mailto:` alternatives, and does not use a success colour or icon.

## Intentionally not equivalent

- No map
- Left-aligned heading/intro (Prompt 8)
- Visible labels instead of placeholders
- Native file control and conservative formats
- ATS copy, contacts, and locations only
