const KEY = "tappjet_deferred_action";
const TTL_MS = 15 * 60 * 1000;

export type DeferredAction =
  | { action: "book_trip"; trip_id: string; seats: number; comment?: string }
  | { action: "open_chat"; booking_id: string }
  | { action: "rate_user"; trip_id: string; ratee_id: string }
  | { action: "view_contacts"; booking_id: string }
  | { action: "file_complaint"; target_user_id: string; target_trip_id?: string };

interface StoredIntent {
  saved_at: number;
  intent: DeferredAction;
}

export function saveDeferredAction(intent: DeferredAction) {
  if (typeof window === "undefined") return;
  const payload: StoredIntent = { saved_at: Date.now(), intent };
  sessionStorage.setItem(KEY, JSON.stringify(payload));
}

export function consumeDeferredAction(): DeferredAction | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  sessionStorage.removeItem(KEY);
  try {
    const parsed = JSON.parse(raw) as StoredIntent;
    if (Date.now() - parsed.saved_at > TTL_MS) return null;
    return parsed.intent;
  } catch {
    return null;
  }
}

export function routeForIntent(intent: DeferredAction): string {
  switch (intent.action) {
    case "book_trip":
      return `/trips/${intent.trip_id}/book?seats=${intent.seats}`;
    case "open_chat":
      return `/my/bookings/${intent.booking_id}/chat`;
    case "rate_user":
      return `/trips/${intent.trip_id}/rate/${intent.ratee_id}`;
    case "view_contacts":
      return `/my/bookings/${intent.booking_id}?tab=contacts`;
    case "file_complaint":
      return intent.target_trip_id
        ? `/complaint?user=${intent.target_user_id}&trip=${intent.target_trip_id}`
        : `/complaint?user=${intent.target_user_id}`;
  }
}
