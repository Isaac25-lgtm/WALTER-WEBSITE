import { describe, expect, it } from "vitest";
import type { StoredInquiry } from "../src/repositories/inquiry-repository.js";
import { MemoryInquiryRepository } from "../src/repositories/memory-inquiry-repository.js";

const stamp = new Date("2026-09-01T12:00:00.000Z");

function row(id: string, overrides: Partial<StoredInquiry> = {}): StoredInquiry {
  return {
    id,
    status: "new",
    createdAt: stamp,
    updatedAt: stamp,
    firstName: "Ada",
    lastName: "Okello",
    email: "ada@example.com",
    phone: "+256 700 000 000",
    message: "Please quote a warehouse frame in Jinja.",
    attachmentOriginalName: null,
    attachmentMimeType: null,
    attachmentByteSize: null,
    ...overrides,
  };
}

describe("memory inquiry pagination", () => {
  it("pages identical timestamps by id descending without duplicates or omissions", async () => {
    const repository = new MemoryInquiryRepository();
    repository.seed(row("00000000-0000-4000-8000-000000000001"));
    repository.seed(row("00000000-0000-4000-8000-000000000002"));
    repository.seed(row("00000000-0000-4000-8000-000000000003"));

    const first = await repository.listInquiries({ limit: 2 });
    expect(first.inquiries.map((item) => item.id)).toEqual([
      "00000000-0000-4000-8000-000000000003",
      "00000000-0000-4000-8000-000000000002",
    ]);
    expect(first.inquiries.every((item) => !("message" in item))).toBe(true);
    expect(first.nextCursor).toEqual(expect.any(String));

    const second = await repository.listInquiries({
      limit: 2,
      cursor: {
        createdAt: stamp,
        id: "00000000-0000-4000-8000-000000000002",
      },
    });
    expect(second.inquiries.map((item) => item.id)).toEqual(["00000000-0000-4000-8000-000000000001"]);
    expect(second.nextCursor).toBeNull();
  });

  it("applies status filtering inside the query and returns a null cursor for empty pages", async () => {
    const repository = new MemoryInquiryRepository();
    repository.seed(row("00000000-0000-4000-8000-000000000001", { status: "closed" }));
    const page = await repository.listInquiries({ status: "new", limit: 20 });
    expect(page.inquiries).toEqual([]);
    expect(page.nextCursor).toBeNull();
  });
});
