# Prompt 18 visual comparison

Chrome captures of production React components from the temporary `/walter-visual/{state}/` route. The route is absent from the official `apps/web/out` export. There are no handwritten HTML fixtures.

| State | Component | Expected | Observed |
| --- | --- | --- | --- |
| inbox-populated | `InquiryInbox` | Two inquiries, mailto/tel, Publication nav | Production inbox rows and actions |
| inquiry-detail | `InquiryDetail` | Name, mailto, tel, message, status control | Production detail definition list |
| status-saving | `InquiryDetail` | Update button shows Updating… | Disabled updating control |
| load-more | `InquiryInbox` | Load more inquiries button | Production load-more control |
| saved-draft | `ContentDraftEditor` | Saved draft notice, version 1, local preview | Canonical vs draft values |
| unsaved-draft | `ContentDraftEditor` | Unsaved changes marker | Edited heading retained |
| version-conflict | `ContentDraftEditor` | Conflict notice | Reload control available |
| reload-server-draft | `ContentDraftEditor` | Reload Server Draft button | Production conflict recovery |
| session-expired | `WalterSignInPage` | Sign-in form, session expired notice | No protected inquiry rows |
| forbidden | `WalterSignInPage` | Forbidden notice | No inbox |
| storage-unavailable | `InquiryInbox` | Storage unavailable notice | Inquiry records are not available yet |
| signing-out | Sign-in shell | Signing out… | Protected data cleared |
| publication-selection | `ContentPublications` | Selected overlay, draft hero, canonical contact | Local draft heading / Contact Us |
| preparing-publication | `ContentPublications` | Preparing publication… | Prepare control disabled |
| prepared-publication | `ContentPublications` | Overlay preview, no administrator sub | Hash prefix, no `admin-subject` |
| publication-pagination | `ContentPublications` | History plus publication-specific load-more control | Two prepared rows; corrected after audit to `Load more publications` |

All declared viewports: 1440×900, 768×1024, 390×844. `screenshot-dimensions.json` verifies the 48 retained PNGs match their declared viewport widths and cover at least the viewport height. The original capture did not retain DOM overflow values, so no retrospective no-overflow claim is made. Future runs of the capture script record those DOM measurements. WhatsApp, Metalworks, and live publication controls are absent.
