"use client";

import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

// The one «проверенный водитель» mark — same icon, colour and tooltip
// everywhere (cards, detail, offers, profile). Filled BadgeCheck reads as
// "platform-issued" better than an outline shield.

interface Props {
  size?: "sm" | "md";
  className?: string;
  /** Show the label text next to the icon (detail / profile contexts). */
  withLabel?: boolean;
}

export function VerifiedBadge({ size = "sm", className, withLabel = false }: Props) {
  const t = useTranslations("common");
  const icon = (
    <BadgeCheck
      className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5", "shrink-0 fill-brand-600 text-white dark:fill-brand-500")}
      aria-hidden="true"
    />
  );
  if (!withLabel) {
    return (
      <span title={t("verified_driver")} aria-label={t("verified_driver")} className={cn("inline-flex", className)}>
        {icon}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[12px] font-800 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
        className,
      )}
    >
      {icon}
      {t("verified_driver")}
    </span>
  );
}
