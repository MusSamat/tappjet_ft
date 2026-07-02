"use client";

import { cn } from "@/lib/utils/cn";
import type { ChatMessage } from "@/lib/api/chat";
import { DriverAvatar } from "@/components/ui";
import { Check, CheckCheck, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  message: ChatMessage & { pending?: boolean; failed?: boolean };
  isMine: boolean;
  senderName?: string;
  senderAvatarUrl?: string | null;
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function MessageBubble({ message, isMine, senderName, senderAvatarUrl }: Props) {
  const t = useTranslations("chat");
  return (
    <div className={cn("flex items-end gap-2", isMine ? "justify-end" : "justify-start")}>
      {!isMine && (
        <div className="flex-shrink-0 self-end">
          <DriverAvatar name={senderName ?? "?"} src={senderAvatarUrl} size="sm" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5",
          isMine
            ? "rounded-br-md bg-brand-600 text-white"
            : "rounded-bl-md bg-white text-ink-800 shadow-sm dark:bg-ink-800 dark:text-ink-100",
        )}
      >
        <p className="whitespace-pre-wrap break-words text-body-lg">{message.text}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-caption",
            isMine ? "text-brand-50/80" : "text-ink-500",
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isMine && message.pending && (
            <Clock className="h-3.5 w-3.5 opacity-70" aria-label={t("sending")} />
          )}
          {isMine && message.failed && (
            <span className="font-bold text-accent-200" aria-label={t("failed")}>!</span>
          )}
          {isMine && !message.pending && !message.failed && (
            message.isRead
              ? <CheckCheck className="h-3.5 w-3.5" aria-label={t("read")} />
              : <Check className="h-3.5 w-3.5 opacity-60" aria-label={t("delivered")} />
          )}
        </div>
      </div>
    </div>
  );
}
