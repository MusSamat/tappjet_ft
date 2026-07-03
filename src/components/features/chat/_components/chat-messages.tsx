"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Spinner } from "@/components/ui";
import { MessageBubble } from "../message-bubble";
import { MessageComposer } from "../message-composer";
import type { ChatMessage } from "@/lib/api/chat";

interface PendingMessage extends ChatMessage {
  pending?: boolean;
  failed?: boolean;
  clientMsgId?: string;
}

interface Props {
  messages: PendingMessage[];
  historyLoaded: boolean;
  myId?: string;
  otherName: string;
  otherAvatarUrl: string | null;
  typingUserId: string | null;
  sendError: string | null;
  isReadOnly: boolean;
  bottomRef: React.RefObject<HTMLDivElement>;
  onSend: (text: string) => void;
  onTyping: () => void;
}

// px from the bottom under which we treat the user as "at the latest message"
const NEAR_BOTTOM_PX = 300;

function dayOf(iso?: string): string {
  return iso ? new Date(iso).toDateString() : "";
}

function DaySeparator({ iso }: { iso?: string }) {
  const t = useTranslations("chat");
  const locale = useLocale();
  if (!iso) return null;
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const label =
    d.toDateString() === today.toDateString()
      ? t("today")
      : d.toDateString() === yesterday.toDateString()
        ? t("yesterday")
        : new Intl.DateTimeFormat(locale === "ru" ? "ru" : "ky", {
            day: "numeric",
            month: "long",
            ...(d.getFullYear() !== today.getFullYear() ? { year: "numeric" as const } : {}),
          }).format(d);
  return (
    <div className="my-2 flex justify-center">
      <span className="rounded-full bg-ink-200/60 px-3 py-1 text-[11px] font-700 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
        {label}
      </span>
    </div>
  );
}

export function ChatMessages({
  messages,
  historyLoaded,
  myId,
  otherName,
  otherAvatarUrl,
  typingUserId,
  sendError,
  isReadOnly,
  bottomRef,
  onSend,
  onTyping,
}: Props) {
  const t = useTranslations("chat");
  const listRef = useRef<HTMLDivElement>(null);
  const [scrolledUp, setScrolledUp] = useState(false);

  // Keyboard scroll anchoring: when the visual viewport resizes (on-screen
  // keyboard opens/closes) keep the latest message + composer in view,
  // unless the user has deliberately scrolled up into history.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const el = listRef.current;
      if (!el) return;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX) {
        bottomRef.current?.scrollIntoView({ block: "end" });
      }
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, [bottomRef]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    setScrolledUp(el.scrollHeight - el.scrollTop - el.clientHeight > NEAR_BOTTOM_PX);
  };

  return (
    <>
      {/* Message list — the only scrollable region of the screen */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={listRef}
          onScroll={onScroll}
          className="h-full overflow-y-auto overscroll-contain bg-ink-50 px-4 py-4 dark:bg-ink-950"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              {historyLoaded ? (
                <>
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink-400 shadow-soft dark:bg-ink-800">
                    <MessageCircle className="h-8 w-8" aria-hidden="true" />
                  </span>
                  <p className="text-[15px] font-900 text-ink-700 dark:text-ink-200">
                    {t("empty_title")}
                  </p>
                  <p className="max-w-[260px] text-[13px] font-700 text-ink-400">
                    {t("empty_hint")}
                  </p>
                </>
              ) : (
                <Spinner size={24} />
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((m, i) => {
                const mine = m.senderId === myId;
                const newDay = i === 0 || dayOf(m.createdAt) !== dayOf(messages[i - 1]?.createdAt);
                return (
                  <Fragment key={m.clientMsgId ?? m.id}>
                    {newDay && <DaySeparator iso={m.createdAt} />}
                    <MessageBubble
                      message={m}
                      isMine={mine}
                      senderName={mine ? undefined : otherName}
                      senderAvatarUrl={mine ? undefined : otherAvatarUrl}
                    />
                  </Fragment>
                );
              })}
              {typingUserId && typingUserId !== myId && (
                <div className="mt-1 text-[12px] font-semibold text-ink-400">
                  {otherName} {t("typing")}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* «Scroll to latest» affordance when reading history */}
        {scrolledUp && (
          <button
            type="button"
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            aria-label={t("scroll_latest")}
            className="absolute bottom-3 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-600 shadow-lift ring-1 ring-ink-100 dark:bg-ink-800 dark:text-ink-200 dark:ring-ink-700"
          >
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Composer zone — pinned at the bottom of the chat column, never scrolls away */}
      {isReadOnly ? (
        <div className="shrink-0 border-t border-ink-200 bg-ink-50 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] text-center text-[12px] font-semibold text-ink-400 dark:border-ink-800 dark:bg-ink-900">
          {t("read_only")}
        </div>
      ) : (
        <div className="shrink-0 border-t border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
          {sendError && (
            <div className="mx-4 mt-2 rounded-xl bg-coral-50 px-3 py-2 text-[12px] font-semibold text-coral-700">
              {sendError}
            </div>
          )}
          <MessageComposer onSend={onSend} onTyping={onTyping} />
          <p className="px-5 pb-[calc(10px+env(safe-area-inset-bottom))] text-center text-[11px] font-600 text-ink-400">
            🔒 {t("safety_note")}
          </p>
        </div>
      )}
    </>
  );
}
