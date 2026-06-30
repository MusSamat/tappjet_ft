"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, BookOpen, User, Hand } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { listIncomingBookings } from "@/lib/api/bookings";
import { useUnreadCount } from "@/lib/hooks/use-unread-count";
import { useRoleColors } from "@/lib/hooks/use-role-colors";
import { useAuth } from "@/store/auth";
import { DriverAvatar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.status === "authenticated");
  const activeMode = useAuth((s) => s.activeMode);
  const isDriver = activeMode === "driver";
  const { data: unread = 0 } = useUnreadCount();
  const colors = useRoleColors();

  const { data: incomingData } = useQuery({
    queryKey: ["bookings", "incoming", "bottom-nav"],
    queryFn: () => listIncomingBookings(undefined, undefined, 50),
    enabled: isAuthenticated && isDriver,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });
  const pendingCount = isDriver
    ? (incomingData?.data ?? []).filter((b) => b.status === "pending" || b.status === "viewed").length
    : 0;

  const active = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-100 bg-white md:hidden"
      style={{ height: "calc(64px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label={t("main_nav_aria")}
    >
      <div className="grid h-full grid-cols-5">

        {/* Home */}
        <NavItem href="/" label={t("home")} icon={Home} active={active("/", true)} activeClass={colors.navActive} />

        {/* Browse — role-aware: driver looks for requests, passenger for trips */}
        <NavItem
          href={isDriver ? "/requests" : "/trips"}
          label={isDriver ? t("requests") : t("search")}
          icon={isDriver ? Hand : Search}
          active={isDriver ? active("/requests") : active("/trips")}
          activeClass={colors.navActive}
        />

        {/* Publish FAB */}
        <Link
          href={isDriver ? "/trips/create" : isAuthenticated ? "/requests/create" : "/auth/login"}
          aria-label={isDriver ? t("publish_trip_aria") : isAuthenticated ? t("create_request_aria") : t("login_aria")}
          className="flex flex-col items-center justify-center"
        >
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl shadow-md transition-colors",
              isDriver
                ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white"
                : isAuthenticated
                  ? "bg-gradient-to-br from-grape-400 to-grape-600 text-white"
                  : "bg-ink-100 text-ink-400",
            )}
            style={{ marginTop: "-10px" }}
          >
            {isDriver || !isAuthenticated ? (
              <Plus className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Hand className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
          <span className={cn(
            "mt-0.5 text-[10px] font-bold",
            isDriver ? "text-brand-600" : isAuthenticated ? "text-grape-600" : "text-ink-400",
          )}>
            {isDriver ? t("publish") : isAuthenticated ? t("create_request") : t("login")}
          </span>
        </Link>

        {/* My bookings / Browse requests */}
        {isAuthenticated ? (
          <Link
            href="/my/bookings"
            className={cn(
              "relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 transition-colors",
              active("/my/bookings") ? colors.navActive : "text-ink-400 hover:text-ink-600",
            )}
          >
            <BookOpen className="h-6 w-6" aria-hidden="true" />
            <span className="text-[10px] font-semibold">{t("bookings")}</span>
            {isDriver && pendingCount > 0 && (
              <span className="absolute right-3 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-0.5 text-[9px] font-extrabold text-white">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </Link>
        ) : (
          <Link
            href="/trips"
            className={cn(
              "relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 transition-colors",
              active("/trips") ? colors.navActive : "text-ink-400 hover:text-ink-600",
            )}
          >
            <Search className="h-6 w-6" aria-hidden="true" />
            <span className="text-[10px] font-semibold">{t("requests")}</span>
          </Link>
        )}

        {/* Profile — always labelled "Профиль"; mode shown as dot on avatar */}
        <Link
          href={isAuthenticated ? "/profile" : "/auth/login"}
          className={cn(
            "relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 transition-colors",
            active("/profile") ? colors.navActive : "text-ink-400 hover:text-ink-600",
          )}
        >
          {isAuthenticated ? (
            <>
              <span className={cn(
                "relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full ring-2 transition-colors",
                active("/profile") ? colors.profileRing : "ring-ink-200",
              )}>
                <DriverAvatar name={user?.name ?? "?"} src={user?.avatarUrl ?? null} size="sm" />
                {/* Mode indicator dot */}
                <span className={cn(
                  "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
                  isDriver ? "bg-brand-500" : "bg-grape-500",
                )} />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border border-white bg-accent-500 px-0.5 text-[8px] font-extrabold leading-none text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold">{t("profile")}</span>
            </>
          ) : (
            <>
              <User className="h-6 w-6" aria-hidden="true" />
              <span className="text-[10px] font-semibold">{t("login")}</span>
            </>
          )}
        </Link>

      </div>
    </nav>
  );
}

function NavItem({
  href, label, icon: Icon, active, activeClass,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  activeClass: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 transition-colors",
        active ? activeClass : "text-ink-400 hover:text-ink-600",
      )}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
      <span className="text-[10px] font-semibold">{label}</span>
    </Link>
  );
}
