"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { type ChatSummary } from "@/lib/api/chat";
import { DriverAvatar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

const ACTIVE_CHAT_STATUSES = new Set(["pending", "viewed", "accepted"]);

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function ChatRow({ s, isActive }: { s: ChatSummary; isActive: boolean }) {
  const t = useTranslations("chat");
  const CLOSED_STATUS_LABEL: Record<string, string> = {
    completed:              t("status_completed"),
    rejected:               t("status_rejected"),
    cancelled_by_passenger: t("status_cancelled"),
    cancelled_by_driver:    t("status_cancelled"),
    cancelled_late:         t("status_cancelled"),
    no_show:                t("status_no_show"),
    expired:                t("status_expired"),
  };
  const isClosed = !ACTIVE_CHAT_STATUSES.has(s.bookingStatus);
  const closedLabel = CLOSED_STATUS_LABEL[s.bookingStatus] ?? t("archive");
  const hasUnread = !isClosed && s.unreadCount > 0;

  return (
    <Link
      href={`/my/bookings/${s.bookingId}/chat`}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
        isActive && "bg-teal-50 hover:bg-teal-50",
        isClosed && "opacity-60",
      )}
    >
      <div className="relative flex-shrink-0">
        <DriverAvatar name={s.otherName} src={s.otherAvatarUrl} size="sm" />
        {hasUnread && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-500 px-0.5 text-[9px] font-extrabold leading-none text-white">
            {s.unreadCount > 9 ? "9+" : s.unreadCount}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <span className={cn(
            "truncate text-[14px] font-bold",
            isActive ? "text-teal-900" : isClosed ? "text-gray-500" : hasUnread ? "text-gray-900" : "text-gray-700",
          )}>
            {s.otherName}
          </span>
          {isClosed ? (
            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-400">
              {closedLabel}
            </span>
          ) : s.lastMessageAt ? (
            <span className={cn(
              "flex-shrink-0 text-[11px] font-semibold",
              hasUnread ? "text-teal-600" : "text-gray-400",
            )}>
              {formatTime(s.lastMessageAt)}
            </span>
          ) : null}
        </div>
        <p className={cn(
          "truncate text-[12px] font-semibold",
          isClosed ? "text-gray-400" : "text-gray-500",
        )}>
          {s.route}
        </p>
      </div>
    </Link>
  );
}
