"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

// The single status pill — design-spec §1.7 («Status badges»).
// Covers real statuses: bookings (pending/viewed/accepted/rejected/
// cancelled_*/no_show/completed/expired), trips (active/completed/cancelled),
// requests (open/closed/cancelled/expired).

export type StatusBadgeStatus =
  | "active"
  | "open"
  | "accepted"
  | "pending"
  | "viewed"
  | "rejected"
  | "cancelled"
  | "cancelled_by_passenger"
  | "cancelled_by_driver"
  | "cancelled_late"
  | "no_show"
  | "completed"
  | "expired"
  | "closed";

/** @deprecated pre-redesign name — use StatusBadgeStatus. */
export type LifecycleStatus = StatusBadgeStatus;

const BRAND_SOLID = "bg-brand-600 text-white";
const BRAND_SOFT = "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300";
const ACCENT_SOFT = "bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300";
const DANGER_SOFT = "bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400";
const INK_SOFT = "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300";

const STYLE: Record<StatusBadgeStatus, string> = {
  active: BRAND_SOLID,
  open: BRAND_SOLID,
  accepted: BRAND_SOFT,
  pending: ACCENT_SOFT,
  viewed: ACCENT_SOFT,
  rejected: DANGER_SOFT,
  cancelled: DANGER_SOFT,
  cancelled_by_passenger: DANGER_SOFT,
  cancelled_by_driver: DANGER_SOFT,
  cancelled_late: DANGER_SOFT,
  no_show: DANGER_SOFT,
  completed: INK_SOFT,
  expired: INK_SOFT,
  closed: INK_SOFT,
};

interface StatusBadgeProps {
  /** known statuses get style + i18n label; unknown strings fall back to ink */
  status: StatusBadgeStatus | (string & {});
  /** overrides the i18n label */
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const t = useTranslations("status");
  const known = status in STYLE;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-900",
        known ? STYLE[status as StatusBadgeStatus] : INK_SOFT,
        className,
      )}
    >
      {label ?? (known ? t(status) : status)}
    </span>
  );
}
