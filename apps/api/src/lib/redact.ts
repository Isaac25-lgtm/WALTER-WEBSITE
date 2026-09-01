/** Keep secrets out of logs. */
export function redactSecret(value: string | undefined): string {
  if (!value) return "(unset)";
  return "(set)";
}
