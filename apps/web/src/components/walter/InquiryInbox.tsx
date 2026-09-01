"use client";

import type { InquiryStatus, ManagementInquirySummary } from "@ats/contracts";
import { formatManagementDateTime } from "../../lib/auth/format-datetime";
import { telHref } from "../../lib/tel";
import { MANAGEMENT_COPY } from "./management-copy";

const FILTERS: Array<{ id: InquiryStatus | "all"; label: string }> = [
  { id: "all", label: MANAGEMENT_COPY.filterAll },
  { id: "new", label: MANAGEMENT_COPY.filterNew },
  { id: "in_progress", label: MANAGEMENT_COPY.filterInProgress },
  { id: "closed", label: MANAGEMENT_COPY.filterClosed },
];

function statusLabel(status: InquiryStatus): string {
  if (status === "in_progress") return MANAGEMENT_COPY.filterInProgress;
  if (status === "closed") return MANAGEMENT_COPY.filterClosed;
  return MANAGEMENT_COPY.filterNew;
}

export function InquiryInbox({
  inquiries,
  filter,
  onFilterChange,
  onOpen,
  onLoadMore,
  hasMore,
  loadingMore,
  notice,
}: {
  inquiries: ManagementInquirySummary[];
  filter: InquiryStatus | "all";
  onFilterChange: (_next: InquiryStatus | "all") => void;
  onOpen: (_id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  notice: string | null;
}) {
  return (
    <section className="walter-inbox" aria-labelledby="walter-inbox-heading">
      <h2 id="walter-inbox-heading">{MANAGEMENT_COPY.inboxHeading}</h2>
      <div className="walter-filters" role="group" aria-label={MANAGEMENT_COPY.filterGroupLabel}>
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={filter === item.id ? "is-active" : undefined}
            aria-pressed={filter === item.id}
            onClick={() => onFilterChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {notice ? (
        <p className="walter-notice" role="status">
          {notice}
        </p>
      ) : null}
      {inquiries.length === 0 && !notice ? (
        <p className="walter-notice" role="status">
          {MANAGEMENT_COPY.emptyInbox}
        </p>
      ) : (
        <ul className="walter-inquiry-list">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id}>
              <div className="walter-inquiry-row">
                <button type="button" className="walter-inquiry-open" onClick={() => onOpen(inquiry.id)}>
                  <span className="walter-inquiry-name">
                    {inquiry.firstName} {inquiry.lastName}
                  </span>
                </button>
                <a className="walter-inquiry-meta" href={`mailto:${inquiry.email}`}>
                  {inquiry.email}
                </a>
                <a className="walter-inquiry-meta" href={telHref(inquiry.phone)}>
                  {inquiry.phone}
                </a>
                <span className="walter-inquiry-status">{statusLabel(inquiry.status)}</span>
                <span className="walter-inquiry-meta">
                  {inquiry.hasAttachment ? MANAGEMENT_COPY.hasAttachment : MANAGEMENT_COPY.noAttachmentShort}
                </span>
                <time dateTime={inquiry.createdAt}>{formatManagementDateTime(inquiry.createdAt)}</time>
                <time dateTime={inquiry.updatedAt}>{formatManagementDateTime(inquiry.updatedAt)}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
      {hasMore ? (
        <button type="button" className="walter-load-more" disabled={loadingMore} onClick={onLoadMore}>
          {loadingMore ? MANAGEMENT_COPY.loadingMore : MANAGEMENT_COPY.loadMore}
        </button>
      ) : null}
    </section>
  );
}
