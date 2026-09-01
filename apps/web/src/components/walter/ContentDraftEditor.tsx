"use client";

import type { ContentDraftItem, ContentDraftKey } from "@ats/contracts";
import { formatManagementDateTime } from "../../lib/auth/format-datetime";
import { overlayPublicContent } from "../../lib/auth/overlay-public-content";
import { MANAGEMENT_COPY } from "./management-copy";

function validationMessage(draft: ContentDraftItem, value: string): string | null {
  if (value.includes("<") || value.includes(">")) return MANAGEMENT_COPY.htmlNotAllowed;
  if (value.trim().length < draft.minLength) return MANAGEMENT_COPY.tooShort;
  if (value.length > draft.maxLength) return MANAGEMENT_COPY.tooLong;
  return null;
}

export function ContentDraftEditor({
  drafts,
  edits,
  savingKey,
  notice,
  conflictKeys,
  onEdit,
  onSave,
  onReset,
  onReload,
}: {
  drafts: ContentDraftItem[];
  edits: Partial<Record<ContentDraftKey, string>>;
  savingKey: ContentDraftKey | null;
  notice: string | null;
  conflictKeys: ContentDraftKey[];
  onEdit: (_key: ContentDraftKey, _value: string) => void;
  onSave: (_key: ContentDraftKey) => void;
  onReset: (_key: ContentDraftKey) => void;
  onReload: (_key: ContentDraftKey) => void;
}) {
  const previewValues: Partial<Record<ContentDraftKey, string>> = {};
  for (const draft of drafts) {
    previewValues[draft.key] = edits[draft.key] ?? draft.value;
  }
  const preview = overlayPublicContent(previewValues);
  const groups: Array<{ page: string; section: string; drafts: ContentDraftItem[] }> = [];
  for (const draft of drafts) {
    const last = groups[groups.length - 1];
    if (last && last.page === draft.page && last.section === draft.section) {
      last.drafts.push(draft);
    } else {
      groups.push({ page: draft.page, section: draft.section, drafts: [draft] });
    }
  }

  return (
    <section className="walter-content" aria-labelledby="walter-content-heading">
      <h2 id="walter-content-heading">{MANAGEMENT_COPY.contentHeading}</h2>
      <p>{MANAGEMENT_COPY.contentSupporting}</p>
      {notice ? (
        <p className="walter-notice" role="status">
          {notice}
        </p>
      ) : null}
      <div className="walter-content-layout">
        <div className="walter-draft-list">
          {groups.map((group) => (
            <section key={`${group.page}-${group.section}`} className="walter-draft-group">
              <h3>
                {group.page} / {group.section}
              </h3>
              <ul>
                {group.drafts.map((draft) => {
                  const value = edits[draft.key] ?? draft.value;
                  const saving = savingKey === draft.key;
                  const unsaved = value !== draft.value;
                  const validation = validationMessage(draft, value);
                  const conflict = conflictKeys.includes(draft.key);
                  return (
                    <li key={draft.key} className="walter-draft-item">
                      <label htmlFor={`walter-draft-${draft.key}`}>
                        {draft.label}
                        {draft.multiline ? (
                          <textarea
                            id={`walter-draft-${draft.key}`}
                            value={value}
                            maxLength={draft.maxLength}
                            disabled={saving}
                            onChange={(event) => onEdit(draft.key, event.target.value)}
                          />
                        ) : (
                          <input
                            id={`walter-draft-${draft.key}`}
                            value={value}
                            maxLength={draft.maxLength}
                            disabled={saving}
                            onChange={(event) => onEdit(draft.key, event.target.value)}
                          />
                        )}
                      </label>
                      <p className="walter-draft-description">{draft.description}</p>
                      <p className="walter-draft-canonical">
                        <strong>{MANAGEMENT_COPY.canonicalValueLabel}:</strong> {draft.canonicalValue}
                      </p>
                      <p className="walter-draft-canonical">
                        <strong>{MANAGEMENT_COPY.draftValueLabel}:</strong> {draft.value}
                      </p>
                      <p className="walter-draft-meta">
                        {draft.isDraft ? MANAGEMENT_COPY.draftSaved : MANAGEMENT_COPY.draftCanonical} · version{" "}
                        {draft.version} · {value.length}/{draft.maxLength}
                        {unsaved ? ` · ${MANAGEMENT_COPY.unsaved}` : ""}
                        {draft.createdAt ? (
                          <>
                            {" · created "}
                            <time dateTime={draft.createdAt}>{formatManagementDateTime(draft.createdAt)}</time>
                          </>
                        ) : null}
                        {draft.updatedAt ? (
                          <>
                            {" · updated "}
                            <time dateTime={draft.updatedAt}>{formatManagementDateTime(draft.updatedAt)}</time>
                          </>
                        ) : null}
                      </p>
                      {validation ? (
                        <p className="walter-notice" role="status">
                          {validation}
                        </p>
                      ) : null}
                      {conflict ? (
                        <p className="walter-notice" role="status">
                          {MANAGEMENT_COPY.contentConflict}
                        </p>
                      ) : null}
                      <div className="walter-draft-actions">
                        <button
                          type="button"
                          disabled={saving || !unsaved || Boolean(validation)}
                          onClick={() => onSave(draft.key)}
                        >
                          {saving ? MANAGEMENT_COPY.savingDraft : MANAGEMENT_COPY.saveDraft}
                        </button>
                        <button type="button" className="walter-text-button" disabled={saving} onClick={() => onReset(draft.key)}>
                          {MANAGEMENT_COPY.resetDraft}
                        </button>
                        {conflict ? (
                          <button type="button" className="walter-text-button" disabled={saving} onClick={() => onReload(draft.key)}>
                            {MANAGEMENT_COPY.reloadServerDraft}
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <aside className="walter-preview" aria-labelledby="walter-preview-heading">
          <h3 id="walter-preview-heading">{MANAGEMENT_COPY.previewHeading}</h3>
          <p className="walter-preview-notice">{MANAGEMENT_COPY.previewNotice}</p>
          <p className="walter-preview-kicker">{preview.homepage.aboutEyebrow}</p>
          <p className="walter-preview-title">{preview.homepage.heroHeading}</p>
          <p>{preview.homepage.heroSupporting}</p>
          <p className="walter-preview-title">{preview.homepage.servicesHeading}</p>
          <p>{preview.homepage.servicesIntroduction}</p>
          <p className="walter-preview-title">{preview.homepage.aboutHeading}</p>
          <p>{preview.homepage.aboutParagraphs[0]}</p>
          <p>{preview.homepage.aboutParagraphs[1]}</p>
          <p className="walter-preview-title">{preview.homepage.closingCtaHeading}</p>
          <p>{preview.homepage.closingCtaSupporting}</p>
          <p className="walter-preview-title">{preview.contact.heading}</p>
          <p>{preview.contact.introduction}</p>
          <p className="walter-preview-title">{preview.thankYou.heading}</p>
          <p>{preview.thankYou.supporting}</p>
        </aside>
      </div>
    </section>
  );
}
