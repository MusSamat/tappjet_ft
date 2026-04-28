"use client";

import { cn } from "@/lib/utils/cn";

export function ToggleCard({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border-[1.5px] p-3 text-left transition-colors",
        on ? "border-teal-200 bg-teal-50" : "border-gray-200 bg-white hover:border-gray-300",
      )}
    >
      <div>
        <div className="text-[13px] font-bold text-gray-900">{label}</div>
        {hint && <div className="text-[11px] text-gray-500">{hint}</div>}
      </div>
      <div
        className={cn(
          "relative h-6 w-10 flex-shrink-0 rounded-full transition-colors",
          on ? "bg-teal-600" : "bg-gray-200",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            on ? "left-0.5 translate-x-4" : "left-0.5",
          )}
        />
      </div>
    </button>
  );
}
