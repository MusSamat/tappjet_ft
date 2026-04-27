"use client";

import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils/cn";

export function RoleSwitcher() {
  const user = useAuth((s) => s.user);
  const status = useAuth((s) => s.status);
  const activeMode = useAuth((s) => s.activeMode);
  const setActiveMode = useAuth((s) => s.setActiveMode);

  if (status !== "authenticated" || !user?.roles?.includes("driver")) return null;

  return (
    <div className="flex rounded-full border border-gray-200 bg-gray-100 p-0.5 text-[12px] font-bold">
      <button
        type="button"
        onClick={() => setActiveMode("passenger")}
        className={cn(
          "rounded-full px-3.5 py-1 transition-all",
          activeMode === "passenger"
            ? "bg-teal-600 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700",
        )}
      >
        Пассажир
      </button>
      <button
        type="button"
        onClick={() => setActiveMode("driver")}
        className={cn(
          "rounded-full px-3.5 py-1 transition-all",
          activeMode === "driver"
            ? "bg-sky-500 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700",
        )}
      >
        Водитель
      </button>
    </div>
  );
}
