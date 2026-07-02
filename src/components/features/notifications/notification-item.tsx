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
  if (diffMin < 60) return `${diffMin}м`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}ч`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}д`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

// Icon-medallion tone derived from the type's color (§2.8). Literal maps so the
// Tailwind scanner keeps every variant.
type Tone = "brand" | "grape" | "sky" | "accent" | "coral" | "ink";

function toneOf(color: string): Tone {
  if (color.includes("brand")) return "brand";
  if (color.includes("grape")) return "grape";
  if (color.includes("sky")) return "sky";
  if (color.includes("accent")) return "accent";
  if (color.includes("coral") || color.includes("danger")) return "coral";
  return "ink";
}

const CARD_UNREAD: Record<Tone, string> = {
  brand: "bg-brand-50 ring-brand-100 dark:bg-brand-500/10 dark:ring-brand-500/20",
  grape: "bg-grape-50 ring-grape-100 dark:bg-grape-500/10 dark:ring-grape-500/20",
  sky: "bg-sky-50 ring-sky-100 dark:bg-sky-500/10 dark:ring-sky-500/20",
  accent: "bg-accent-50 ring-accent-100 dark:bg-accent-500/10 dark:ring-accent-500/20",
  coral: "bg-coral-50 ring-coral-100 dark:bg-coral-500/10 dark:ring-coral-500/20",
  ink: "bg-ink-100 ring-ink-100 dark:bg-ink-800/60 dark:ring-ink-800",
};

const MEDALLION_UNREAD: Record<Tone, string> = {
  brand: "bg-brand-600 text-white",
  grape: "bg-grape-500 text-white",
  sky: "bg-sky-500 text-white",
  accent: "bg-accent-500 text-white",
  coral: "bg-coral-500 text-white",
  ink: "bg-ink-600 text-white",
};

const MEDALLION_READ: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300",
  grape: "bg-grape-100 text-grape-600 dark:bg-grape-500/15 dark:text-grape-300",
  sky: "bg-sky-100 text-sky-600 dark:bg-sky-500/15",
  accent: "bg-accent-100 text-accent-600 dark:bg-accent-500/15",
  coral: "bg-coral-100 text-coral-500 dark:bg-coral-500/15",
  ink: "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300",
};

interface Props {
  notification: AppNotification;
}

export function NotificationItem({ notification }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [read, setRead] = useState(!!notification.readAt);
  const config = TYPE_CONFIG[notification.type] ?? { icon: Bell, label: "Уведомление", color: "text-ink-700" };
  const Icon = config.icon;
  const tone = toneOf(config.color);
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
        "overflow-hidden rounded-2xl transition-colors",
        read
          ? "bg-white shadow-sm ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
          : cn("ring-1", CARD_UNREAD[tone]),
      )}
    >
      <button
        type="button"
        onClick={handleHeaderClick}
        className={cn(
          "flex w-full items-start gap-3 p-3.5 text-left",
          deepLink && "cursor-pointer",
        )}
      >
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            read ? MEDALLION_READ[tone] : MEDALLION_UNREAD[tone],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-[13px] text-ink-900 dark:text-white", read ? "font-800" : "font-900")}>
              {config.label}
            </p>
            <span className="shrink-0 text-[11px] font-700 text-ink-400">
              {formatNotifTime(notification.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] font-700 text-ink-500 dark:text-ink-400">{buildBody(notification)}</p>
        </div>
        {!read && (
          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-coral-500" aria-hidden="true" />
        )}
      </button>

      {hasActions && (
        <div className="border-t border-ink-100 px-3.5 pb-3 pt-2.5 dark:border-ink-800">
          <NotificationActions notification={notification} />
        </div>
      )}
    </article>
  );
}
