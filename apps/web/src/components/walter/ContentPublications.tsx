"use client";

import type { ContentPublicationDetail, ContentPublicationSummary } from "@ats/contracts";
import { formatManagementDateTime } from "../../lib/auth/format-datetime";
import { overlayPublicContent } from "../../lib/auth/overlay-public-content";
import { MANAGEMENT_COPY } from "./management-copy";

export function ContentPublications({
  publications,
  selected,
  preparing,
  notice,
  hasMore,
  loadingMore,
  onPrepare,
  onOpen,
  onLoadMore,
}: {
  publications: ContentPublicationSummary[];
  selected: ContentPublicationDetail | null;
  preparing: boolean;
  notice: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  onPrepare: () => void;
  onOpen: (_id: string) => void;
  onLoadMore: () => void;
}) {
  const previewValues = selected
    ? Object.fromEntries(selected.entries.map((entry) => [entry.key, entry.value]))
    : null;
  const preview = previewValues ? overlayPublicContent(previewValues) : null;

  return (
    <section className="walter-content" aria-labelledby="walter-publication-heading">
      <h2 id="walter-publication-heading">{MANAGEMENT_COPY.publicationHeading}</h2>
      <p>{MANAGEMENT_COPY.publicationSupporting}</p>
      <button type="button" disabled={preparing} onClick={onPrepare}>
        {preparing ? MANAGEMENT_COPY.preparingPublication : MANAGEMENT_COPY.preparePublication}
      </button>
      {notice ? (
        <p className="walter-notice" role="status">
          {notice}
        </p>
      ) : null}
      {publications.length === 0 && !notice ? (
        <p className="walter-notice" role="status">
          {MANAGEMENT_COPY.emptyPublications}
        </p>
      ) : (
        <ul className="walter-inquiry-list">
          {publications.map((publication) => (
            <li key={publication.id}>
              <button type="button" className="walter-inquiry-row" onClick={() => onOpen(publication.id)}>
                <span className="walter-inquiry-name">
                  {MANAGEMENT_COPY.publicationStatus} · {MANAGEMENT_COPY.publicationEntryCount}: {publication.entryCount}
                </span>
                <span className="walter-inquiry-meta">{publication.contentHash.slice(0, 12)}</span>
                <time dateTime={publication.createdAt}>{formatManagementDateTime(publication.createdAt)}</time>
              </button>
            </li>
          ))}
        </ul>
      )}
      {hasMore ? (
        <button type="button" className="walter-load-more" disabled={loadingMore} onClick={onLoadMore}>
          {loadingMore ? MANAGEMENT_COPY.loadingMorePublications : MANAGEMENT_COPY.loadMorePublications}
        </button>
      ) : null}
      {preview && selected ? (
        <aside className="walter-preview" aria-labelledby="walter-publication-preview-heading">
          <h3 id="walter-publication-preview-heading">{MANAGEMENT_COPY.publicationPreviewHeading}</h3>
          <p className="walter-preview-notice">{MANAGEMENT_COPY.publicationSupporting}</p>
          <p className="walter-preview-title">{preview.homepage.heroHeading}</p>
          <p>{preview.homepage.heroSupporting}</p>
          <p className="walter-preview-title">{preview.contact.heading}</p>
          <p>{preview.contact.introduction}</p>
        </aside>
      ) : null}
    </section>
  );
}
