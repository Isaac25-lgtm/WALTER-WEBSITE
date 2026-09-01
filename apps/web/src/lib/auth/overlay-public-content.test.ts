import { describe, expect, it } from "vitest";
import { publicContent } from "../../generated/public-content";
import { overlayPublicContent } from "./overlay-public-content";

describe("local public-content overlay", () => {
  it("overlays draft values in memory without changing generated public content", () => {
    const before = publicContent.homepage.heroHeading;
    const preview = overlayPublicContent({ "homepage.heroHeading": "Local draft heading" });
    expect(preview.homepage.heroHeading).toBe("Local draft heading");
    expect(publicContent.homepage.heroHeading).toBe(before);
    expect(overlayPublicContent({}).homepage.heroHeading).toBe(before);
  });
});
