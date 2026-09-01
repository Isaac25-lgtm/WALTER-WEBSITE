# Prompt 18 visual checks

Chrome captures of **production React components** from a temporary `/walter-visual/{state}/` route at **1440×900**, **768×1024**, and **390×844**.

The route injected deterministic adapters and component props. It was removed before the official `apps/web/out` export. This folder does **not** contain handwritten `fixtures/*.html`.

Administrator JWT `sub` values are not shown.

## States

| State | File prefix | Production surface |
| --- | --- | --- |
| Populated inbox | `inbox-populated` | `InquiryInbox` |
| Inquiry detail | `inquiry-detail` | `InquiryDetail` |
| Status saving | `status-saving` | `InquiryDetail` updating |
| Load More | `load-more` | `InquiryInbox` hasMore |
| Saved content draft | `saved-draft` | `ContentDraftEditor` |
| Unsaved draft | `unsaved-draft` | `ContentDraftEditor` |
| Version conflict | `version-conflict` | `ContentDraftEditor` |
| Reload Server Draft | `reload-server-draft` | `ContentDraftEditor` conflict action |
| Session expired | `session-expired` | `WalterSignInPage` unauthorized restore |
| Forbidden | `forbidden` | `WalterSignInPage` forbidden session |
| Storage unavailable | `storage-unavailable` | `InquiryInbox` notice |
| Signing out | `signing-out` | Signed-out shell with signing-out notice |
| Publication selection | `publication-selection` | `ContentPublications` selected overlay |
| Preparing publication | `preparing-publication` | `ContentPublications` preparing |
| Prepared publication | `prepared-publication` | `ContentPublications` overlay preview |
| Publication history pagination | `publication-pagination` | `ContentPublications` load more |

Each state has three PNG files: `*-1440x900.png`, `*-768x1024.png`, `*-390x844.png`.

Capture script: `scripts/capture-prompt-18-chrome.py`. Semantic capture records: `measurements.json`. PNG dimension audit: `screenshot-dimensions.json`. Comparison: `comparison.md`. Future recaptures also record DOM scroll/client dimensions, horizontal overflow, and the main-content rectangle.

Post-capture audit: the captured publication-pagination image exposed an inquiry-specific label on the publication control. The production component now says **Load more publications**. The retained PNG documents the defect that prompted the correction; it is not claimed as evidence of the corrected label.
