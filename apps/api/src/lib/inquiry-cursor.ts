import { MANAGEMENT_INQUIRY_CURSOR_MAX_LENGTH } from "@ats/config";

export type InquiryCursor = {
  createdAt: Date;
  id: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function encodeInquiryCursor(createdAt: Date, id: string): string {
  const payload = JSON.stringify({
    v: 1,
    createdAt: createdAt.toISOString(),
    id,
  });
  return `v1.${Buffer.from(payload, "utf8").toString("base64url")}`;
}

export function decodeInquiryCursor(raw: string): InquiryCursor | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MANAGEMENT_INQUIRY_CURSOR_MAX_LENGTH) {
    return null;
  }
  const prefix = "v1.";
  if (!raw.startsWith(prefix)) return null;
  const encoded = raw.slice(prefix.length);
  if (!/^[A-Za-z0-9_-]+$/.test(encoded)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;
  if (Object.keys(record).sort().join(",") !== "createdAt,id,v") return null;
  if (record.v !== 1) return null;
  if (typeof record.createdAt !== "string" || typeof record.id !== "string") return null;
  if (!UUID_PATTERN.test(record.id)) return null;
  const createdAt = new Date(record.createdAt);
  if (Number.isNaN(createdAt.getTime()) || createdAt.toISOString() !== record.createdAt) return null;
  return { createdAt, id: record.id };
}

export function compareInquiryDesc(
  left: { createdAt: Date; id: string },
  right: { createdAt: Date; id: string },
): number {
  const time = right.createdAt.getTime() - left.createdAt.getTime();
  if (time !== 0) return time;
  if (right.id > left.id) return 1;
  if (right.id < left.id) return -1;
  return 0;
}

export function isBeforeCursor(
  row: { createdAt: Date; id: string },
  cursor: InquiryCursor,
): boolean {
  if (row.createdAt.getTime() < cursor.createdAt.getTime()) return true;
  if (row.createdAt.getTime() > cursor.createdAt.getTime()) return false;
  return row.id < cursor.id;
}
