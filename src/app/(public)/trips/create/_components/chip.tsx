"use client";

import { cn } from "@/lib/utils/cn";

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-bold transition-colors",
        active
          ? "border-teal-600 bg-teal-50 text-teal-700"
          : "border-gray-200 text-gray-700 hover:border-teal-400",
      )}
    >
      {children}
    </button>
  );
}
