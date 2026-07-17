"use client";

import { useTranslations } from "next-intl";
import { CarFront, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// «Я пассажир — ищу поездку» / «Я водитель — ищу пассажиров» — the app's one
// intent switch. Two-line cards (bold identity + small action) survive long
// KG/RU phrases on narrow phones, unlike a single-line segmented control.
// Used on the home/gate search and in the create form.

export type Intent = "passenger" | "driver";

interface Props {
  value: Intent;
  onChange: (v: Intent) => void;
  className?: string;
}

export function IntentToggle({ value, onChange, className }: Props) {
  const t = useTranslations("feed");
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <button
        type="button"
        onClick={() => onChange("passenger")}
        aria-pressed={value === "passenger"}
        className={cn(
          "flex items-center gap-2.5 rounded-3xl border-[3px] px-3 py-2.5 text-left transition-colors",
          value === "passenger"
            ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-ink-800"
            : "border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            value === "passenger"
              ? "bg-brand-600 text-white"
              : "bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-300",
          )}
        >
          <User className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className={cn("block truncate text-[14px] font-900 leading-tight", value === "passenger" ? "text-brand-700 dark:text-white" : "text-ink-700 dark:text-ink-300")}>
            {t("mode_trips_title")}
          </span>
          <span className={cn("block truncate text-[13px] font-600", value === "passenger" ? "text-ink-600 dark:text-ink-300" : "text-ink-500 dark:text-ink-400")}>
            {t("mode_trips_sub")}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange("driver")}
        aria-pressed={value === "driver"}
        className={cn(
          "flex items-center gap-2.5 rounded-3xl border-[3px] px-3 py-2.5 text-left transition-colors",
          value === "driver"
            ? "border-grape-500 bg-grape-50 dark:border-grape-400 dark:bg-ink-800"
            : "border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            value === "driver"
              ? "bg-grape-500 text-white"
              : "bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-300",
          )}
        >
          <CarFront className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className={cn("block truncate text-[14px] font-900 leading-tight", value === "driver" ? "text-grape-600 dark:text-white" : "text-ink-700 dark:text-ink-300")}>
            {t("mode_requests_title")}
          </span>
          <span className={cn("block truncate text-[13px] font-600", value === "driver" ? "text-ink-600 dark:text-ink-300" : "text-ink-500 dark:text-ink-400")}>
            {t("mode_requests_sub")}
          </span>
        </span>
      </button>
    </div>
  );
}
