# Brand asset report

Derivatives are cropped rasters of the canonical ATS mark. Colours, lettering, green border, and proportions were not redrawn or recolored.

## Source used

- Canonical input: `context/assets/brand/active-logo-pdf-render-200dpi.png` (200 dpi raster of the original logo artwork, committed to this repository)
- Raster fallback inspected but not used for output: `active logo.jpg`

The original `active logo.pdf` is no longer part of this repository. It was the upstream
origin of the 200 dpi raster above, which is retained as the canonical input so these
derivatives remain reproducible without it. `active logo.jpg` is not used as the crop
input: its JPEG compression noise widens the non-white bounding box and would change the
published logo crop.

## Source hashes (SHA-256)

- `context/assets/brand/active-logo-pdf-render-200dpi.png`: `da4aa452b4a05ecdc5c6cf2227ce6f4e3c1ed8f857405e495a190e3b952a2ef3`
- `active logo.jpg`: `2cdb345e2a3cd4d505a2f00a35c66cdb55aa7dddce9e1ff37691dd163e4e8ea4`

Source files were read only. They were not renamed, moved, overwritten, or re-exported.

## Crop performed

- Input canvas: 1654 × 1166 px
- Non-white bounding box (inclusive pixel range converted to PIL crop box): `(93, 378, 1561, 787)`
- Cropped master: 1468 × 409 px
- White page canvas outside the yellow badge was removed. The yellow field, green border, ATS lettering, and GIFT OF GOD line were kept.

## Outputs

| File | Dimensions | Format | Produced from |
| --- | --- | --- | --- |
| `apps/web/public/media/brand/ats-logo-master.png` | 1468 × 409 | PNG | 200 dpi brand raster |
| `apps/web/public/media/brand/ats-logo-header.png` | 467 × 130 | PNG | same cropped raster, height 130px (2× of measured 65px header logo height) |
| `apps/web/public/media/brand/ats-logo-footer.png` | 574 × 160 | PNG | same cropped raster, height 160px |

Aspect ratio was preserved with LANCZOS resampling. No transparency was forced; the yellow badge remains opaque.

## Colour and proportion confirmation

Colours and proportions were not intentionally modified. No AI generation, recolour, simplification, or redraw was used. No source document was copied into `public/`.
