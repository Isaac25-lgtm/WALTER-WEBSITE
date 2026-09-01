/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WalterSignInPage } from "./WalterSignInPage";
import { MANAGEMENT_COPY } from "./management-copy";
import type { IdentityAdapter } from "../../lib/auth/identity-adapter";
import type { ContentDraftItem, ManagementInquiryDetail, ManagementInquirySummary } from "@ats/contracts";

afterEach(() => {
  cleanup();
});

const idleAdapter = (): IdentityAdapter => ({
  signIn: vi.fn(async () => ({ ok: false as const, code: "unavailable" as const })),
  restoreSession: vi.fn(async () => ({ ok: false as const, code: "none" as const })),
  signOut: vi.fn(async () => undefined),
});

const summary: ManagementInquirySummary = {
  id: "11111111-1111-4111-8111-111111111111",
  status: "new",
  createdAt: "2026-09-01T06:00:00.000Z",
  updatedAt: "2026-09-01T06:00:00.000Z",
  firstName: "Ada",
  lastName: "Okello",
  email: "ada@example.com",
  phone: "+256 700 000 000",
  hasAttachment: false,
};

const summaryPageTwo: ManagementInquirySummary = {
  ...summary,
  id: "22222222-2222-4222-8222-222222222222",
  firstName: "Ben",
  lastName: "Okot",
  email: "ben@example.com",
};

const detail: ManagementInquiryDetail = {
  ...summary,
  message: "Please quote a warehouse frame in Jinja.\nNeed a site visit.",
  attachment: null,
};

const draft: ContentDraftItem = {
  key: "homepage.heroHeading",
  page: "homepage",
  section: "hero",
  label: "Homepage hero heading",
  description: "Primary homepage headline. Keep it factual and short.",
  value: "Engineering, fabrication and construction solutions",
  canonicalValue: "Engineering, fabrication and construction solutions",
  version: 0,
  createdAt: null,
  updatedAt: null,
  updatedBySubject: null,
  isDraft: false,
  minLength: 1,
  maxLength: 120,
  multiline: false,
  canonicalSelector: "homepage.heroHeading",
  plainTextPolicy: "plain_text_no_html",
};

describe("management sign-in", { timeout: 15_000 }, () => {
  it("shows an honest unavailable state when the identity adapter cannot sign in", async () => {
    const user = userEvent.setup();
    const identityAdapter = idleAdapter();
    render(<WalterSignInPage identityAdapter={identityAdapter} />);
    await waitFor(() => screen.getByLabelText(MANAGEMENT_COPY.emailLabel));
    await user.type(screen.getByLabelText(MANAGEMENT_COPY.emailLabel), "owner@example.com");
    await user.type(screen.getByLabelText(MANAGEMENT_COPY.passwordLabel), "not-a-real-password");
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.submitLabel }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(MANAGEMENT_COPY.unavailable);
    });
    expect(screen.queryByText(MANAGEMENT_COPY.signedIn)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("not-a-real-password");
  });

  it("restores a Neon session, lists inquiries with pagination, and signs out through Neon Auth", async () => {
    const user = userEvent.setup();
    const identityAdapter: IdentityAdapter = {
      signIn: vi.fn(),
      restoreSession: vi.fn(async () => ({ ok: true as const, accessToken: "test-access-token" })),
      signOut: vi.fn(async () => undefined),
    };
    const sessionFetcher = vi.fn(async () => ({
      ok: true as const,
      data: { authenticated: true as const, role: "administrator" as const },
    }));
    const listFetcher = vi.fn(async (_token: string, options: { cursor?: string } = {}) => {
      if (options.cursor) {
        return { ok: true as const, data: { inquiries: [summaryPageTwo], nextCursor: null } };
      }
      return { ok: true as const, data: { inquiries: [summary], nextCursor: "cursor-1" } };
    });
    const detailFetcher = vi.fn(async () => ({ ok: true as const, data: detail }));
    const statusUpdater = vi.fn(async () => ({
      ok: true as const,
      data: { ...detail, status: "in_progress" as const },
    }));

    render(
      <WalterSignInPage
        identityAdapter={identityAdapter}
        sessionFetcher={sessionFetcher}
        listFetcher={listFetcher}
        detailFetcher={detailFetcher}
        statusUpdater={statusUpdater}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(MANAGEMENT_COPY.signedIn)).toBeInTheDocument();
    });
    expect(identityAdapter.restoreSession).toHaveBeenCalled();
    expect(sessionFetcher).toHaveBeenCalledWith("test-access-token");
    await waitFor(() => {
      expect(screen.getByText("Ada Okello")).toBeInTheDocument();
    });
    expect(screen.getByText(summary.phone)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: summary.email })).toHaveAttribute("href", `mailto:${summary.email}`);
    expect(screen.getByRole("link", { name: summary.phone }).getAttribute("href")).toMatch(/^tel:/);
    expect(screen.getByText(MANAGEMENT_COPY.noAttachmentShort)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("test-access-token");
    expect(document.body.textContent).not.toContain(detail.message);

    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.loadMore }));
    await waitFor(() => {
      expect(screen.getByText("Ben Okot")).toBeInTheDocument();
    });
    expect(listFetcher).toHaveBeenCalledWith("test-access-token", { status: "all", cursor: "cursor-1" });

    await user.click(screen.getByRole("button", { name: /Ada Okello/ }));
    await waitFor(() => {
      expect(screen.getByText(/Please quote a warehouse frame in Jinja/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Need a site visit/)).toBeInTheDocument();
    expect(screen.getByText(/Need a site visit/)).toHaveClass("walter-message");
    await user.selectOptions(screen.getByLabelText(MANAGEMENT_COPY.statusLabel), "in_progress");
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.updateStatus }));
    await waitFor(() => {
      expect(statusUpdater).toHaveBeenCalledWith("test-access-token", detail.id, "in_progress");
    });

    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.signOut }));
    await waitFor(() => {
      expect(identityAdapter.signOut).toHaveBeenCalled();
      expect(screen.getByLabelText(MANAGEMENT_COPY.emailLabel)).toBeInTheDocument();
    });
  });

  it("previews a local content draft without treating it as public publication", async () => {
    const user = userEvent.setup();
    const identityAdapter: IdentityAdapter = {
      signIn: vi.fn(),
      restoreSession: vi.fn(async () => ({ ok: true as const, accessToken: "test-access-token" })),
      signOut: vi.fn(async () => undefined),
    };
    const contentListFetcher = vi.fn(async () => ({
      ok: true as const,
      data: { drafts: [draft] },
    }));
    const contentSaveFetcher = vi.fn(async () => ({
      ok: true as const,
      data: {
        ...draft,
        value: "Local draft heading",
        version: 1,
        isDraft: true,
        createdAt: "2026-09-01T08:00:00.000Z",
        updatedAt: "2026-09-01T08:00:00.000Z",
        updatedBySubject: "admin-subject-1",
      },
    }));
    const contentResetFetcher = vi.fn(async () => ({ ok: true as const, data: draft }));

    render(
      <WalterSignInPage
        identityAdapter={identityAdapter}
        sessionFetcher={async () => ({
          ok: true as const,
          data: { authenticated: true as const, role: "administrator" as const },
        })}
        listFetcher={async () => ({ ok: true as const, data: { inquiries: [], nextCursor: null } })}
        contentListFetcher={contentListFetcher}
        contentSaveFetcher={contentSaveFetcher}
        contentResetFetcher={contentResetFetcher}
      />,
    );

    await waitFor(() => screen.getByRole("button", { name: MANAGEMENT_COPY.contentSection }));
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.contentSection }));
    await waitFor(() => screen.getByLabelText(draft.label));
    expect(screen.getByText(MANAGEMENT_COPY.previewNotice)).toBeInTheDocument();
    const field = screen.getByLabelText(draft.label);
    await user.clear(field);
    await user.type(field, "Local draft heading");
    expect(screen.getAllByText("Local draft heading").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.saveDraft }));
    await waitFor(() => {
      expect(contentSaveFetcher).toHaveBeenCalledWith("test-access-token", draft.key, "Local draft heading", 0);
      expect(screen.getByText(MANAGEMENT_COPY.draftSavedPublicUnchanged)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.resetDraft }));
    await waitFor(() => {
      expect(contentResetFetcher).toHaveBeenCalledWith("test-access-token", draft.key, 1);
      expect(screen.getByText(MANAGEMENT_COPY.draftResetPublicUnchanged)).toBeInTheDocument();
    });
  });

  it("keeps unsaved text on a 409 conflict and offers Reload Server Draft", async () => {
    const user = userEvent.setup();
    const identityAdapter: IdentityAdapter = {
      signIn: vi.fn(),
      restoreSession: vi.fn(async () => ({ ok: true as const, accessToken: "test-access-token" })),
      signOut: vi.fn(async () => undefined),
    };
    const contentSaveFetcher = vi.fn(async () => ({ ok: false as const, code: "version_conflict" as const }));

    render(
      <WalterSignInPage
        identityAdapter={identityAdapter}
        sessionFetcher={async () => ({
          ok: true as const,
          data: { authenticated: true as const, role: "administrator" as const },
        })}
        listFetcher={async () => ({ ok: true as const, data: { inquiries: [], nextCursor: null } })}
        contentListFetcher={async () => ({ ok: true as const, data: { drafts: [draft] } })}
        contentSaveFetcher={contentSaveFetcher}
      />,
    );

    await waitFor(() => screen.getByRole("button", { name: MANAGEMENT_COPY.contentSection }));
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.contentSection }));
    await waitFor(() => screen.getByLabelText(draft.label));
    const field = screen.getByLabelText(draft.label);
    await user.clear(field);
    await user.type(field, "Unsaved local heading");
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.saveDraft }));
    await waitFor(() => {
      expect(screen.getAllByText(MANAGEMENT_COPY.contentConflict).length).toBeGreaterThan(0);
    });
    expect(screen.getByLabelText(draft.label)).toHaveValue("Unsaved local heading");
    expect(screen.getByRole("button", { name: MANAGEMENT_COPY.reloadServerDraft })).toBeInTheDocument();
  });

  it("prepares a local publication without showing administrator subjects", async () => {
    const user = userEvent.setup();
    const identityAdapter: IdentityAdapter = {
      signIn: vi.fn(),
      restoreSession: vi.fn(async () => ({ ok: true as const, accessToken: "test-access-token" })),
      signOut: vi.fn(async () => undefined),
    };
    const publication = {
      id: "33333333-3333-4333-8333-333333333333",
      status: "prepared" as const,
      contentHash: "a".repeat(64),
      entryCount: 14,
      createdAt: "2026-09-01T08:00:00.000Z",
      entries: [
        {
          key: "homepage.heroHeading" as const,
          value: "Local draft heading",
          source: "draft" as const,
          sourceDraftVersion: 1,
        },
      ],
    };
    const publicationPrepareFetcher = vi.fn(async () => ({ ok: true as const, data: publication }));
    const publicationListFetcher = vi.fn(async () => ({
      ok: true as const,
      data: {
        publications: [
          {
            id: publication.id,
            status: publication.status,
            contentHash: publication.contentHash,
            entryCount: publication.entryCount,
            createdAt: publication.createdAt,
          },
        ],
        nextCursor: "publication-cursor-1",
      },
    }));

    render(
      <WalterSignInPage
        identityAdapter={identityAdapter}
        sessionFetcher={async () => ({
          ok: true as const,
          data: { authenticated: true as const, role: "administrator" as const },
        })}
        listFetcher={async () => ({ ok: true as const, data: { inquiries: [], nextCursor: null } })}
        contentListFetcher={async () => ({ ok: true as const, data: { drafts: [{ ...draft, version: 1, isDraft: true, value: "Local draft heading" }] } })}
        publicationListFetcher={publicationListFetcher}
        publicationPrepareFetcher={publicationPrepareFetcher}
      />,
    );

    await waitFor(() => screen.getByRole("button", { name: MANAGEMENT_COPY.publicationSection }));
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.publicationSection }));
    await waitFor(() => screen.getByRole("button", { name: MANAGEMENT_COPY.preparePublication }));
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.preparePublication }));
    await waitFor(() => {
      expect(publicationPrepareFetcher).toHaveBeenCalledWith("test-access-token", {
        "homepage.heroHeading": 1,
      });
      expect(screen.getByText("Local draft heading")).toBeInTheDocument();
    });
    expect(document.body.textContent).not.toContain("admin-subject-1");
    expect(document.body.textContent).not.toContain("test-access-token");
    expect(document.body.textContent).not.toContain("createdBySubject");
    expect(screen.getByRole("button", { name: MANAGEMENT_COPY.loadMorePublications })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: MANAGEMENT_COPY.loadMore })).not.toBeInTheDocument();
  });

  it("omits canonical keys from prepare so live drafts are not forced into the overlay", async () => {
    const user = userEvent.setup();
    const identityAdapter: IdentityAdapter = {
      signIn: vi.fn(),
      restoreSession: vi.fn(async () => ({ ok: true as const, accessToken: "test-access-token" })),
      signOut: vi.fn(async () => undefined),
    };
    const publication = {
      id: "44444444-4444-4444-8444-444444444444",
      status: "prepared" as const,
      contentHash: "b".repeat(64),
      entryCount: 14,
      createdAt: "2026-09-01T08:00:00.000Z",
      entries: [
        {
          key: "homepage.heroHeading" as const,
          value: draft.canonicalValue,
          source: "canonical" as const,
          sourceDraftVersion: null,
        },
      ],
    };
    const publicationPrepareFetcher = vi.fn(async () => ({ ok: true as const, data: publication }));

    render(
      <WalterSignInPage
        identityAdapter={identityAdapter}
        sessionFetcher={async () => ({
          ok: true as const,
          data: { authenticated: true as const, role: "administrator" as const },
        })}
        listFetcher={async () => ({ ok: true as const, data: { inquiries: [], nextCursor: null } })}
        contentListFetcher={async () => ({
          ok: true as const,
          data: {
            drafts: [
              draft,
              {
                ...draft,
                key: "contact.heading",
                page: "contact",
                section: "intro",
                label: "Contact heading",
                canonicalSelector: "contact.heading",
                version: 1,
                isDraft: true,
                value: "Selected contact heading",
              },
            ],
          },
        })}
        publicationListFetcher={async () => ({
          ok: true as const,
          data: { publications: [], nextCursor: null },
        })}
        publicationPrepareFetcher={publicationPrepareFetcher}
      />,
    );

    await waitFor(() => screen.getByRole("button", { name: MANAGEMENT_COPY.publicationSection }));
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.publicationSection }));
    await waitFor(() => screen.getByRole("button", { name: MANAGEMENT_COPY.preparePublication }));
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.preparePublication }));
    await waitFor(() => {
      expect(publicationPrepareFetcher).toHaveBeenCalledWith("test-access-token", {
        "contact.heading": 1,
      });
    });
  });

  it("clears protected data immediately even if Neon sign-out has not finished", async () => {
    const user = userEvent.setup();
    let finishSignOut: (() => void) | undefined;
    const identityAdapter: IdentityAdapter = {
      signIn: vi.fn(),
      restoreSession: vi.fn(async () => ({ ok: true as const, accessToken: "test-access-token" })),
      signOut: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finishSignOut = resolve;
          }),
      ),
    };

    render(
      <WalterSignInPage
        identityAdapter={identityAdapter}
        sessionFetcher={async () => ({
          ok: true as const,
          data: { authenticated: true as const, role: "administrator" as const },
        })}
        listFetcher={async () => ({ ok: true as const, data: { inquiries: [summary], nextCursor: null } })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Ada Okello")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.signOut }));
    await waitFor(() => {
      expect(screen.getByLabelText(MANAGEMENT_COPY.emailLabel)).toBeInTheDocument();
      expect(screen.getByText(MANAGEMENT_COPY.signingOutLabel)).toBeInTheDocument();
    });
    expect(screen.queryByText("Ada Okello")).not.toBeInTheDocument();
    finishSignOut?.();
    await waitFor(() => {
      expect(screen.getByText(MANAGEMENT_COPY.signedOut)).toBeInTheDocument();
    });
  });

  it("reports an identity-provider failure honestly after clearing protected data", async () => {
    const user = userEvent.setup();
    const identityAdapter: IdentityAdapter = {
      signIn: vi.fn(),
      restoreSession: vi.fn(async () => ({ ok: true as const, accessToken: "test-access-token" })),
      signOut: vi.fn(async () => {
        throw new Error("provider failed");
      }),
    };

    render(
      <WalterSignInPage
        identityAdapter={identityAdapter}
        sessionFetcher={async () => ({
          ok: true as const,
          data: { authenticated: true as const, role: "administrator" as const },
        })}
        listFetcher={async () => ({ ok: true as const, data: { inquiries: [summary], nextCursor: null } })}
      />,
    );

    await waitFor(() => expect(screen.getByText("Ada Okello")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: MANAGEMENT_COPY.signOut }));
    await waitFor(() => {
      expect(screen.getByText(MANAGEMENT_COPY.signOutProviderError)).toBeInTheDocument();
    });
    expect(screen.queryByText("Ada Okello")).not.toBeInTheDocument();
  });

  it("keeps a skip link in the management layout", () => {
    const layout = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../app/walter/layout.tsx"),
      "utf8",
    );
    expect(layout).toContain("walter-skip-link");
    expect(layout).toContain("#main-content");
    expect(layout).toContain("MANAGEMENT_COPY.skipToContent");
  });
});
