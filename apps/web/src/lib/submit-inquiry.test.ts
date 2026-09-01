import { afterEach, describe, expect, it, vi } from "vitest";
import { submitInquiry } from "./submit-inquiry";

const payload = {
  firstName: "Ada",
  lastName: "Okello",
  email: "ada@example.com",
  phone: "+256 700 000 000",
  message: "Please quote a warehouse frame in Jinja.",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("submitInquiry", () => {
  it("does not fetch when the public API origin is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    const fetchImpl = vi.fn();
    await expect(submitInquiry(payload, fetchImpl)).resolves.toEqual({ ok: false, code: "not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts JSON only and returns a 201 acknowledgement", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");
    const fetchImpl = vi.fn().mockResolvedValue({
      status: 201,
      json: async () => ({
        id: "11111111-1111-4111-8111-111111111111",
        createdAt: "2026-08-31T16:00:00.000Z",
        acknowledgement: "accepted",
      }),
    });
    const result = await submitInquiry(payload, fetchImpl);
    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, { method?: string; headers?: Record<string, string>; body?: string; credentials?: string; signal?: AbortSignal }];
    expect(url).toBe("http://127.0.0.1:3001/inquiries");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("omit");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(String(init.body))).toEqual(payload);
    expect(String(init.body)).not.toMatch(/data:|base64|Uint8Array/);
  });

  it("maps 503, 429, 422, and 415 envelopes and distinguishes network failure from timeout", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");

    const unavailable = vi.fn().mockResolvedValue({
      status: 503,
      json: async () => ({ error: { code: "service_unavailable", message: "Inquiry storage is unavailable" } }),
    });
    await expect(submitInquiry(payload, unavailable)).resolves.toEqual({ ok: false, code: "service_unavailable" });

    const limited = vi.fn().mockResolvedValue({
      status: 429,
      json: async () => ({ error: { code: "rate_limited", message: "Too many inquiry attempts. Try again later." } }),
    });
    await expect(submitInquiry(payload, limited)).resolves.toEqual({ ok: false, code: "rate_limited" });

    const attachment = vi.fn().mockResolvedValue({
      status: 422,
      json: async () => ({ error: { code: "attachment_not_available", message: "Attachments are not available yet" } }),
    });
    await expect(
      submitInquiry({ ...payload, attachment: { originalName: "drawing.pdf", mimeType: "application/pdf", byteSize: 12 } }, attachment),
    ).resolves.toEqual({ ok: false, code: "attachment_not_available" });

    const network = vi.fn().mockRejectedValue(new Error("fetch failed"));
    await expect(submitInquiry(payload, network)).resolves.toEqual({ ok: false, code: "network_error" });

    const unsupported = vi.fn().mockResolvedValue({
      status: 415,
      json: async () => ({ error: { code: "unsupported_media_type", message: "Unsupported media type" } }),
    });
    await expect(submitInquiry(payload, unsupported)).resolves.toEqual({
      ok: false,
      code: "unsupported_media_type",
    });
  });

  it("treats AbortError from the request timeout as a timeout", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");
    const fetchImpl = vi.fn((_url: string, init?: { signal?: AbortSignal }) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("Aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    });
    await expect(submitInquiry(payload, fetchImpl as typeof fetch, { timeoutMs: 5 })).resolves.toEqual({
      ok: false,
      code: "timeout",
    });
  });
});
