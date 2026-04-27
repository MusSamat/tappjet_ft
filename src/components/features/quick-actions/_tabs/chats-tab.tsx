"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { type ChatSummary } from "@/lib/api/chat";
import { DriverAvatar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

function relTime(iso: string | null): string {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "сейчас";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч`;
  return `${Math.floor(diff / 86400)} д`;
}

interface ChatsTabProps {
  chats: ChatSummary[];
  onClose: () => void;
}

export function ChatsTab({ chats, onClose }: ChatsTabProps) {
  const t = useTranslations("quick_actions");

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
        <MessageCircle className="h-8 w-8 text-gray-200" />
        <p className="text-[12px] font-semibold text-gray-400">
          {t("no_chats")}<br />
          {t("no_chats_hint")}
        </p>
      </div>
    );
  }

  return (
    <>
      {chats.map((c) => (
        <Link
          key={c.bookingId}
          href={`/my/bookings/${c.bookingId}/chat`}
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50",
            c.unreadCount > 0 && "bg-teal-50/40 hover:bg-teal-50",
          )}
        >
          <div className="relative">
            <DriverAvatar name={c.otherName} src={c.otherAvatarUrl} size="md" />
            {c.unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
                {c.unreadCount > 99 ? "99+" : c.unreadCount}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className={cn(
                "truncate text-[13px]",
                c.unreadCount > 0 ? "font-extrabold text-gray-900" : "font-bold text-gray-800",
              )}>
                {c.otherName}
              </p>
              {c.lastMessageAt && (
                <span className="flex-shrink-0 text-[10px] text-gray-400">
                  {relTime(c.lastMessageAt)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-1 mt-0.5">
              <p className="truncate text-[11px] text-gray-500">{c.route}</p>
              <span className={cn(
                "flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold",
                c.role === "driver" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600",
              )}>
                {c.role === "driver" ? t("role_driver") : t("role_passenger")}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}
