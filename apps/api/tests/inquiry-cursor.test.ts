import { describe, expect, it } from "vitest";
import { encodeInquiryCursor, decodeInquiryCursor, isBeforeCursor, compareInquiryDesc } from "../src/lib/inquiry-cursor.js";

const createdAt = new Date("2026-09-01T12:00:00.000Z");
const id = "00000000-0000-4000-8000-000000000001";

describe("inquiry cursor", () => {
  it("round-trips a versioned URL-safe cursor without inquiry content", () => {
    const encoded = encodeInquiryCursor(createdAt, id);
    expect(encoded.startsWith("v1.")).toBe(true);
    expect(encoded).toMatch(/^v1\.[A-Za-z0-9_-]+$/);
    expect(encoded).not.toContain("Please quote");
    expect(decodeInquiryCursor(encoded)).toEqual({ createdAt, id });
  });

  it("rejects malformed, overlong, and tampered cursors", () => {
    expect(decodeInquiryCursor("")).toBeNull();
    expect(decodeInquiryCursor("v2.abc")).toBeNull();
    expect(decodeInquiryCursor("v1.%%%")).toBeNull();
    expect(decodeInquiryCursor("v1." + "A".repeat(300))).toBeNull();
    expect(decodeInquiryCursor(encodeInquiryCursor(createdAt, "not-a-uuid"))).toBeNull();
  });

  it("orders identical timestamps by id descending and pages after the cursor", () => {
    const a = { createdAt, id: "00000000-0000-4000-8000-00000000000a" };
    const b = { createdAt, id: "00000000-0000-4000-8000-00000000000b" };
    expect(compareInquiryDesc(b, a)).toBeLessThan(0);
    expect(isBeforeCursor(a, { createdAt, id: b.id })).toBe(true);
    expect(isBeforeCursor(b, { createdAt, id: b.id })).toBe(false);
  });
});
