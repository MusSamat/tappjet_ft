"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUnreadCount } from "@/lib/hooks/use-unread-count";
import { useAuth } from "@/store/auth";

// Floating bell — design-spec §1.2: mobile only, authenticated only,
// visible on feed / my / profile (never on detail/create/chat).
const SHOW_ON = ["/trips", "/requests", "/my/bookings", "/profile"];

export function FloatingBell() {
  const t = useTranslations("top_nav");
  const pathname = usePathname();
  const isAuthenticated = useAuth((s) => s.status === "authenticated");
  const { data: unread = 0 } = useUnreadCount();

  if (!isAuthenticated || !SHOW_ON.includes(pathname)) return null;

  return (
    <Link
      href="/notifications"
      aria-label={t("notifications_aria")}
      className="fixed right-4 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-600 shadow-soft backdrop-blur dark:bg-ink-900/90 dark:text-ink-200 md:hidden"
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[9px] font-900 text-white ring-2 ring-white dark:ring-ink-900">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
