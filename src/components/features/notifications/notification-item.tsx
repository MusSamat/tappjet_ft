"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationRead, type AppNotification } from "@/lib/api/notifications";
import { cn } from "@/lib/utils/cn";
import { TYPE_CONFIG, ACTION_TYPES, buildBody, buildDeepLink } from "./_utils/notification-utils";
import { NotificationActions } from "./_components/notification-actions";

function formatNotifTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ч назад`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} д назад`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

interface Props {
  notification: AppNotification;
}

export function NotificationItem({ notification }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [read, setRead] = useState(!!notification.readAt);
  const config = TYPE_CONFIG[notification.type] ?? { icon: Bell, label: "Уведомление", color: "text-gray-700" };
  const Icon = config.icon;
  const hasActions = ACTION_TYPES.has(notification.type);
  const deepLink = buildDeepLink(notification);

  const { mutate: markRead } = useMutation({
    mutationFn: () => markNotificationRead(notification.id),
    onMutate: () => setRead(true),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  function handleHeaderClick() {
    if (!read) markRead();
    if (deepLink) router.push(deepLink);
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-ink-100 bg-white transition-colors",
        !read && "border-teal-200 bg-teal-50/40",
      )}
    >
      <button
        type="button"
        onClick={handleHeaderClick}
        className={cn(
          "flex w-full items-start gap-3 p-4 text-left hover:bg-black/[0.02]",
          deepLink && "cursor-pointer",
        )}
      >
        <span className={cn("mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100", !read && "bg-teal-100")}>
          <Icon className={cn("h-5 w-5", config.color)} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-body text-gray-900", !read && "font-semibold")}>{config.label}</p>
            <span className="flex-shrink-0 text-caption text-gray-500">{formatNotifTime(notification.createdAt)}</span>
          </div>
          <p className="mt-0.5 text-body-lg text-gray-700">{buildBody(notification)}</p>
        </div>
        {!read && (
          <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
        )}
      </button>

      {hasActions && (
        <div className="border-t border-gray-100 px-4 pb-3 pt-2.5">
          <NotificationActions notification={notification} />
        </div>
      )}
    </article>
  );
}
