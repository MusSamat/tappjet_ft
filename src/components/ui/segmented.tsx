"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** active pill colour */
  tone?: "brand" | "grape";
  className?: string;
}

/** Segmented control (e.g. Поездки/Заявки, Пассажир/Водитель). Active = filled pill. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  tone = "brand",
  className,
}: SegmentedProps<T>) {
  const activeCls =
    tone === "grape" ? "bg-grape-500 text-white" : "bg-brand-600 text-white";
  return (
    <div className={cn("flex gap-1 rounded-2xl bg-ink-100 p-1", className)} role="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-extrabold transition-colors",
              active ? activeCls : "text-ink-500 hover:text-ink-700",
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
