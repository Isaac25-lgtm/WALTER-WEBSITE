# scripts/

- `prepare-brand-assets.py` — crop ATS logo derivatives from the PDF 200 dpi render
- `capture-prompt-06-chrome.py` — local chrome screenshots for Prompt 6
- `capture-prompt-11-chrome.py` — Thank You actions and `/walter/` captures for Prompt 11
- `capture-prompt-12-chrome.py` — `/walter/` at 1440/768/390 and Prompt 11 viewport gaps
- `prove-public-api-inlining.mjs` — temporary static-export proof that `NEXT_PUBLIC_API_BASE_URL` is inlined; deletes only the temp copy
- `prove-public-api-inlining-chrome.py` — Chrome intercept for that temporary export
- `build-web.mjs` — static Next.js export; uses a temporary copy if `apps/web/.next` is locked
- `run-in-workspace.mjs` — run npm against the real F: workspace root
- `seed-publication-controls.mjs` — rebuild conservative publication-control defaults from canonical data
- `generate-public-content.mjs` — deterministic public snapshot for the static site
- `check-public-content.mjs` — freshness and leakage check

Do not put secrets here. Do not upload, migrate, or deploy from these scripts.
