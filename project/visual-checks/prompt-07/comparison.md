# Prompt 7 visual comparison

Local static export served from `apps/web/out` and captured with Chrome/Playwright at 1440×900, 768×1024, and 390×844. Compared to Prompt 3 reference measurements. Pixel perfection is not claimed. Full-page pixel equivalence remains impossible until approved ATS media exist.

## Corrected header row (1440)

| Item | Reference | Implementation | Delta |
| --- | --- | --- | --- |
| Header height | 84px | 84px | 0 |
| Header row width | ~922px | 922px | 0 |
| Header row left | 259.19px | 259px | −0.2px |
| Logo `x` | 259.19px | 259px | −0.2px |
| Phone right edge | ~1181px | 1181px | 0 |
| Logo height | 65px | 65px | 0 |
| Logo width | 96.78px | 233.5px | +136.7px (ATS badge) |

Tablet/mobile gutters unchanged. Hamburger at 768 and 390. Header not sticky.

## Hero height and typography

| Viewport | Reference height | Implementation | Delta | H1 |
| --- | --- | --- | --- | --- |
| 1440 | 538px | 538px | 0 | 50px |
| 768 | 507px | 507px | 0 | 40px |
| 390 | 507px | 507px | 0 | 30px |

No hero photograph (none approved). Dark/black presentation. No rating badge.

## CTA dimensions

Desktop hero Contact us: **262.0 × 58px** (reference ~263 × 58, padding 12×78, radius 10, Inter 700). Width delta about −1px from the longer/shorter label geometry.

## Services container and grid

| Item | Reference | Implementation | Notes |
| --- | --- | --- | --- |
| Desktop columns | 3 | 3 | 981px inferred cut |
| Tablet columns | 1 | 1 (track 614px) | Matches 768 − 2×77 |
| Mobile columns | 1 | 1 | — |
| Card count | 3 | **9** | Canonical ATS services |
| Desktop section height | 621px | 556px | Text-led; no approved card photos |
| Card images | 300×200 stills | none | Publication-controlled |

Nine text-led cards add a third row. Missing 200px image blocks reduce each card. Net desktop services band is slightly shorter than the three-photo reference band.

## Additional homepage height

Reference home `scrollHeight` **4984px**. Implementation **2389px** (Δ −2595px). Driven by:

- no six-tile project mosaic (~780px)
- no Instagram / latest-work block
- no client-logo row
- no hero photograph
- text-led service cards instead of photo cards

Not an implementation bug.

## Missing project mosaic

`ProjectMosaic` is implemented and returns nothing while `projects` is empty. No empty tiles.

## About-section geometry

Cream band `rgba(155,108,0,0.07)`. Desktop two columns (logo/name left, copy right). Compact stacked at 768/390. Measured desktop about height **291px**. Reference about+Instagram padding was captured as one combined section, so height is not 1:1.

## Suppressed latest-work / client-brand sections

Not rendered. No empty cream Instagram block. No logo-row placeholders.

## CTA-band geometry

Background `rgb(71,71,71)`, padding **100px**, centred heading and red Contact us. Desktop height **361px** (no approved photographic layer; reference tablet band with photo was 499px).

## Corrected footer height

Desktop **401px** (reference 401.17px). Address lines are Jinja plot + Tanzania branch only.

## Mobile call bar

**390×60** at y=784. Label “Call Us Now”. Not WhatsApp. Hidden at 768 and 1440. No horizontal overflow (scrollWidth equals viewport at all three widths).

## Content-driven deviations (not defects)

- ATS Gift of God badge instead of a white wordmark
- Nine services instead of three
- No project tiles, testimonials, ratings, client logos, maps, or prices
- Hero and CTA band use recorded dark colour roles without unapproved photographs
