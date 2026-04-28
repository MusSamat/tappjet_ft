"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

const STATUS_CONFIG_STYLE = {
  pending:                { bg: "bg-amber-50",  text: "text-amber-800", dot: "bg-amber-500" },
  viewed:                 { bg: "bg-blue-50",   text: "text-blue-700",  dot: "bg-blue-400" },
  accepted:               { bg: "bg-teal-50",   text: "text-teal-800",  dot: "bg-teal-500" },
  completed:              { bg: "bg-blue-50",   text: "text-blue-700",  dot: "bg-blue-400" },
  rejected:               { bg: "bg-red-50",    text: "text-red-700",   dot: "bg-red-500"  },
  cancelled_by_passenger: { bg: "bg-gray-100",  text: "text-gray-600",  dot: "bg-gray-400" },
  cancelled_by_driver:    { bg: "bg-gray-100",  text: "text-gray-600",  dot: "bg-gray-400" },
  cancelled_late:         { bg: "bg-red-50",    text: "text-red-700",   dot: "bg-red-400"  },
  no_show:                { bg: "bg-red-50",    text: "text-red-700",   dot: "bg-red-400"  },
  expired:                { bg: "bg-gray-100",  text: "text-gray-500",  dot: "bg-gray-300" },
} as const;

export function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("bookings");
  const style = STATUS_CONFIG_STYLE[status as keyof typeof STATUS_CONFIG_STYLE] ?? STATUS_CONFIG_STYLE.expired;

  const STATUS_LABELS: Record<string, string> = {
    pending:                t("status_pending"),
    viewed:                 t("status_viewed"),
    accepted:               t("status_accepted"),
    completed:              t("status_completed"),
    rejected:               t("status_rejected"),
    cancelled_by_passenger: t("status_cancelled"),
    cancelled_by_driver:    t("status_cancelled"),
    cancelled_late:         t("status_cancelled_late"),
    no_show:                t("status_no_show"),
    expired:                t("status_expired"),
  };

  const label = STATUS_LABELS[status] ?? t("status_expired");

  return (
    <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", style.bg, style.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {label}
    </span>
  );
}
