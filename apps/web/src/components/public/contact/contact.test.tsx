/** @vitest-environment jsdom */

import { render, screen, cleanup, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactPage } from "./ContactPage";
import { publicContent } from "../../../generated/public-content";
import { INQUIRY_FIELD_ERRORS } from "./inquiry-messages";
import { validateInquiryAttachment, validateInquiryForm } from "./validate-inquiry";

const pushThankYou = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushThankYou }),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  pushThankYou.mockReset();
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
});

const LABELS = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Mobile Number",
  message: "Message",
} as const;

function validValues() {
  return {
    firstName: "Ada",
    lastName: "Okello",
    email: "ada@example.com",
    phone: "+256 700 000 000",
    message: "Please quote a warehouse frame in Jinja.",
  };
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>, skip?: keyof typeof LABELS) {
  const values = validValues();
  for (const [key, label] of Object.entries(LABELS) as [keyof typeof LABELS, string][]) {
    if (key === skip) continue;
    await user.type(screen.getByLabelText(label), values[key]);
  }
}

describe("contact page", { timeout: 15_000 }, () => {
  it("renders one H1 and generated contact copy with mailto and tel links", () => {
    render(<ContactPage />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(publicContent.contact.heading);
    expect(screen.getByText(publicContent.contact.introduction)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: publicContent.contact.emailAlternativeText })).toHaveAttribute(
      "href",
      `mailto:${publicContent.contacts.email}`,
    );
    expect(screen.getByRole("link", { name: publicContent.contact.telephoneAlternativeText })).toHaveAttribute(
      "href",
      publicContent.contacts.primaryPhoneHref,
    );
    expect(screen.queryByText(publicContent.contact.tanzaniaBranchLabel)).not.toBeInTheDocument();
    expect(publicContent.contact.jinjaLocationLabel).toBe("Jinja, Uganda");
    expect(publicContent.contact.tanzaniaBranchLabel).toContain("Dodoma");
    expect(document.querySelector(".approved-map")).toBeNull();
    expect(document.querySelector("iframe")).toBeNull();
    expect(document.body.textContent).not.toMatch(/WhatsApp|whatsapp|\/walter|Metalworks|thank you for your inquiry/i);
  });

  it("associates required labels with controls", () => {
    render(<ContactPage />);
    for (const label of [...Object.values(LABELS), "Upload File Here"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByLabelText("First Name")).toHaveAttribute("autocomplete", "given-name");
    expect(screen.getByLabelText("Last Name")).toHaveAttribute("autocomplete", "family-name");
    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Mobile Number")).toHaveAttribute("autocomplete", "tel");
  });

  it("shows an error summary and aria-invalid after an empty submission", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    const summary = screen.getByRole("alert");
    expect(summary).toHaveTextContent("Please correct the following");
    expect(within(summary).getByText(INQUIRY_FIELD_ERRORS.firstName)).toBeInTheDocument();
    expect(within(summary).getByText(INQUIRY_FIELD_ERRORS.lastName)).toBeInTheDocument();
    expect(within(summary).getByText(INQUIRY_FIELD_ERRORS.email)).toBeInTheDocument();
    expect(within(summary).getByText(INQUIRY_FIELD_ERRORS.phone)).toBeInTheDocument();
    expect(within(summary).getByText(INQUIRY_FIELD_ERRORS.message)).toBeInTheDocument();
    const firstName = screen.getByLabelText("First Name");
    expect(firstName).toHaveAttribute("aria-invalid", "true");
    expect(firstName).toHaveAttribute("aria-describedby");
    expect(document.getElementById(firstName.getAttribute("aria-describedby") ?? "")).toHaveTextContent(
      INQUIRY_FIELD_ERRORS.firstName,
    );
    expect(screen.queryByText(publicContent.contact.formUnavailableMessage)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\bsent\b|\bsubmitted\b|\bsaved\b|\breceived\b|\bsuccessful\b/i);
  });

  it.each([
    ["firstName", INQUIRY_FIELD_ERRORS.firstName],
    ["lastName", INQUIRY_FIELD_ERRORS.lastName],
    ["phone", INQUIRY_FIELD_ERRORS.phone],
    ["message", INQUIRY_FIELD_ERRORS.message],
  ] as const)("requires %s", async (field, message) => {
    const user = userEvent.setup();
    render(<ContactPage />);
    await fillRequired(user, field);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByRole("alert")).toHaveTextContent(message);
    expect(screen.getByLabelText(LABELS[field])).toHaveAttribute("aria-invalid", "true");
  });

  it("validates email format and preserves other values", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    await user.type(screen.getByLabelText("First Name"), "Ada");
    await user.type(screen.getByLabelText("Last Name"), "Okello");
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Mobile Number"), "+256 700 000 000");
    await user.type(screen.getByLabelText("Message"), "Please quote a warehouse frame.");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByRole("alert")).toHaveTextContent(INQUIRY_FIELD_ERRORS.email);
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("First Name")).toHaveValue("Ada");
    expect(screen.getByLabelText("Last Name")).toHaveValue("Okello");
    expect(screen.getByLabelText("Email")).toHaveValue("not-an-email");
    expect(screen.getByLabelText("Message")).toHaveValue("Please quote a warehouse frame.");
  });

  it("rejects oversized and unsupported attachments and accepts image and PDF metadata", () => {
    const oversized = new File([new Uint8Array(1_000_001)], "photo.jpg", { type: "image/jpeg" });
    expect(validateInquiryAttachment(oversized).error).toBe(INQUIRY_FIELD_ERRORS.attachmentSize);

    const exe = new File(["MZ"], "setup.exe", { type: "application/x-msdownload" });
    expect(validateInquiryAttachment(exe).error).toBe(INQUIRY_FIELD_ERRORS.attachmentType);

    const spoofed = new File(["nope"], "notes.jpg", { type: "application/x-msdownload" });
    expect(validateInquiryAttachment(spoofed).error).toBe(INQUIRY_FIELD_ERRORS.attachmentType);

    const jpeg = new File(["ok"], "photo.jpg", { type: "image/jpeg" });
    expect(validateInquiryAttachment(jpeg).meta).toEqual({
      originalName: "photo.jpg",
      mimeType: "image/jpeg",
      byteSize: 2,
    });

    const pdf = new File(["%PDF"], "drawing.pdf", { type: "application/pdf" });
    expect(validateInquiryAttachment(pdf).meta?.mimeType).toBe("application/pdf");
    expect(validateInquiryForm(validValues(), jpeg)).toEqual({});
    expect(validateInquiryForm(validValues(), pdf)).toEqual({});
  });

  it("rejects an oversized file selected on the form", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    await fillRequired(user);
    const oversized = new File([new Uint8Array(1_000_001)], "photo.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByLabelText("Upload File Here"), oversized);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByRole("alert")).toHaveTextContent(INQUIRY_FIELD_ERRORS.attachmentSize);
    expect(screen.getByLabelText("Upload File Here")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("First Name")).toHaveValue("Ada");
  });

  it("does not send a network request when the public API origin is missing", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(publicContent.contact.formUnavailableMessage);
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(pushThankYou).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toContain(publicContent.contacts.primaryPhone);
    expect(screen.getByRole("status").textContent).toContain(publicContent.contacts.email);
    expect(screen.getByLabelText("First Name")).toHaveValue("Ada");
    expect(screen.getByRole("status").textContent).not.toMatch(/sent|submitted|saved|received|successful/i);
  });

  it("posts JSON to the inquiry API and opens thank-you after 201", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      status: 201,
      json: async () => ({
        id: "11111111-1111-4111-8111-111111111111",
        createdAt: "2026-08-31T16:00:00.000Z",
        acknowledgement: "accepted",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(pushThankYou).toHaveBeenCalledWith("/thank-you/"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, { headers?: Record<string, string>; body?: string; credentials?: string }];
    expect(url).toBe("http://127.0.0.1:3001/inquiries");
    expect(init.credentials).toBe("omit");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(String(init.body))).toEqual(validValues());
    expect(String(init.body)).not.toMatch(/base64|Uint8Array|photo\.jpg/);
  });

  it("keeps values and shows a retryable notice for 503, 429, and 422", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 503,
        json: async () => ({ error: { code: "service_unavailable", message: "Inquiry storage is unavailable" } }),
      })
      .mockResolvedValueOnce({
        status: 429,
        json: async () => ({ error: { code: "rate_limited", message: "Too many inquiry attempts. Try again later." } }),
      })
      .mockResolvedValueOnce({
        status: 422,
        json: async () => ({ error: { code: "attachment_not_available", message: "Attachments are not available yet" } }),
      });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(publicContent.contact.formUnavailableMessage);
    });
    expect(pushThankYou).not.toHaveBeenCalled();
    expect(screen.getByLabelText("First Name")).toHaveValue("Ada");
    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(publicContent.contact.formRateLimitedMessage);
    });

    const jpeg = new File(["ok"], "photo.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByLabelText("Upload File Here"), jpeg);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(publicContent.contact.formAttachmentUnavailableMessage);
    });
    expect(JSON.parse(String((fetchMock.mock.calls[2] as [string, { body?: string }])[1].body)).attachment).toEqual({
      originalName: "photo.jpg",
      mimeType: "image/jpeg",
      byteSize: 2,
    });
    expect(String((fetchMock.mock.calls[2] as [string, { body?: string }])[1].body)).not.toContain("ok");
  });

  it("changes Submit to Submitting… and announces the in-flight state", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://127.0.0.1:3001");
    const user = userEvent.setup();
    let resolveFetch: ((_result: { status: number; json: () => Promise<unknown> }) => void) | undefined;
    const fetchMock = vi.fn(
      () =>
        new Promise<{ status: number; json: () => Promise<unknown> }>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactPage />);
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: publicContent.contact.formSubmittingMessage })).toBeDisabled();
    });
    expect(screen.getByRole("status")).toHaveTextContent(publicContent.contact.formSubmittingMessage);
    resolveFetch?.({
      status: 503,
      json: async () => ({ error: { code: "service_unavailable", message: "Inquiry storage is unavailable" } }),
    });
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(publicContent.contact.formUnavailableMessage);
    });
    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
    expect(screen.getByLabelText("First Name")).toHaveValue("Ada");
  });
});
