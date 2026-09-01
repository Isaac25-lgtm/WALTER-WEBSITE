const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

function readUrl(raw: string | undefined): URL | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (!HTTP_PROTOCOLS.has(url.protocol)) return null;
    if (url.username || url.password) return null;
    if (url.search || url.hash) return null;
    if (!url.hostname) return null;
    return url;
  } catch {
    return null;
  }
}

export function parsePublicApiOrigin(raw: string | undefined): string | null {
  const url = readUrl(raw);
  if (!url) return null;
  if (url.pathname !== "/" && url.pathname !== "") return null;
  return url.origin;
}

export function parseNeonAuthBaseUrl(raw: string | undefined): string | null {
  const url = readUrl(raw);
  if (!url) return null;
  const pathname = url.pathname.replace(/\/+$/, "");
  if (!pathname || pathname === "") return url.origin;
  return `${url.origin}${pathname}`;
}
