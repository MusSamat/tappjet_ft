"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

type SubTab = "active" | "history";

export function SubTabBar({ value, onChange, activeCount, historyCount }: {
  value: SubTab;
  onChange: (v: SubTab) => void;
  activeCount: number;
  historyCount: number;
}) {
  const t = useTranslations("bookings");
  return (
    <div className="mb-4 flex gap-2">
      {(["active", "history"] as SubTab[]).map((st) => {
        const label = st === "active" ? t("sub_active") : t("sub_history");
        const count = st === "active" ? activeCount : historyCount;
        return (
          <button
            key={st}
            type="button"
            onClick={() => onChange(st)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors",
              value === st
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {label}
            {count > 0 && (
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold",
                value === st ? "bg-teal-700 text-white" : "bg-gray-200 text-gray-600",
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
