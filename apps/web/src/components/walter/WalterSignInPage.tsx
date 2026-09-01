"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import type {
  ContentDraftItem,
  ContentDraftKey,
  ContentPublicationDetail,
  ContentPublicationSummary,
  InquiryStatus,
  ManagementInquiryDetail,
  ManagementInquirySummary,
} from "@ats/contracts";
import { createIdentityAdapter, type IdentityAdapter } from "../../lib/auth/create-identity-adapter";
import {
  fetchManagementContentDraft,
  fetchManagementContentDrafts,
  resetManagementContentDraft,
  saveManagementContentDraft,
} from "../../lib/auth/management-content-drafts";
import {
  fetchManagementInquiries,
  fetchManagementInquiry,
  updateManagementInquiryStatus,
} from "../../lib/auth/management-inquiries";
import {
  fetchManagementContentPublication,
  fetchManagementContentPublications,
  prepareManagementContentPublication,
} from "../../lib/auth/management-publications";
import { fetchManagementSession } from "../../lib/auth/management-session";
import type { ManagementClientFailureCode } from "../../lib/auth/management-request";
import { signOutWithTimeout } from "../../lib/auth/sign-out-with-timeout";
import { ContentDraftEditor } from "./ContentDraftEditor";
import { ContentPublications } from "./ContentPublications";
import { InquiryDetail } from "./InquiryDetail";
import { InquiryInbox } from "./InquiryInbox";
import { MANAGEMENT_COPY } from "./management-copy";

type PageState =
  | "restoring"
  | "idle"
  | "invalid"
  | "submitting"
  | "unavailable"
  | "invalid_credentials"
  | "forbidden"
  | "session_unavailable"
  | "network_error"
  | "timeout"
  | "malformed"
  | "signed_in";

type ManagementSection = "inquiries" | "content" | "publication";

function noticeFor(state: PageState): string | null {
  if (state === "unavailable" || state === "network_error") return MANAGEMENT_COPY.unavailable;
  if (state === "timeout") return MANAGEMENT_COPY.timeout;
  if (state === "malformed") return MANAGEMENT_COPY.malformed;
  if (state === "invalid" || state === "invalid_credentials") return MANAGEMENT_COPY.invalid;
  if (state === "forbidden") return MANAGEMENT_COPY.forbidden;
  if (state === "session_unavailable") return MANAGEMENT_COPY.sessionUnavailable;
  return null;
}

function noticeForFailure(code: ManagementClientFailureCode): string {
  if (code === "timeout") return MANAGEMENT_COPY.timeout;
  if (code === "malformed_response") return MANAGEMENT_COPY.malformed;
  if (code === "unexpected") return MANAGEMENT_COPY.unexpected;
  if (code === "version_conflict") return MANAGEMENT_COPY.contentConflict;
  if (code === "unsupported_media_type") return MANAGEMENT_COPY.unexpected;
  return MANAGEMENT_COPY.inboxUnavailable;
}

function isAuthLoss(code: ManagementClientFailureCode): boolean {
  return code === "unauthorized" || code === "forbidden" || code === "authentication_unavailable";
}

function summaryFromDetail(detail: ManagementInquiryDetail): ManagementInquirySummary {
  return {
    id: detail.id,
    firstName: detail.firstName,
    lastName: detail.lastName,
    email: detail.email,
    phone: detail.phone,
    status: detail.status,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    hasAttachment: detail.hasAttachment,
  };
}

function dedupeInquiries(
  current: ManagementInquirySummary[],
  incoming: ManagementInquirySummary[],
): ManagementInquirySummary[] {
  const seen = new Set(current.map((row) => row.id));
  const next = [...current];
  for (const row of incoming) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    next.push(row);
  }
  return next;
}

export function WalterSignInPage({
  identityAdapter = createIdentityAdapter(),
  sessionFetcher = fetchManagementSession,
  listFetcher = fetchManagementInquiries,
  detailFetcher = fetchManagementInquiry,
  statusUpdater = updateManagementInquiryStatus,
  contentListFetcher = fetchManagementContentDrafts,
  contentItemFetcher = fetchManagementContentDraft,
  contentSaveFetcher = saveManagementContentDraft,
  contentResetFetcher = resetManagementContentDraft,
  publicationListFetcher = fetchManagementContentPublications,
  publicationPrepareFetcher = prepareManagementContentPublication,
  publicationDetailFetcher = fetchManagementContentPublication,
}: {
  identityAdapter?: IdentityAdapter;
  sessionFetcher?: typeof fetchManagementSession;
  listFetcher?: typeof fetchManagementInquiries;
  detailFetcher?: typeof fetchManagementInquiry;
  statusUpdater?: typeof updateManagementInquiryStatus;
  contentListFetcher?: typeof fetchManagementContentDrafts;
  contentItemFetcher?: typeof fetchManagementContentDraft;
  contentSaveFetcher?: typeof saveManagementContentDraft;
  contentResetFetcher?: typeof resetManagementContentDraft;
  publicationListFetcher?: typeof fetchManagementContentPublications;
  publicationPrepareFetcher?: typeof prepareManagementContentPublication;
  publicationDetailFetcher?: typeof fetchManagementContentPublication;
}) {
  const idPrefix = useId();
  const listGeneration = useRef(0);
  const publicationGeneration = useRef(0);
  const sessionAlive = useRef(0);
  const loadingMoreRef = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<PageState>("restoring");
  const [accessToken, setAccessToken] = useState("");
  const [section, setSection] = useState<ManagementSection>("inquiries");
  const [filter, setFilter] = useState<InquiryStatus | "all">("all");
  const [inquiries, setInquiries] = useState<ManagementInquirySummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [inboxNotice, setInboxNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<ManagementInquiryDetail | null>(null);
  const [pendingStatus, setPendingStatus] = useState<InquiryStatus>("new");
  const [updating, setUpdating] = useState(false);
  const [detailNotice, setDetailNotice] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ContentDraftItem[]>([]);
  const [draftEdits, setDraftEdits] = useState<Partial<Record<ContentDraftKey, string>>>({});
  const [savingKey, setSavingKey] = useState<ContentDraftKey | null>(null);
  const [contentNotice, setContentNotice] = useState<string | null>(null);
  const [conflictKeys, setConflictKeys] = useState<ContentDraftKey[]>([]);
  const [publications, setPublications] = useState<ContentPublicationSummary[]>([]);
  const [selectedPublication, setSelectedPublication] = useState<ContentPublicationDetail | null>(null);
  const [publicationCursor, setPublicationCursor] = useState<string | null>(null);
  const [creatingPublication, setCreatingPublication] = useState(false);
  const [loadingMorePublications, setLoadingMorePublications] = useState(false);
  const [publicationNotice, setPublicationNotice] = useState<string | null>(null);
  const [signedOutNotice, setSignedOutNotice] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const submitting = state === "submitting";
  const notice = noticeFor(state);

  const clearProtectedState = useCallback((nextState: PageState = "idle") => {
    sessionAlive.current += 1;
    listGeneration.current += 1;
    publicationGeneration.current += 1;
    setAccessToken("");
    setInquiries([]);
    setNextCursor(null);
    setSelected(null);
    setInboxNotice(null);
    setDetailNotice(null);
    setDrafts([]);
    setDraftEdits({});
    setContentNotice(null);
    setConflictKeys([]);
    setPublications([]);
    setSelectedPublication(null);
    setPublicationCursor(null);
    setPublicationNotice(null);
    setSection("inquiries");
    setState(nextState);
  }, []);

  const handleAuthLoss = useCallback(
    (code: ManagementClientFailureCode): boolean => {
      if (!isAuthLoss(code)) return false;
      if (code === "forbidden") clearProtectedState("forbidden");
      else if (code === "authentication_unavailable") clearProtectedState("session_unavailable");
      else {
        setSignedOutNotice(MANAGEMENT_COPY.sessionExpired);
        clearProtectedState("idle");
      }
      return true;
    },
    [clearProtectedState],
  );

  async function confirmSession(token: string): Promise<boolean> {
    const session = await sessionFetcher(token);
    if (session.ok) {
      setAccessToken(token);
      setState("signed_in");
      return true;
    }
    if (session.code === "forbidden") setState("forbidden");
    else if (
      session.code === "not_configured" ||
      session.code === "authentication_unavailable" ||
      session.code === "storage_unavailable"
    ) {
      setState("session_unavailable");
    } else if (session.code === "unauthorized") {
      setSignedOutNotice(MANAGEMENT_COPY.sessionExpired);
      setState("idle");
    } else if (session.code === "timeout") setState("timeout");
    else if (session.code === "malformed_response") setState("malformed");
    else setState("network_error");
    setAccessToken("");
    return false;
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const restored = await identityAdapter.restoreSession();
      if (cancelled) return;
      if (!restored.ok) {
        setState("idle");
        return;
      }
      const ok = await confirmSession(restored.accessToken);
      if (cancelled || !ok) return;
    })();
    return () => {
      cancelled = true;
    };
    // Restore once on mount for the injected adapter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identityAdapter]);

  useEffect(() => {
    if (state !== "signed_in" || !accessToken || selected || section !== "inquiries") return;
    const generation = ++listGeneration.current;
    const alive = sessionAlive.current;
    void (async () => {
      const result = await listFetcher(accessToken, { status: filter });
      if (generation !== listGeneration.current || alive !== sessionAlive.current) return;
      if (!result.ok) {
        if (handleAuthLoss(result.code)) return;
        setInquiries([]);
        setNextCursor(null);
        setInboxNotice(noticeForFailure(result.code));
        return;
      }
      setInboxNotice(null);
      setInquiries(result.data.inquiries);
      setNextCursor(result.data.nextCursor);
    })();
  }, [accessToken, filter, handleAuthLoss, listFetcher, section, selected, state]);

  useEffect(() => {
    if (state !== "signed_in" || !accessToken || section !== "publication") return;
    const generation = ++publicationGeneration.current;
    const alive = sessionAlive.current;
    void (async () => {
      const result = await publicationListFetcher(accessToken);
      if (generation !== publicationGeneration.current || alive !== sessionAlive.current) return;
      if (!result.ok) {
        if (handleAuthLoss(result.code)) return;
        setPublications([]);
        setPublicationCursor(null);
        setPublicationNotice(MANAGEMENT_COPY.publicationUnavailable);
        return;
      }
      setPublicationNotice(null);
      setPublications(result.data.publications);
      setPublicationCursor(result.data.nextCursor);
    })();
  }, [accessToken, handleAuthLoss, publicationListFetcher, section, state]);

  useEffect(() => {
    if (state !== "signed_in" || !accessToken || section !== "content") return;
    let cancelled = false;
    const alive = sessionAlive.current;
    void (async () => {
      const result = await contentListFetcher(accessToken);
      if (cancelled || alive !== sessionAlive.current) return;
      if (!result.ok) {
        if (handleAuthLoss(result.code)) return;
        setDrafts([]);
        setContentNotice(MANAGEMENT_COPY.contentUnavailable);
        return;
      }
      setContentNotice(null);
      setDrafts(result.data.drafts);
      setDraftEdits({});
      setConflictKeys([]);
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, contentListFetcher, handleAuthLoss, section, state]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || state === "restoring") return;
    if (!email.trim() || !password) {
      setState("invalid");
      return;
    }
    setSignedOutNotice(null);
    setSigningOut(false);
    setState("submitting");
    const signedIn = await identityAdapter.signIn({ email: email.trim(), password });
    setPassword("");
    if (!signedIn.ok) {
      if (signedIn.code === "invalid_credentials") setState("invalid_credentials");
      else if (signedIn.code === "unavailable") setState("unavailable");
      else if (signedIn.code === "timeout") setState("timeout");
      else setState("network_error");
      return;
    }
    await confirmSession(signedIn.accessToken);
  }

  async function onSignOut() {
    setSigningOut(true);
    setSignedOutNotice(MANAGEMENT_COPY.signingOutLabel);
    clearProtectedState("idle");
    const outcome = await signOutWithTimeout(() => identityAdapter.signOut());
    setSigningOut(false);
    if (outcome === "timeout") setSignedOutNotice(MANAGEMENT_COPY.signOutTimeout);
    else if (outcome === "provider_error") setSignedOutNotice(MANAGEMENT_COPY.signOutProviderError);
    else setSignedOutNotice(MANAGEMENT_COPY.signedOut);
  }

  async function onOpen(id: string) {
    const alive = sessionAlive.current;
    const result = await detailFetcher(accessToken, id);
    if (alive !== sessionAlive.current) return;
    if (!result.ok) {
      if (handleAuthLoss(result.code)) return;
      setInboxNotice(noticeForFailure(result.code));
      return;
    }
    setSelected(result.data);
    setPendingStatus(result.data.status);
    setDetailNotice(null);
  }

  async function onLoadMore() {
    if (!nextCursor || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const generation = listGeneration.current;
    const alive = sessionAlive.current;
    const result = await listFetcher(accessToken, { status: filter, cursor: nextCursor });
    loadingMoreRef.current = false;
    setLoadingMore(false);
    if (generation !== listGeneration.current || alive !== sessionAlive.current) return;
    if (!result.ok) {
      if (handleAuthLoss(result.code)) return;
      setInboxNotice(noticeForFailure(result.code));
      return;
    }
    setInquiries((current) => dedupeInquiries(current, result.data.inquiries));
    setNextCursor(result.data.nextCursor);
  }

  async function onUpdateStatus() {
    if (!selected) return;
    setUpdating(true);
    const result = await statusUpdater(accessToken, selected.id, pendingStatus);
    setUpdating(false);
    if (!result.ok) {
      if (handleAuthLoss(result.code)) return;
      setDetailNotice(noticeForFailure(result.code));
      return;
    }
    setSelected(result.data);
    setPendingStatus(result.data.status);
    setDetailNotice(null);
    setInquiries((current) =>
      current.map((row) => (row.id === result.data.id ? summaryFromDetail(result.data) : row)),
    );
  }

  async function onSaveDraft(key: ContentDraftKey) {
    const current = drafts.find((item) => item.key === key);
    const value = draftEdits[key] ?? current?.value;
    if (!value) return;
    setSavingKey(key);
    const alive = sessionAlive.current;
    const result = await contentSaveFetcher(accessToken, key, value, current?.version ?? 0);
    if (alive !== sessionAlive.current) return;
    setSavingKey(null);
    if (!result.ok) {
      if (handleAuthLoss(result.code)) return;
      if (result.code === "version_conflict") {
        setContentNotice(MANAGEMENT_COPY.contentConflict);
        setConflictKeys((keys) => (keys.includes(key) ? keys : [...keys, key]));
        return;
      }
      setContentNotice(MANAGEMENT_COPY.contentUnavailable);
      return;
    }
    setContentNotice(MANAGEMENT_COPY.draftSavedPublicUnchanged);
    setConflictKeys((keys) => keys.filter((item) => item !== key));
    setDrafts((items) => items.map((item) => (item.key === key ? result.data : item)));
    setDraftEdits((currentEdits) => {
      const next = { ...currentEdits };
      delete next[key];
      return next;
    });
  }

  async function onResetDraft(key: ContentDraftKey) {
    const current = drafts.find((item) => item.key === key);
    setSavingKey(key);
    const result = await contentResetFetcher(accessToken, key, current?.version ?? 0);
    setSavingKey(null);
    if (!result.ok) {
      if (handleAuthLoss(result.code)) return;
      if (result.code === "version_conflict") {
        setContentNotice(MANAGEMENT_COPY.contentConflict);
        setConflictKeys((keys) => (keys.includes(key) ? keys : [...keys, key]));
        return;
      }
      setContentNotice(MANAGEMENT_COPY.contentUnavailable);
      return;
    }
    setContentNotice(MANAGEMENT_COPY.draftResetPublicUnchanged);
    setConflictKeys((keys) => keys.filter((item) => item !== key));
    setDrafts((items) => items.map((item) => (item.key === key ? result.data : item)));
    setDraftEdits((currentEdits) => {
      const next = { ...currentEdits };
      delete next[key];
      return next;
    });
  }

  async function onReloadDraft(key: ContentDraftKey) {
    const result = await contentItemFetcher(accessToken, key);
    if (!result.ok) {
      if (handleAuthLoss(result.code)) return;
      setContentNotice(MANAGEMENT_COPY.contentUnavailable);
      return;
    }
    setDrafts((items) => items.map((item) => (item.key === key ? result.data : item)));
    setDraftEdits((currentEdits) => {
      const next = { ...currentEdits };
      delete next[key];
      return next;
    });
    setConflictKeys((keys) => keys.filter((item) => item !== key));
  }

  async function onPreparePublication() {
    setCreatingPublication(true);
    const alive = sessionAlive.current;
    const currentDrafts = await contentListFetcher(accessToken);
    if (alive !== sessionAlive.current) {
      setCreatingPublication(false);
      return;
    }
    if (!currentDrafts.ok) {
      setCreatingPublication(false);
      if (handleAuthLoss(currentDrafts.code)) return;
      setPublicationNotice(MANAGEMENT_COPY.publicationUnavailable);
      return;
    }
    const expectedDraftVersions = Object.fromEntries(
      currentDrafts.data.drafts.filter((draft) => draft.isDraft).map((draft) => [draft.key, draft.version]),
    );
    const result = await publicationPrepareFetcher(accessToken, expectedDraftVersions);
    if (alive !== sessionAlive.current) {
      setCreatingPublication(false);
      return;
    }
    setCreatingPublication(false);
    if (!result.ok) {
      if (handleAuthLoss(result.code)) return;
      setPublicationNotice(
        result.code === "version_conflict" ? MANAGEMENT_COPY.contentConflict : MANAGEMENT_COPY.publicationUnavailable,
      );
      return;
    }
    setPublicationNotice(null);
    setSelectedPublication(result.data);
    setPublications((current) => [
      {
        id: result.data.id,
        status: result.data.status,
        contentHash: result.data.contentHash,
        entryCount: result.data.entryCount,
        createdAt: result.data.createdAt,
      },
      ...current.filter((item) => item.id !== result.data.id),
    ]);
  }

  async function onOpenPublication(id: string) {
    const result = await publicationDetailFetcher(accessToken, id);
    if (!result.ok) {
      if (handleAuthLoss(result.code)) return;
      setPublicationNotice(MANAGEMENT_COPY.publicationUnavailable);
      return;
    }
    setSelectedPublication(result.data);
  }

  async function onLoadMorePublications() {
    if (!publicationCursor || loadingMorePublications) return;
    setLoadingMorePublications(true);
    const generation = publicationGeneration.current;
    const alive = sessionAlive.current;
    const result = await publicationListFetcher(accessToken, { cursor: publicationCursor });
    setLoadingMorePublications(false);
    if (generation !== publicationGeneration.current || alive !== sessionAlive.current) return;
    if (!result.ok) {
      if (handleAuthLoss(result.code)) return;
      setPublicationNotice(MANAGEMENT_COPY.publicationUnavailable);
      return;
    }
    setPublications((current) => {
      const seen = new Set(current.map((row) => row.id));
      return [...current, ...result.data.publications.filter((row) => !seen.has(row.id))];
    });
    setPublicationCursor(result.data.nextCursor);
  }

  if (state === "restoring") {
    return (
      <div className="walter-page">
        <h1>{MANAGEMENT_COPY.heading}</h1>
        <p role="status">{MANAGEMENT_COPY.restoring}</p>
      </div>
    );
  }

  if (state === "signed_in") {
    return (
      <div className="walter-page walter-page-wide">
        <header className="walter-toolbar">
          <div>
            <h1>{MANAGEMENT_COPY.heading}</h1>
            <p>{MANAGEMENT_COPY.signedIn}</p>
          </div>
          <button type="button" onClick={() => void onSignOut()}>
            {MANAGEMENT_COPY.signOut}
          </button>
        </header>
        <nav className="walter-section-nav" aria-label={MANAGEMENT_COPY.sectionNavLabel}>
          <button
            type="button"
            className={section === "inquiries" ? "is-active" : undefined}
            aria-current={section === "inquiries" ? "page" : undefined}
            onClick={() => {
              setSection("inquiries");
              setSelected(null);
            }}
          >
            {MANAGEMENT_COPY.inquiriesSection}
          </button>
          <button
            type="button"
            className={section === "content" ? "is-active" : undefined}
            aria-current={section === "content" ? "page" : undefined}
            onClick={() => {
              setSection("content");
              setSelected(null);
              setSelectedPublication(null);
            }}
          >
            {MANAGEMENT_COPY.contentSection}
          </button>
          <button
            type="button"
            className={section === "publication" ? "is-active" : undefined}
            aria-current={section === "publication" ? "page" : undefined}
            onClick={() => {
              setSection("publication");
              setSelected(null);
            }}
          >
            {MANAGEMENT_COPY.publicationSection}
          </button>
        </nav>
        {section === "publication" ? (
          <ContentPublications
            publications={publications}
            selected={selectedPublication}
            preparing={creatingPublication}
            notice={publicationNotice}
            hasMore={Boolean(publicationCursor)}
            loadingMore={loadingMorePublications}
            onPrepare={() => void onPreparePublication()}
            onOpen={(id) => void onOpenPublication(id)}
            onLoadMore={() => void onLoadMorePublications()}
          />
        ) : section === "content" ? (
          <ContentDraftEditor
            drafts={drafts}
            edits={draftEdits}
            savingKey={savingKey}
            notice={contentNotice}
            conflictKeys={conflictKeys}
            onEdit={(key, value) => setDraftEdits((current) => ({ ...current, [key]: value }))}
            onSave={(key) => void onSaveDraft(key)}
            onReset={(key) => void onResetDraft(key)}
            onReload={(key) => void onReloadDraft(key)}
          />
        ) : selected ? (
          <InquiryDetail
            inquiry={selected}
            pendingStatus={pendingStatus}
            updating={updating}
            notice={detailNotice}
            onBack={() => setSelected(null)}
            onStatusChange={setPendingStatus}
            onUpdateStatus={() => void onUpdateStatus()}
          />
        ) : (
          <InquiryInbox
            inquiries={inquiries}
            filter={filter}
            onFilterChange={(next) => {
              listGeneration.current += 1;
              setFilter(next);
              setNextCursor(null);
            }}
            onOpen={(id) => void onOpen(id)}
            onLoadMore={() => void onLoadMore()}
            hasMore={Boolean(nextCursor)}
            loadingMore={loadingMore}
            notice={inboxNotice}
          />
        )}
      </div>
    );
  }

  return (
    <div className="walter-page">
      <h1>{MANAGEMENT_COPY.heading}</h1>
      <p>{MANAGEMENT_COPY.supporting}</p>
      <form className="walter-form" onSubmit={onSubmit} noValidate aria-busy={submitting || undefined}>
        <label htmlFor={`${idPrefix}-email`}>
          {MANAGEMENT_COPY.emailLabel}
          <input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            disabled={submitting}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label htmlFor={`${idPrefix}-password`}>
          {MANAGEMENT_COPY.passwordLabel}
          <input
            id={`${idPrefix}-password`}
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            disabled={submitting}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? MANAGEMENT_COPY.submittingLabel : MANAGEMENT_COPY.submitLabel}
        </button>
      </form>
      {signingOut || signedOutNotice ? (
        <p className="walter-notice" role="status">
          {signedOutNotice ?? MANAGEMENT_COPY.signingOutLabel}
        </p>
      ) : notice ? (
        <p className="walter-notice" role="status">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
