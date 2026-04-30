const apiOrigin = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_API_URL ?? "").origin; }
  catch { return ""; }
})();

/**
 * Replaces the server-side origin in media URLs with the client-configured API origin.
 * Fixes cases where the backend returns http://localhost:3000/avatars/... but the
 * browser is accessing the app via a tunnel or different host.
 */
export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!apiOrigin || !url.startsWith("http")) return url;
  try {
    const u = new URL(url);
    if (u.origin === apiOrigin) return url;
    return apiOrigin + u.pathname + u.search + u.hash;
  } catch {
    return url;
  }
}
