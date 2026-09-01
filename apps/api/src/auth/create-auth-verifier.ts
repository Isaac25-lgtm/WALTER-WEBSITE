import type { ApiConfig } from "../config/env.js";
import { createJoseAuthVerifier } from "./jose-auth-verifier.js";
import type { AuthVerifier } from "./types.js";
import { unavailableAuthVerifier } from "./unavailable-auth-verifier.js";

export type { AuthVerifier } from "./types.js";

export function createAuthVerifier(config: ApiConfig): AuthVerifier {
  if (!config.managementAuthEnabled) {
    return unavailableAuthVerifier;
  }
  return createJoseAuthVerifier(config);
}
