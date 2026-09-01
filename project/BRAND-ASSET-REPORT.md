# Brand asset report

Prompt 6. Derivatives are cropped rasters of the canonical ATS mark. Colours, lettering, green border, and proportions were not redrawn or recolored.

## Source used

- Canonical source: `active logo.pdf`
- Production raster: `context/assets/brand/active-logo-pdf-render-200dpi.png` (200 dpi render of that PDF from Prompt 1)
- Raster fallback inspected but not used for output: `active logo.jpg`

## Source hashes (SHA-256)

- `active logo.pdf`: `f0404fc3983505654c556b3fb084a60e5f53d42f2c5126d9637a590203035a2e`
- `active logo.jpg`: `2cdb345e2a3cd4d505a2f00a35c66cdb55aa7dddce9e1ff37691dd163e4e8ea4`

Original files were read only. They were not renamed, moved, overwritten, or re-exported.

## Crop performed

- Input canvas: 1654 × 1166 px
- Non-white bounding box (inclusive pixel range converted to PIL crop box): `(93, 378, 1561, 787)`
- Cropped master: 1468 × 409 px
- White page canvas outside the yellow badge was removed. The yellow field, green border, ATS lettering, and GIFT OF GOD line were kept.

## Outputs

| File | Dimensions | Format | Produced from |
| --- | --- | --- | --- |
| `apps/web/public/media/brand/ats-logo-master.png` | 1468 × 409 | PNG | PDF 200 dpi render |
| `apps/web/public/media/brand/ats-logo-header.png` | 467 × 130 | PNG | same cropped PDF render, height 130px (2× of measured 65px header logo height) |
| `apps/web/public/media/brand/ats-logo-footer.png` | 574 × 160 | PNG | same cropped PDF render, height 160px |

Aspect ratio was preserved with LANCZOS resampling. No transparency was forced; the yellow badge remains opaque.

## Colour and proportion confirmation

Colours and proportions were not intentionally modified. No AI generation, recolour, simplification, or redraw was used. The original PDF was not copied into `public/`.
