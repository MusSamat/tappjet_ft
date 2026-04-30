const apiOrigin = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_API_URL ?? "").origin; }
  catch { return ""; }
})();

function isLocalhost(origin: string): boolean {
  try {
    const h = new URL(origin).hostname;
    return h === "localhost" || h === "127.0.0.1";
  } catch { return false; }
}

/**
 * Only remaps a media URL when the backend returned a localhost origin but the
 * frontend is configured with a real (tunnel/production) API origin.
 * If the backend already returns a real URL, it passes through unchanged — so
 * setting BASE_URL on the backend is sufficient and the frontend won't break it.
 */
export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!apiOrigin || !url.startsWith("http")) return url;
  try {
    const u = new URL(url);
    if (u.origin === apiOrigin) return url;
    // Only remap localhost → real origin. Trust any non-localhost URL as-is.
    if (isLocalhost(u.origin) && !isLocalhost(apiOrigin)) {
      return apiOrigin + u.pathname + u.search + u.hash;
    }
    return url;
  } catch {
    return url;
  }
}
