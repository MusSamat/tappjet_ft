import { useAuth } from "@/store/auth";

/**
 * Switch the active role mode and hard-reload the app — same UX as the language
 * switch. A reload guarantees the whole tree re-renders under the new role:
 * the feed (trips ⇄ requests), the role theme, and any SSR/cached data all
 * reset cleanly instead of relying on every subscriber reacting to the store.
 * The mode is persisted to localStorage first, so it survives the reload.
 */
export function switchRoleAndReload(mode: "passenger" | "driver", redirectTo?: string): void {
  const { activeMode, setActiveMode } = useAuth.getState();
  if (activeMode === mode && !redirectTo) return; // no-op — don't reload on a redundant tap
  setActiveMode(mode);
  if (typeof window === "undefined") return;
  if (redirectTo) window.location.href = redirectTo;
  else window.location.reload();
}
