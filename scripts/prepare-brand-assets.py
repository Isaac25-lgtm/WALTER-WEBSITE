"""Crop ATS logo derivatives from the canonical PDF raster without recolouring or redrawing."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PDF_SOURCE = ROOT / "active logo.pdf"
JPG_SOURCE = ROOT / "active logo.jpg"
PDF_RENDER = ROOT / "context" / "assets" / "brand" / "active-logo-pdf-render-200dpi.png"
OUT_DIR = ROOT / "apps" / "web" / "public" / "media" / "brand"
REPORT = ROOT / "project" / "BRAND-ASSET-REPORT.md"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    digest.update(path.read_bytes())
    return digest.hexdigest()


def crop_white_canvas(image: Image.Image, white_threshold: int = 248) -> tuple[Image.Image, tuple[int, int, int, int]]:
    rgb = image.convert("RGB")
    pixels = rgb.load()
    width, height = rgb.size
    left, top, right, bottom = width, height, 0, 0
    found = False
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            if r < white_threshold or g < white_threshold or b < white_threshold:
                found = True
                if x < left:
                    left = x
                if y < top:
                    top = y
                if x > right:
                    right = x
                if y > bottom:
                    bottom = y
    if not found:
        raise RuntimeError("Could not find a non-white logo field to crop.")
    box = (left, top, right + 1, bottom + 1)
    return rgb.crop(box), box


def resize_to_height(image: Image.Image, target_height: int) -> Image.Image:
    ratio = target_height / image.height
    target_width = max(1, round(image.width * ratio))
    return image.resize((target_width, target_height), Image.Resampling.LANCZOS)


def main() -> None:
    if not PDF_RENDER.exists():
        raise SystemExit("PDF 200dpi render is missing; refusing to invent a logo.")

    source_image = Image.open(PDF_RENDER)
    cropped, box = crop_white_canvas(source_image)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    master_path = OUT_DIR / "ats-logo-master.png"
    header_path = OUT_DIR / "ats-logo-header.png"
    footer_path = OUT_DIR / "ats-logo-footer.png"

    cropped.save(master_path, format="PNG", optimize=True)
    header = resize_to_height(cropped, 130)
    footer = resize_to_height(cropped, 160)
    header.save(header_path, format="PNG", optimize=True)
    footer.save(footer_path, format="PNG", optimize=True)

    pdf_hash = sha256(PDF_SOURCE)
    jpg_hash = sha256(JPG_SOURCE)
    report = f"""# Brand asset report

Prompt 6. Derivatives are cropped rasters of the canonical ATS mark. Colours, lettering, green border, and proportions were not redrawn or recolored.

## Source used

- Canonical source: `active logo.pdf`
- Production raster: `context/assets/brand/active-logo-pdf-render-200dpi.png` (200 dpi render of that PDF from Prompt 1)
- Raster fallback inspected but not used for output: `active logo.jpg`

## Source hashes (SHA-256)

- `active logo.pdf`: `{pdf_hash}`
- `active logo.jpg`: `{jpg_hash}`

Original files were read only. They were not renamed, moved, overwritten, or re-exported.

## Crop performed

- Input canvas: {source_image.size[0]} × {source_image.size[1]} px
- Non-white bounding box (inclusive pixel range converted to PIL crop box): `{box}`
- Cropped master: {cropped.size[0]} × {cropped.size[1]} px
- White page canvas outside the yellow badge was removed. The yellow field, green border, ATS lettering, and GIFT OF GOD line were kept.

## Outputs

| File | Dimensions | Format | Produced from |
| --- | --- | --- | --- |
| `apps/web/public/media/brand/ats-logo-master.png` | {cropped.size[0]} × {cropped.size[1]} | PNG | PDF 200 dpi render |
| `apps/web/public/media/brand/ats-logo-header.png` | {header.size[0]} × {header.size[1]} | PNG | same cropped PDF render, height 130px (2× of measured 65px header logo height) |
| `apps/web/public/media/brand/ats-logo-footer.png` | {footer.size[0]} × {footer.size[1]} | PNG | same cropped PDF render, height 160px |

Aspect ratio was preserved with LANCZOS resampling. No transparency was forced; the yellow badge remains opaque.

## Colour and proportion confirmation

Colours and proportions were not intentionally modified. No AI generation, recolour, simplification, or redraw was used. The original PDF was not copied into `public/`.
"""
    REPORT.write_text(report, encoding="utf-8")
    print(json.dumps({"master": str(master_path), "box": box, "master_size": cropped.size}, indent=2))


if __name__ == "__main__":
    main()
