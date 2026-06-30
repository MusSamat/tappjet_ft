"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

const STATUS_CONFIG_STYLE = {
  pending:                { bg: "bg-accent-50",  text: "text-accent-700", dot: "bg-accent-500" },
  viewed:                 { bg: "bg-sky-50",   text: "text-sky-700",  dot: "bg-sky-400" },
  accepted:               { bg: "bg-brand-50",   text: "text-brand-800",  dot: "bg-brand-500" },
  completed:              { bg: "bg-sky-50",   text: "text-sky-700",  dot: "bg-sky-400" },
  rejected:               { bg: "bg-coral-50",    text: "text-coral-700",   dot: "bg-coral-500"  },
  cancelled_by_passenger: { bg: "bg-ink-100",  text: "text-ink-600",  dot: "bg-ink-400" },
  cancelled_by_driver:    { bg: "bg-ink-100",  text: "text-ink-600",  dot: "bg-ink-400" },
  cancelled_late:         { bg: "bg-coral-50",    text: "text-coral-700",   dot: "bg-coral-400"  },
  no_show:                { bg: "bg-coral-50",    text: "text-coral-700",   dot: "bg-coral-400"  },
  expired:                { bg: "bg-ink-100",  text: "text-ink-500",  dot: "bg-ink-300" },
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
