# Reference responsive specification

Observed 2026-08-31. Viewports captured: **1440×900**, **768×1024**, **390×844**. Exact CSS breakpoint pixels were **not** dumped from stylesheets; behaviour below is what those three widths did.

Do not copy Metalworks content. Preserve these layout transformations.

## Navigation

| Viewport | Behaviour |
| --- | --- |
| 1440 | Inline nav: Residential, Commercial, Contact + tel. Logo left. Header row **84px**. |
| 768 | Header **80px**. Hamburger present (same pattern as mobile). Click-open of the panel was **tested at 390 only**; treat 768 as hamburger chrome with **unknown** panel metrics until re-measured. |
| 390 | Hamburger **32×32** at x≈310, y≈30. Opens **absolute** panel **~320px** tall: Residential / Commercial / Contact. Toggle closes. Header phone text cluster not shown as desktop tel; **fixed call bar** appears instead. |

## Header sticky

After `scrollTo(400)`, computed `position` was **`static`** at all three widths. Class `et_pb_sticky_module` exists. **Do not implement sticky until a later visual QA proves it.**

## Home

| Section | 1440 | 768 | 390 |
| --- | --- | --- | --- |
| Hero | Full-bleed, height **538**, H1 **50/65** | Height **507**, starts below 80px header, H1 **40/52** | Height **507**, H1 **30/39** |
| CTA buttons | 58px, padding 12×78, radius 10 — width ~263 | Same computed size | Same computed size (~263 still fits 390) |
| Google rating | Visible under hero CTA | Present in DOM | Present in DOM |
| What we do cards | **3 columns**, section ~621px | Section ~1256px → **1 column stacked** | Section ~1232px → **1 column** |
| Overlay project tiles | **3×2**, row heights 380 / 400 | Two sections **450** each; column count **unknown** | Two sections **300** each; **1 column** |
| View Portfolio | Centred black button | Centred | Centred |
| About split | Two columns on cream | Stacked (section taller ~1648) | Stacked |
| Instagram | ~353px squares; three across in 1080 row | Narrower row ~614px; column count unknown | 312px content width; likely 1 column |
| Brand logos | Logo row | Stacked / wrapped (unknown exact) | Stacked |
| CTA band | padding 100/100, full-bleed photo | padding 100/100, height 499 | Same padding class; full width |
| Footer | **3 columns**, ~401px, padding 54 | Stacked, ~635px, padding 50 | Stacked, padding 50 |
| Call widget | DOM only, **0×0** | Not in fixedEls | **Fixed 390×60** bottom |

Visual order of home sections does **not** reverse between viewports. Only column count, type size, gutters, and header chrome change.

## Contact

| Element | 1440 | 768 | 390 |
| --- | --- | --- | --- |
| H1 | 40/64, width 1080 | 40/64 | **Still 40/64** (does not scale like home H1) |
| Form fields | **2×2** then full-width message | Intermediate; form still card | **1 column** |
| Submit | Bottom-right of card, 100×41, radius 5 | Same size | Same size |
| Map iframe | **1080×450** | **614×450** | **312×450** (height held) |
| Gutters | 180 | ~77 | 39 |
| Call bar | Geometry unknown | Geometry unknown | Overlaps bottom of form/page |

## Portfolio

| Element | 1440 | 768 | 390 |
| --- | --- | --- | --- |
| Carousel | height **405.5** | **216.25** | **109.8** — image crop/scale tightens; dots remain |
| Testimonials | **3 cards** | Column count unknown | **1 column** (screenshot estimate) |
| Gallery | ~**4** across first row | Fewer columns (unknown exact) | 1–2 unknown exact; treat as stacked until re-counted |
| Contact us CTAs | Two, 58px red | Same button metrics | Same button metrics |

## Thank you / blog / empty archive / 404

- Header/footer transform with the same hamburger rule.
- Thank-you photo remains large and rounded; it scales down with content width.
- Blog uses a different WordPress sidebar layout; **not** an ATS public pattern.
- `/project/` empty state and `/projects/` 404 keep chrome; **not** ATS public routes.

## Typography scaling (computed)

- Body **14px** Open Sans at all three widths.
- Home H2 **35/35** at all three widths (does not shrink).
- Service H3 **20/20** at all three widths.
- Home H1 **is** the element that scales: 50 → 40 → 30.

## Image crop / position

- Hero is background-image treatment on a black section (`backgroundImage: none` on the section object while a photographic layer is still visible — exact `background-size` **unknown**; visually cover/centre).
- Overlay tiles are full-bleed crops; mobile height 300 vs desktop 380–400.
- Portfolio carousel height drops sharply on small screens (crop more aggressive).
- Map height stays **450** while width shrinks.

## CTA placement

- Hero CTA stays centred under the headline at all widths.
- Contact Submit stays bottom-right of the form card (may look full-row on very narrow cards — **unknown** wrap).
- Mobile adds the **fixed call bar**; desktop header tel remains the call affordance.

## Section padding changes

- Several sections use **54px** top/bottom at 1440 and **50px** at 768/390 (footer, contact main, some home sections).
- CTA band keeps **100px** top/bottom at tablet as well as desktop.
- Overlay sections have **0** vertical padding; height is the image row.
