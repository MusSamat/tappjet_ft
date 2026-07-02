"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, MessageCircle, Plus, Search, Ticket, User, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUnreadMessages } from "@/lib/hooks/use-unread-messages";
import { useRoleTheme } from "@/lib/hooks/use-role-colors";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils/cn";

// Floating pill bottom nav — design-spec §1.2.
// Logged-in: Поиск · Мои · [amber + FAB] · Чаты · Профиль.
// Guest: Поиск · Войти (no FAB).

function NavTab({
  href,
  label,
  icon: Icon,
  active,
  pillOn,
  textOn,
  badge,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  pillOn: string;
  textOn: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors",
        active && pillOn,
      )}
    >
      <Icon
        className={cn("h-6 w-6", active ? textOn : "text-ink-400")}
        strokeWidth={active ? 2.4 : 2}
        aria-hidden="true"
      />
      <span
        className={cn(
          "text-[11px]",
          active ? cn("font-900", textOn) : "font-700 text-ink-500",
        )}
      >
        {label}
      </span>
      {typeof badge === "number" && badge > 0 && (
        <span className="absolute right-1.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[9px] font-900 text-white ring-2 ring-white dark:ring-ink-900">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isAuthenticated = useAuth((s) => s.status === "authenticated");
  const activeMode = useAuth((s) => s.activeMode);
  const isDriver = activeMode === "driver";
  const { theme } = useRoleTheme();
  const { data: unreadMessages = 0 } = useUnreadMessages();

  const startsWith = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isChat = pathname.startsWith("/my/bookings/") && pathname.endsWith("/chat");
  const feedHref = isDriver ? "/requests" : "/trips";
  const feedActive = startsWith("/trips") || startsWith("/requests");
  const createHref = isDriver ? "/trips/create" : "/requests/create";

  return (
    <nav
      aria-label={t("main_nav_aria")}
      className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-center px-3 pb-3 md:hidden"
      style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
    >
      <div
        className={cn(
          "pointer-events-auto flex flex-1 items-center rounded-[1.75rem] border border-ink-100 bg-white/95 p-1.5 shadow-lift backdrop-blur-xl dark:border-ink-800 dark:bg-ink-900/95",
          isAuthenticated ? "gap-0.5" : "gap-1",
        )}
      >
        {isAuthenticated ? (
          <>
            <NavTab
              href={feedHref}
              label={t("feed")}
              icon={Search}
              active={feedActive}
              pillOn={theme.navPillOn}
              textOn={theme.navTextOn}
            />
            <NavTab
              href="/my/bookings"
              label={t("bookings")}
              icon={Ticket}
              active={startsWith("/my") && !isChat}
              pillOn={theme.navPillOn}
              textOn={theme.navTextOn}
            />

            {/* Center amber create FAB */}
            <Link
              href={createHref}
              aria-label={isDriver ? t("publish_trip_aria") : t("create_request_aria")}
              className="relative -mt-8 flex shrink-0 flex-col items-center gap-1"
            >
              <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-accent-ink shadow-cta ring-4 ring-white dark:ring-ink-900">
                <Plus className="h-7 w-7" strokeWidth={2.6} aria-hidden="true" />
              </span>
              <span className="text-[10px] font-900 text-accent-600">{t("publish")}</span>
            </Link>

            <NavTab
              href="/my/bookings"
              label={t("chats")}
              icon={MessageCircle}
              active={isChat}
              pillOn={theme.navPillOn}
              textOn={theme.navTextOn}
              badge={unreadMessages}
            />
            <NavTab
              href="/profile"
              label={t("profile")}
              icon={User}
              active={startsWith("/profile")}
              pillOn={theme.navPillOn}
              textOn={theme.navTextOn}
            />
          </>
        ) : (
          <>
            <NavTab
              href="/trips"
              label={t("feed")}
              icon={Search}
              active={feedActive}
              pillOn={theme.navPillOn}
              textOn={theme.navTextOn}
            />
            <NavTab
              href="/auth/login"
              label={t("login")}
              icon={LogIn}
              active={startsWith("/auth")}
              pillOn={theme.navPillOn}
              textOn={theme.navTextOn}
            />
          </>
        )}
      </div>
    </nav>
  );
}
