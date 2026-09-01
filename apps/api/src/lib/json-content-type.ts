/**
 * Exact JSON media-type check. Parameters such as charset are allowed;
 * substring matches such as text/application/json are not.
 */
export function isJsonMediaType(value: unknown): boolean {
  const header = Array.isArray(value) ? value[0] : value;
  if (typeof header !== "string") return false;
  const mediaType = header.split(";", 1)[0]?.trim().toLowerCase();
  return mediaType === "application/json";
}
