import type { ContentDraftKey } from "@ats/contracts";
import { CONTENT_DRAFT_FIELDS } from "../generated/content-draft-fields.js";

export type ContentDraftDefinition = (typeof CONTENT_DRAFT_FIELDS)[number];

export const CONTENT_DRAFT_REGISTRY = Object.fromEntries(
  CONTENT_DRAFT_FIELDS.map((field) => [field.key, field]),
) as Record<ContentDraftKey, ContentDraftDefinition>;

export const CONTENT_DRAFT_DEFINITIONS = CONTENT_DRAFT_FIELDS;
