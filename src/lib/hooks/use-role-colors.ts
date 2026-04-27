import { useAuth } from "@/store/auth";
import { ROLE_COLORS, type RoleColors } from "@/lib/role-colors";

export function useRoleColors(): RoleColors {
  const activeMode = useAuth((s) => s.activeMode);
  return ROLE_COLORS[activeMode ?? "passenger"];
}
