"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getNotifications, markNotificationRead } from "@/lib/api/notifications";
import { NotificationItem } from "@/components/features/notifications/notification-item";
import { useAuth } from "@/store/auth";
import { Container, Spinner } from "@/components/ui";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const LIMIT = 20;
const ADMIN_TYPES = new Set(["verification_sla_breach"]);

// Notification type groups — maps UI setting keys to backend notification types
const NOTIF_TYPE_GROUPS: Record<string, string[]> = {
  messages:      ["chat_message", "chat_unread"],
  bookings:      ["booking_accepted", "booking_rejected", "booking_cancelled", "booking_cancelled_driver", "booking_cancelled_passenger", "booking_pending", "booking_viewed", "booking_no_show", "booking_completed"],
  reminders:     ["trip_reminder_2h", "trip_reminder_1h", "trip_reminder_1d"],
  ratings:       ["rating_request"],
  marketing:     ["promo", "news", "marketing"],
};

interface NotifSetting {
  key: string;
  label: string;
  defaultOn: boolean;
}

const NOTIF_SETTING_KEYS: { key: string; defaultOn: boolean }[] = [
  { key: "messages",  defaultOn: true  },
  { key: "bookings",  defaultOn: true  },
  { key: "reminders", defaultOn: true  },
  { key: "ratings",   defaultOn: true  },
  { key: "marketing", defaultOn: false },
];

function loadPrefs(userId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`tappjet_notif_prefs_${userId}`);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function savePrefs(userId: string, prefs: Record<string, boolean>): void {
  try {
    localStorage.setItem(`tappjet_notif_prefs_${userId}`, JSON.stringify(prefs));
  } catch {
    // localStorage unavailable — silent fail
  }
}

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const queryClient = useQueryClient();
  const _sentinelRef = useRef<HTMLDivElement>(null);
  const userId = useAuth((s) => s.user?.id);

  const NOTIF_SETTINGS: NotifSetting[] = NOTIF_SETTING_KEYS.map((s) => ({
    ...s,
    label: t(`types.${s.key as "messages" | "bookings" | "reminders" | "ratings" | "marketing"}`),
  }));

  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Load prefs from localStorage on mount (client-side only)
  useEffect(() => {
    if (!userId) return;
    const saved = loadPrefs(userId);
    const defaults = Object.fromEntries(
      NOTIF_SETTING_KEYS.map((s) => [s.key, saved[s.key] ?? s.defaultOn]),
    );
    setPrefs(defaults);
    setPrefsLoaded(true);
  }, [userId]);

  const togglePref = (key: string) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (userId) savePrefs(userId, next);
      return next;
    });
  };

  const query = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      getNotifications({ cursor: pageParam as string | undefined, limit: LIMIT }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    staleTime: 30_000,
  });

  // Build set of disabled types based on prefs
  const disabledTypes = prefsLoaded
    ? new Set(
        NOTIF_SETTINGS
          .filter((s) => !prefs[s.key])
          .flatMap((s) => NOTIF_TYPE_GROUPS[s.key] ?? []),
      )
    : new Set<string>();

  const notifications = (query.data?.pages.flatMap((p) => p.data) ?? [])
    .filter((n) => !ADMIN_TYPES.has(n.type) && !disabledTypes.has(n.type));

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter((n) => !n.readAt);
      await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Infinite scroll
  const lastRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !query.hasNextPage || query.isFetchingNextPage) return;
      const io = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) query.fetchNextPage();
      });
      io.observe(node);
    },
    [query],
  );

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold text-gray-900">{t("title")}</h1>
          <p className="mt-0.5 text-[12px] font-semibold text-gray-400">
            {unreadCount > 0 ? t("unread_count", { n: unreadCount }) : t("all_read")}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead()}
            disabled={markingAll}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-[12px] font-bold text-teal-700 hover:bg-teal-50 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            {t("mark_all_read_btn")}
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {query.isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size={24} />
          </div>
        ) : query.isError ? (
          <div className="rounded-2xl border border-coral-200 bg-coral-50 p-5 text-[13px] font-semibold text-coral-600">
            {t("load_error")}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center">
            <p className="text-[17px] font-bold text-gray-900">{t("empty_title")}</p>
            <p className="mt-2 text-[13px] text-gray-500">{t("empty_hint")}</p>
          </div>
        ) : (
          notifications.map((n, idx) => (
            <div key={n.id} ref={idx === notifications.length - 1 ? lastRef : undefined}>
              <NotificationItem notification={n} />
            </div>
          ))
        )}
        {query.isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Spinner size={20} />
          </div>
        )}
      </div>

      {/* Notification settings */}
      <div className="mt-6 rounded-3xl border border-ink-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-extrabold text-gray-900">{t("settings_title")}</h2>
          {prefsLoaded && (
            <span className="text-[11px] font-semibold text-gray-400">{t("settings_saved")}</span>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {NOTIF_SETTINGS.map(({ key, label }) => {
            const on = prefs[key] ?? true;
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-gray-900">{label}</span>
                <button
                  type="button"
                  onClick={() => togglePref(key)}
                  role="switch"
                  aria-checked={on}
                  aria-label={label}
                  className={cn(
                    "relative h-6 w-11 flex-shrink-0 rounded-full transition-colors",
                    on ? "bg-teal-500" : "bg-gray-200",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      on ? "left-[22px]" : "left-0.5",
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
