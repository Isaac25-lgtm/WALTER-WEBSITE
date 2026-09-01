# Prompt 9 Contact corrections

Compared Prompt 8 measured values with Prompt 9 Chrome captures at 1440×900. Reference card width remains 1050.59px.

## Before (Prompt 8)

| Item | Value |
| --- | --- |
| H1 `text-align` | left |
| Introduction `text-align` | left |
| Extra location row | visible (`Jinja, Uganda · Tanzania branch: Dodoma, Tanzania`) |
| Form-card width | 1080px |
| Form-card x | 180px |
| Card side offsets | 0 / 0 |
| Top of form card | y = 337.39 |
| Intro-to-card gap | ~16px (after location row) |
| Submit | 100 × 41.375px at x=1136 |

## After (Prompt 9)

| Item | Value |
| --- | --- |
| H1 `text-align` | center |
| H1 size | 40px / 64px |
| Introduction `text-align` | center |
| Extra location row | removed (`places_visible`: 0) |
| Form-card width | **1051px** |
| Form-card x | 194.5px |
| Card side offsets | **14.5px / 14.5px** |
| Top of form card | y = 313.59 |
| Intro-to-card gap | **32px** |
| Submit | **100 × 41.375px**, radius 5px |
| Map | none |
| Mobile call bar | 390×60 at y=784; Submit clearance +382.5px |
| Valid submit URL | stays `/contact/`; unavailable message only |

## Deltas vs reference / Prompt 8

| Item | Reference | Prompt 8 | Prompt 9 | Notes |
| --- | --- | --- | --- | --- |
| H1 alignment | centre | left | centre | corrected |
| Intro alignment | centre | left | centre | corrected |
| Card width | 1050.59px | 1080px | 1051px | +0.41px vs reference |
| Card x | ~194.7 inferred | 180 | 194.5 | equal margins |
| Submit | 100.125 × 41.375 | 100 × 41.375 | 100 × 41.375 | −0.125px width |

No backend status appears on the Contact page. Locations remain in the footer and generated content.
