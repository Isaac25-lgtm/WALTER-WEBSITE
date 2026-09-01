import { describe, expect, it } from "vitest";
import { signOutWithTimeout } from "./sign-out-with-timeout";

describe("signOutWithTimeout", () => {
  it("returns ok and clears the timer when the provider resolves", async () => {
    await expect(signOutWithTimeout(async () => undefined, 50)).resolves.toBe("ok");
  });

  it("returns provider_error when the provider rejects, without an unhandled rejection", async () => {
    await expect(
      signOutWithTimeout(async () => {
        throw new Error("provider failed");
      }, 50),
    ).resolves.toBe("provider_error");
  });

  it("returns timeout separately and still swallows a late provider rejection", async () => {
    let rejectLate: ((_reason: Error) => void) | undefined;
    const outcome = signOutWithTimeout(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectLate = reject;
        }),
      20,
    );
    await expect(outcome).resolves.toBe("timeout");
    rejectLate?.(new Error("late failure"));
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
});
