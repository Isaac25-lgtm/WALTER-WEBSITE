import { DEFAULT_MANAGEMENT_FETCH_TIMEOUT_MS } from "@ats/config";

export type SignOutOutcome = "ok" | "timeout" | "provider_error";

export async function signOutWithTimeout(
  signOut: () => Promise<void>,
  timeoutMs: number = DEFAULT_MANAGEMENT_FETCH_TIMEOUT_MS,
): Promise<SignOutOutcome> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const pending = Promise.resolve()
    .then(() => signOut())
    .then(
      () => "ok" as const,
      () => "provider_error" as const,
    );
  const timeout = new Promise<SignOutOutcome>((resolve) => {
    timer = setTimeout(() => resolve("timeout"), timeoutMs);
  });
  try {
    return await Promise.race([pending, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
    void pending;
  }
}
