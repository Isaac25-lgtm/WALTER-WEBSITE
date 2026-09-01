import { describe, expect, it } from "vitest";
import { mergeVaryHeader } from "../src/lib/merge-vary.js";

describe("mergeVaryHeader", () => {
  it("preserves Origin, adds Authorization case-insensitively, and skips duplicates", () => {
    expect(mergeVaryHeader("Origin", "Authorization")).toBe("Origin, Authorization");
    expect(mergeVaryHeader("origin, Accept", "Authorization")).toBe("origin, Accept, Authorization");
    expect(mergeVaryHeader("Authorization, Origin", "authorization")).toBe("Authorization, Origin");
    expect(mergeVaryHeader(["Origin", "Authorization"], "Authorization")).toBe("Origin, Authorization");
  });
});
