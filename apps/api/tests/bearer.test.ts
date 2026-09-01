import "./setup-env.js";
import { describe, expect, it } from "vitest";
import { MAX_BEARER_TOKEN_LENGTH, readBearerToken } from "../src/auth/bearer.js";

describe("readBearerToken", () => {
  it("accepts exactly one Bearer token and rejects ambiguous or unsafe values", () => {
    expect(readBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(readBearerToken(undefined)).toBeNull();
    expect(readBearerToken("")).toBeNull();
    expect(readBearerToken("Bearer ")).toBeNull();
    expect(readBearerToken("bearer abc.def.ghi")).toBeNull();
    expect(readBearerToken("Basic abc")).toBeNull();
    expect(readBearerToken("Bearer abc def")).toBeNull();
    expect(readBearerToken("Bearer abc,def")).toBeNull();
    expect(readBearerToken(["Bearer one", "Bearer two"])).toBeNull();
    expect(readBearerToken(`Bearer ${"a".repeat(MAX_BEARER_TOKEN_LENGTH + 1)}`)).toBeNull();
    expect(readBearerToken("Bearer abc\u0001def")).toBeNull();
  });
});
