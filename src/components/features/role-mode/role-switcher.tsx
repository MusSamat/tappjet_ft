"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/store/auth";
import { switchRoleAndReload } from "@/lib/auth/switch-role";
import { cn } from "@/lib/utils/cn";

export function RoleSwitcher() {
  const t = useTranslations("roles");
  const user = useAuth((s) => s.user);
  const status = useAuth((s) => s.status);
  const activeMode = useAuth((s) => s.activeMode);

  if (status !== "authenticated" || !user?.roles?.includes("driver")) return null;

  return (
    <div className="flex rounded-full border border-ink-200 bg-ink-100 p-0.5 text-[12px] font-bold dark:border-ink-700 dark:bg-ink-800">
      <button
        type="button"
        onClick={() => switchRoleAndReload("passenger")}
        className={cn(
          "rounded-full px-3.5 py-1 transition-all",
          activeMode === "passenger"
            ? "bg-brand-600 text-white shadow-sm"
            : "text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200",
        )}
      >
        {t("passenger")}
      </button>
      <button
        type="button"
        onClick={() => switchRoleAndReload("driver")}
        className={cn(
          "rounded-full px-3.5 py-1 transition-all",
          activeMode === "driver"
            ? "bg-grape-500 text-white shadow-sm"
            : "text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200",
        )}
      >
        {t("driver")}
      </button>
    </div>
  );
}
