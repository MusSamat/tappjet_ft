"use client";

import { useTranslations } from "next-intl";
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

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            {historyLoaded ? (
              <p className="text-[13px] font-semibold text-gray-400">{t("start")}</p>
            ) : (
              <Spinner size={24} />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => {
              const mine = m.senderId === myId;
              return (
                <MessageBubble
                  key={m.clientMsgId ?? m.id}
                  message={m}
                  isMine={mine}
                  senderName={mine ? undefined : otherName}
                  senderAvatarUrl={mine ? undefined : otherAvatarUrl}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
        {typingUserId && typingUserId !== myId && (
          <div className="mt-1 text-[12px] font-semibold text-gray-400">
            {otherName} {t("typing")}
          </div>
        )}
      </div>

      {isReadOnly ? (
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 text-center text-[12px] font-semibold text-gray-400">
          {t("read_only")}
        </div>
      ) : (
        <>
          {sendError && (
            <div className="mx-4 mb-1 rounded-xl bg-coral-50 px-3 py-2 text-[12px] font-semibold text-coral-700">
              {sendError}
            </div>
          )}
          <MessageComposer onSend={onSend} onTyping={onTyping} />
          <p className="bg-white px-5 pb-3 text-center text-[11px] font-semibold text-gray-400">
            🔒 {t("safety_note")}
          </p>
        </>
      )}
    </>
  );
}
