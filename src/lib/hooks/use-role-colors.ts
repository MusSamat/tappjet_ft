import { useAuth } from "@/store/auth";
import {
  ROLE_COLORS,
  ROLE_THEME,
  type RoleColors,
  type RoleTheme,
  type UiRole,
} from "@/lib/role-colors";

/**
 * Active UI role for theming: guest until authenticated, then the
 * user-selected mode (passenger | driver).
 */
export function useUiRole(): UiRole {
  const status = useAuth((s) => s.status);
  const activeMode = useAuth((s) => s.activeMode);
  if (status !== "authenticated") return "guest";
  return activeMode ?? "passenger";
}

export function useRoleTheme(): { role: UiRole; theme: RoleTheme } {
  const role = useUiRole();
  return { role, theme: ROLE_THEME[role] };
}

/** @deprecated pre-redesign API — use useRoleTheme(). Removed after Phase C. */
export function useRoleColors(): RoleColors {
  const activeMode = useAuth((s) => s.activeMode);
  return ROLE_COLORS[activeMode ?? "passenger"];
}
