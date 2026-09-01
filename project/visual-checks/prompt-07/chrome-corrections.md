# Prompt 7 chrome corrections

Measured on the local static export at 1440×900 after the header-row, footer-height, and address-wording changes.

## Header row width

| | Prompt 6 | Prompt 7 | Reference |
| --- | --- | --- | --- |
| Inner row width | 1080px (shared body container) | **922px** | ~922px |
| Row left edge | 180px | **259px** | 259.19px |
| Row right edge | 1260px | **1181px** | ~1181px |

Header-specific container `.container--header`. Body content remains 1080px / 180px. Tablet and mobile gutters unchanged (77px / 39px).

## Header logo x-position

| | Prompt 6 | Prompt 7 | Reference |
| --- | --- | --- | --- |
| Logo `x` | 180px | **259px** | 259.19px |
| Logo height | 65px | 65px | 65px |
| Logo width | 233.5px | 233.5px | 96.78px (Metalworks wordmark) |

Logo x-delta versus reference: **−0.2px**. Width remains larger because the ATS badge is not squashed.

## Phone right edge

| | Prompt 7 | Target |
| --- | --- | --- |
| Phone box `x` | 1042.02px | — |
| Phone box width | 138.98px | — |
| Right edge | **1181.00px** | ~1181px |

Header height remains **84px**. Navigation stays between the logo and the telephone.

## Footer height

| | Prompt 6 | Prompt 7 | Reference |
| --- | --- | --- | --- |
| Desktop footer height | 349px | **401px** | 401.17px |

Extra height is empty brand-column space (where social icons would sit) plus `min-height: 401px` with `box-sizing: border-box`. No fake social buttons.

## Footer address wording

Before: `Plot 23A, Lubas Road, Jinja, Uganda. Jinja, Uganda headquarters.`

After:

- `Plot 23A, Lubas Road, Jinja, Uganda`
- `Tanzania branch: P.O. Box 551, Dodoma, Tanzania`

Organisation structure is unchanged: Jinja is the primary operation; Dodoma is the Tanzania branch.
