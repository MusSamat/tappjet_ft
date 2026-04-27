"use client";

import { useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MessageCircle, X } from "lucide-react";
import { listIncomingBookings, acceptBooking, rejectBooking } from "@/lib/api/bookings";
import { getNotifications, markNotificationRead } from "@/lib/api/notifications";
import { getChatSummaries, type ChatSummary } from "@/lib/api/chat";
import { useAuth } from "@/store/auth";
import { getSocket } from "@/lib/socket/client";
import { cn } from "@/lib/utils/cn";
import { ChatsTab } from "./_tabs/chats-tab";
import { RequestsTab } from "./_tabs/requests-tab";
import { NotificationsTab } from "./_tabs/notifications-tab";

type QATab = "chats" | "requests" | "notifications";

export function QuickActions() {
  const t = useTranslations("quick_actions");
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.status === "authenticated");
  const isDriver = user?.roles?.includes("driver") ?? false;
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<QATab>("chats");
  const panelRef = useRef<HTMLDivElement>(null);

  // Real-time badge updates — socket lives in root layout so this fires
  // even when ChatPanel is unmounted (user not on chat page).
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();
    const onChatMessage = () => {
      void qc.invalidateQueries({ queryKey: ["chat", "summaries"] });
    };
    socket.on("chat:message", onChatMessage);
    return () => { socket.off("chat:message", onChatMessage); };
  }, [isAuthenticated, qc]);

  // ── Queries ──────────────────────────────────────────────────────────────

  // Chat summaries: already sorted by lastMessageAt desc on the backend
  const { data: summariesData } = useQuery({
    queryKey: ["chat", "summaries"],
    queryFn: getChatSummaries,
    enabled: isAuthenticated,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    refetchInterval: open ? 10_000 : 60_000,
  });

  // Incoming bookings for the Requests tab (driver only)
  const { data: incomingData } = useQuery({
    queryKey: ["bookings", "incoming", "qa"],
    queryFn: () => listIncomingBookings(undefined, undefined, 50),
    enabled: isAuthenticated && isDriver,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchInterval: open ? 15_000 : false,
  });

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "qa"],
    queryFn: () => getNotifications({ unread: true, limit: 10 }),
    enabled: isAuthenticated,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchInterval: open ? 30_000 : false,
  });

  // ── Derived counts ─────────────────────────────────────────────────────

  const allChats: ChatSummary[] = (summariesData ?? []).filter((c) => c.bookingStatus === "accepted");
  const requests = (incomingData?.data ?? []).filter(
    (b) => b.status === "pending" || b.status === "viewed",
  );
  const notifications = notifData?.data ?? [];

  const totalUnreadMessages = allChats.reduce((s, c) => s + c.unreadCount, 0);
  const unreadNotifCount = notifications.length;
  const requestsCount = requests.length;

  const fabBadge = requestsCount + unreadNotifCount + totalUnreadMessages;
  const chatsBadge = totalUnreadMessages;

  // ── Mutations ─────────────────────────────────────────────────────────────

  const acceptMut = useMutation({
    mutationFn: acceptBooking,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectBooking(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
  const readMut = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // ── Outside click ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("[data-qa-fab]")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!isAuthenticated) return null;

  const handleFabClick = () => {
    if (!open) {
      if (isDriver && requestsCount > 0) setTab("requests");
      else if (allChats.length > 0) setTab("chats");
      else setTab("notifications");
    }
    setOpen((o) => !o);
  };

  const tabsForRole: { id: QATab; label: string; badge?: number }[] = [
    { id: "chats", label: t("tab_chats"), badge: chatsBadge },
    ...(isDriver ? [{ id: "requests" as QATab, label: t("tab_requests"), badge: requestsCount }] : []),
    { id: "notifications", label: t("tab_notifications"), badge: unreadNotifCount },
  ];

  return (
    <>
      {/* FAB */}
      <button
        data-qa-fab
        type="button"
        onClick={handleFabClick}
        className="qa-fab-bottom fixed right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl transition-transform hover:scale-105 hover:bg-teal-700 active:scale-95"
        aria-label={t("fab_aria")}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && fabBadge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-extrabold text-white">
            {fabBadge > 9 ? "9+" : fabBadge}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="qa-panel-bottom fixed right-5 z-50 flex w-[340px] flex-col overflow-hidden rounded-2xl border-[0.5px] border-gray-200 bg-white shadow-2xl"
          style={{ maxHeight: "60vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-[14px] font-bold text-gray-900">
              {tab === "chats" ? t("tab_chats") : tab === "requests" ? t("tab_requests") : t("tab_notifications")}
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {tabsForRole.map(({ id, label, badge }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-bold transition-colors",
                  tab === id
                    ? "border-b-2 border-teal-600 text-teal-700"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700",
                )}
              >
                {label}
                {badge !== undefined && badge > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-0.5 text-[10px] font-extrabold text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
            {tab === "chats" && <ChatsTab chats={allChats} onClose={() => setOpen(false)} />}
            {tab === "requests" && <RequestsTab requests={requests} acceptMut={acceptMut} rejectMut={rejectMut} />}
            {tab === "notifications" && <NotificationsTab notifications={notifications} readMut={readMut} />}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
            <Link
              href={tab === "notifications" ? "/notifications" : "/my/bookings"}
              onClick={() => setOpen(false)}
              className="text-[12px] font-bold text-teal-600 hover:text-teal-700"
            >
              {tab === "notifications" ? t("all_notifications_link") : t("all_bookings_link")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
