"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getChatSummaries } from "@/lib/api/chat";
import { ChatRow } from "./chat-row";

const ACTIVE_CHAT_STATUSES = new Set(["pending", "viewed", "accepted"]);

export function ChatSidebar({ activeBookingId }: { activeBookingId: string }) {
  const t = useTranslations("chat");
  const { data: summaries = [] } = useQuery({
    queryKey: ["chat", "summaries"],
    queryFn: getChatSummaries,
    staleTime: 15_000,
  });

  const active = summaries.filter((s) => ACTIVE_CHAT_STATUSES.has(s.bookingStatus));
  const closed = summaries.filter((s) => !ACTIVE_CHAT_STATUSES.has(s.bookingStatus));

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-ink-200 bg-white">
      <div className="px-5 pb-3 pt-5">
        <p className="text-[17px] font-extrabold text-ink-900">{t("title")}</p>
        <p className="mt-0.5 text-[12px] font-semibold text-ink-500">
          {active.length > 0 ? t("active_count", { n: active.length }) : t("no_active")}
        </p>
      </div>
      <div className="h-px bg-ink-100" />
      <div className="flex-1 overflow-y-auto">
        {summaries.length === 0 && (
          <p className="px-4 py-8 text-center text-[13px] font-semibold text-ink-400">{t("no_chats")}</p>
        )}

        {active.map((s) => (
          <ChatRow key={s.bookingId} s={s} isActive={s.bookingId === activeBookingId} />
        ))}

        {closed.length > 0 && (
          <>
            <div className="mx-4 my-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-ink-100" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{t("archive")}</span>
              <div className="h-px flex-1 bg-ink-100" />
            </div>
            {closed.map((s) => (
              <ChatRow key={s.bookingId} s={s} isActive={s.bookingId === activeBookingId} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
