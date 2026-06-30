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
        "rounded-full border-2 px-3.5 py-1.5 text-[12px] font-bold transition-colors",
        active
          ? "border-brand-600 bg-brand-50 text-brand-700"
          : "border-ink-200 text-ink-700 hover:border-brand-400",
      )}
    >
      {children}
    </button>
  );
}
