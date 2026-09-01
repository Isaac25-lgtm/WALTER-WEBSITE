import { describe, expect, it } from "vitest";
import { isJsonMediaType } from "../src/lib/json-content-type.js";

describe("isJsonMediaType", () => {
  it("accepts application/json with optional parameters, case-insensitively", () => {
    expect(isJsonMediaType("application/json")).toBe(true);
    expect(isJsonMediaType("application/json; charset=utf-8")).toBe(true);
    expect(isJsonMediaType("Application/JSON")).toBe(true);
    expect(isJsonMediaType("APPLICATION/JSON;charset=UTF-8")).toBe(true);
    expect(isJsonMediaType(" application/json ")).toBe(true);
  });

  it("rejects missing, empty, and non-JSON media types", () => {
    expect(isJsonMediaType(undefined)).toBe(false);
    expect(isJsonMediaType(null)).toBe(false);
    expect(isJsonMediaType("")).toBe(false);
    expect(isJsonMediaType("text/plain")).toBe(false);
    expect(isJsonMediaType("application/xml")).toBe(false);
    expect(isJsonMediaType("text/application/json")).toBe(false);
    expect(isJsonMediaType("application/json-malformed")).toBe(false);
    expect(isJsonMediaType("notapplication/json")).toBe(false);
    expect(isJsonMediaType("application/jsonp")).toBe(false);
    expect(isJsonMediaType("multipart/form-data")).toBe(false);
  });
});
