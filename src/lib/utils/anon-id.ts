import { uuid } from "./uuid";

const KEY = "tappjet_anon_id";

/**
 * Stable per-browser id used to dedup anonymous views (lists/details are public,
 * so anonymous visitors are counted too — once each). Client-only.
 */
export function getAnonId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}
