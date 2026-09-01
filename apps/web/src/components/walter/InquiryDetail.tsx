"use client";

import type { InquiryStatus, ManagementInquiryDetail } from "@ats/contracts";
import { formatManagementDateTime } from "../../lib/auth/format-datetime";
import { telHref } from "../../lib/tel";
import { MANAGEMENT_COPY } from "./management-copy";

const STATUSES: InquiryStatus[] = ["new", "in_progress", "closed"];

function statusLabel(status: InquiryStatus): string {
  if (status === "in_progress") return MANAGEMENT_COPY.filterInProgress;
  if (status === "closed") return MANAGEMENT_COPY.filterClosed;
  return MANAGEMENT_COPY.filterNew;
}

export function InquiryDetail({
  inquiry,
  pendingStatus,
  updating,
  notice,
  onBack,
  onStatusChange,
  onUpdateStatus,
}: {
  inquiry: ManagementInquiryDetail;
  pendingStatus: InquiryStatus;
  updating: boolean;
  notice: string | null;
  onBack: () => void;
  onStatusChange: (_status: InquiryStatus) => void;
  onUpdateStatus: () => void;
}) {
  return (
    <section className="walter-detail" aria-labelledby="walter-detail-heading">
      <button type="button" className="walter-text-button" onClick={onBack}>
        {MANAGEMENT_COPY.backToInbox}
      </button>
      <h2 id="walter-detail-heading">{MANAGEMENT_COPY.detailHeading}</h2>
      <dl className="walter-detail-list">
        <div>
          <dt>Name</dt>
          <dd>
            {inquiry.firstName} {inquiry.lastName}
          </dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            <a href={telHref(inquiry.phone)}>{inquiry.phone}</a>
          </dd>
        </div>
        <div>
          <dt>{MANAGEMENT_COPY.receivedLabel}</dt>
          <dd>
            <time dateTime={inquiry.createdAt}>{formatManagementDateTime(inquiry.createdAt)}</time>
          </dd>
        </div>
        <div>
          <dt>{MANAGEMENT_COPY.updatedLabel}</dt>
          <dd>
            <time dateTime={inquiry.updatedAt}>{formatManagementDateTime(inquiry.updatedAt)}</time>
          </dd>
        </div>
        <div>
          <dt>Message</dt>
          <dd className="walter-message">{inquiry.message}</dd>
        </div>
        <div>
          <dt>{MANAGEMENT_COPY.attachmentLabel}</dt>
          <dd>
            {inquiry.attachment
              ? `${inquiry.attachment.originalName} (${inquiry.attachment.mimeType}, ${inquiry.attachment.byteSize} bytes)`
              : MANAGEMENT_COPY.noAttachment}
          </dd>
        </div>
      </dl>
      <div className="walter-status-controls">
        <label htmlFor="walter-inquiry-status">
          {MANAGEMENT_COPY.statusLabel}
          <select
            id="walter-inquiry-status"
            value={pendingStatus}
            disabled={updating}
            onChange={(event) => onStatusChange(event.target.value as InquiryStatus)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" disabled={updating || pendingStatus === inquiry.status} onClick={onUpdateStatus}>
          {updating ? MANAGEMENT_COPY.updatingStatus : MANAGEMENT_COPY.updateStatus}
        </button>
      </div>
      {notice ? (
        <p className="walter-notice" role="status">
          {notice}
        </p>
      ) : null}
    </section>
  );
}
