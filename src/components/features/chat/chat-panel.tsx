"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Car } from "lucide-react";
import { useTranslations } from "next-intl";
import { getBooking } from "@/lib/api/bookings";
import { getChatHistory, markAllChatRead, sendMessageRest, type ChatMessage } from "@/lib/api/chat";
import { extractError } from "@/lib/api/client";
import { useFriendlyError } from "@/lib/hooks/use-api-error";
import { useChatSocket } from "@/lib/hooks/use-chat-socket";
import { useAuth } from "@/store/auth";
import { uuid } from "@/lib/utils/uuid";
import { ChatSidebar } from "./_components/chat-sidebar";
import { ChatHeader } from "./_components/chat-header";
import { ChatMessages } from "./_components/chat-messages";

interface PendingMessage extends ChatMessage {
  pending?: boolean;
  failed?: boolean;
  clientMsgId?: string;
}

interface Props {
  bookingId: string;
}

export function ChatPanel({ bookingId }: Props) {
  const me = useAuth((s) => s.user);
  const [messages, setMessages] = useState<PendingMessage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const originalTitleRef = useRef<string>("");
  const isInitialLoad = useRef(true);

  const bookingQuery = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBooking(bookingId),
    staleTime: 30_000,
  });

  useQuery({
    queryKey: ["chat", bookingId, "history"],
    queryFn: async () => {
      const res = await getChatHistory(bookingId);
      setMessages((prev) => (prev.length === 0 ? [...res.data].reverse() : prev));
      setHistoryLoaded(true);
      return res;
    },
    staleTime: 10_000,
  });

  const qc = useQueryClient();

  const onHistory = useCallback((history: ChatMessage[]) => setMessages([...history].reverse()), []);

  const onMessage = useCallback((msg: ChatMessage, clientMsgId?: string) => {
    setMessages((prev) => {
      // Exact-id dedup (normal case, message already in state).
      if (prev.some((m) => m.id === msg.id)) return prev;
      // If client_msg_id is present and matches a pending optimistic message,
      // the ACK will update it — skip adding a duplicate from the broadcast.
      if (clientMsgId && prev.some((m) => m.clientMsgId === clientMsgId)) return prev;
      return [...prev, msg];
    });
  }, []);

  const onAck = useCallback((clientMsgId: string, serverId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.clientMsgId === clientMsgId ? { ...m, id: serverId, pending: false } : m,
      ),
    );
  }, []);

  const onTyping = useCallback((userId: string) => {
    if (userId === me?.id) return;
    setTypingUserId(userId);
    window.setTimeout(() => setTypingUserId(null), 2500);
  }, [me?.id]);

  const onRead = useCallback((messageId: string, readAt: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isRead: true, readAt } : m)),
    );
  }, []);

  const t = useTranslations("chat");
  const fe = useFriendlyError();

  const onChatError = useCallback((code: string) => {
    // Mark every pending message as failed so the clock icon clears.
    setMessages((prev) =>
      prev.map((m) => (m.pending ? { ...m, pending: false, failed: true } : m)),
    );
    if (code === "FORBIDDEN" || code === "CHAT_NOT_AVAILABLE") {
      setSendError(t("unavailable"));
    } else if (code !== "RATE_LIMITED") {
      setSendError(t("send_error"));
    }
  }, [t]);

  const chat = useChatSocket({
    bookingId,
    onHistory,
    onMessage,
    onAck,
    onTyping,
    onRead,
    onError: onChatError,
  });

  useEffect(() => {
    markAllChatRead(bookingId)
      .then(() => qc.invalidateQueries({ queryKey: ["chat", "summaries"] }))
      .catch(() => undefined);
  }, [bookingId, qc]);

  useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: isInitialLoad.current ? "auto" : "smooth" });
    isInitialLoad.current = false;
  }, [messages.length]);

  useEffect(() => {
    originalTitleRef.current = document.title;
    const onVisibility = () => {
      if (!document.hidden) document.title = originalTitleRef.current;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.title = originalTitleRef.current;
    };
  }, []);

  useEffect(() => {
    if (!document.hidden || messages.length === 0) return;
    const unread = messages.filter((m) => m.senderId !== me?.id && !m.isRead).length;
    document.title = unread > 0 ? `(${unread}) Tappjet — новые сообщения` : originalTitleRef.current;
  }, [messages, me?.id]);

  const handleSend = (text: string) => {
    setSendError(null);
    const clientMsgId = uuid();
    const optimistic: PendingMessage = {
      id: clientMsgId,
      bookingId,
      senderId: me?.id,
      text,
      isRead: false,
      createdAt: new Date().toISOString(),
      pending: true,
      clientMsgId,
    };
    setMessages((prev) => [...prev, optimistic]);

    if (chat.connected) {
      chat.send(text, clientMsgId);
    } else {
      sendMessageRest(bookingId, text, clientMsgId)
        .then((sent) =>
          setMessages((prev) =>
            prev.map((m) => (m.clientMsgId === clientMsgId ? { ...sent, clientMsgId } : m)),
          ),
        )
        .catch((e) => {
          setSendError(fe(extractError(e)));
          setMessages((prev) =>
            prev.map((m) =>
              m.clientMsgId === clientMsgId ? { ...m, pending: false, failed: true } : m,
            ),
          );
        });
    }
  };

  const booking = bookingQuery.data;
  const rawBooking = booking as {
    passengerId?: string;
    trip?: { driverId?: string; originCity?: string; destinationCity?: string; departureAt?: string; car?: string; driver?: { name?: string; avatarUrl?: string | null; phone?: string } };
    passenger?: { name?: string; avatarUrl?: string | null; phone?: string };
  } | undefined;
  const iAmDriver = rawBooking?.trip?.driverId === me?.id;
  const otherUserId = iAmDriver ? rawBooking?.passengerId : rawBooking?.trip?.driverId;
  const otherName = iAmDriver
    ? (rawBooking?.passenger?.name ?? t("passenger_role"))
    : (rawBooking?.trip?.driver?.name ?? t("driver_role"));
  const otherAvatarUrl = iAmDriver
    ? ((rawBooking?.passenger as { avatarUrl?: string | null } | undefined)?.avatarUrl ?? null)
    : (rawBooking?.trip?.driver?.avatarUrl ?? null);
  const otherPhone = iAmDriver
    ? (rawBooking?.passenger as { phone?: string } | undefined)?.phone
    : rawBooking?.trip?.driver?.phone;
  const isPreBooking = booking?.status === "pending";
  const isReadOnly = !!booking && !["pending", "viewed", "accepted"].includes(booking.status ?? "");

  return (
    <div
      className="flex justify-center"
      style={{ height: "calc(100dvh - calc(64px + env(safe-area-inset-bottom)))" } as React.CSSProperties}
    >
    <div className="flex w-full max-w-[1500px]">
      {/* Sidebar — desktop only */}
      <div className="hidden w-[320px] flex-shrink-0 lg:block">
        <ChatSidebar activeBookingId={bookingId} />
      </div>

      {/* Main chat */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Header */}
        <ChatHeader
          otherUserId={otherUserId}
          otherName={otherName}
          otherAvatarUrl={otherAvatarUrl}
          otherPhone={otherPhone}
          bookingStatus={booking?.status}
          tripRoute={rawBooking?.trip ? `${rawBooking.trip.originCity} → ${rawBooking.trip.destinationCity}` : undefined}
          connected={chat.connected}
          typingUserId={typingUserId}
        />

        {/* Pre-booking banner */}
        {isPreBooking && (
          <div className="mx-5 mt-3 rounded-2xl border border-accent-100 bg-accent-50 px-3 py-2.5">
            <p className="text-[12px] font-extrabold text-accent-700">
              🔒 {t("pre_book_note")}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-accent-700">
              {t("pre_book_hint")}
            </p>
          </div>
        )}

        {/* Trip summary bar */}
        {rawBooking?.trip && (
          <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50 px-5 py-2">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-700">
              {rawBooking.trip.car && <><Car className="h-3.5 w-3.5" aria-hidden="true" /> {rawBooking.trip.car}</>}
            </div>
            <span className="text-[12px] font-bold text-brand-700">
              {isReadOnly ? t("archived") : isPreBooking ? t("pending") : t("booked")}
            </span>
          </div>
        )}

        <ChatMessages
          messages={messages}
          historyLoaded={historyLoaded}
          myId={me?.id}
          otherName={otherName}
          otherAvatarUrl={otherAvatarUrl}
          typingUserId={typingUserId}
          sendError={sendError}
          isReadOnly={isReadOnly}
          bottomRef={bottomRef}
          onSend={handleSend}
          onTyping={chat.sendTyping}
        />
      </div>
    </div>
    </div>
  );
}
