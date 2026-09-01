export function mergeVaryHeader(existing: unknown, token: string): string {
  const parts: string[] = [];
  const seen = new Set<string>();

  function add(value: string): void {
    const trimmed = value.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    parts.push(trimmed);
  }

  if (typeof existing === "string") {
    for (const part of existing.split(",")) add(part);
  } else if (Array.isArray(existing)) {
    for (const item of existing) {
      if (typeof item === "string") {
        for (const part of item.split(",")) add(part);
      }
    }
  }
  add(token);
  return parts.join(", ");
}
