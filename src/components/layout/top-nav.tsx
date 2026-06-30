"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { Bell, Plus, LogOut, User, BookOpen, Users } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { logout } from "@/lib/api/auth";
import { useAuth } from "@/store/auth";
import { useUnreadCount } from "@/lib/hooks/use-unread-count";
import { useRoleColors } from "@/lib/hooks/use-role-colors";
import { RoleSwitcher } from "@/components/features/role-mode/role-switcher";
import { cn } from "@/lib/utils/cn";

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-amber-500 px-0.5 text-[10px] font-extrabold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function UserDropdown({ onClose }: { onClose: () => void }) {
  const t = useTranslations("top_nav");
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const clearSession = useAuth((s) => s.clearSession);
  const activeMode = useAuth((s) => s.activeMode);
  const colors = useRoleColors();

  const logoutMut = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearSession();
      router.replace("/");
      onClose();
    },
  });

  const links = [
    { href: "/profile",     label: t("profile_link"), icon: User },
    { href: "/my/bookings", label: t("my_trips"),      icon: BookOpen },
    ...(activeMode === "passenger" ? [{ href: "/my/requests", label: t("my_requests"), icon: Users }] : []),
  ];

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xl">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="truncate text-[14px] font-bold text-gray-900">{user?.name}</p>
        <p className="truncate text-[11px] text-gray-400">{user?.phone}</p>
        <p className={cn("mt-0.5 text-[11px] font-medium", colors.navActive)}>
          {activeMode === "driver" ? t("driver_label") : t("passenger_label")}
        </p>
      </div>

      {user?.roles?.includes("driver") && (
        <div className="flex justify-center border-b border-gray-100 px-4 py-2.5">
          <RoleSwitcher />
        </div>
      )}

      <div className="py-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href + label}
            href={href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>

      <div className="border-t border-gray-100 py-1">
        <button
          type="button"
          onClick={() => logoutMut.mutate()}
          disabled={logoutMut.isPending}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {logoutMut.isPending ? t("logging_out") : t("logout")}
        </button>
      </div>
    </div>
  );
}

export function TopNav() {
  const t = useTranslations("top_nav");
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.status === "authenticated");
  const activeMode = useAuth((s) => s.activeMode);
  const { data: unread = 0 } = useUnreadCount();
  const colors = useRoleColors();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [dropOpen]);

  useEffect(() => { setDropOpen(false); }, [pathname]);

  const navLinks = isAuthenticated
    ? [
        { href: "/trips", label: t("find_trip") },
        ...(activeMode === "driver"
          ? [{ href: "/requests", label: t("passenger_requests") }]
          : [{ href: "/my/requests", label: t("my_requests") }]),
        { href: "/my/bookings", label: t("my_trips") },
      ]
    : [
        { href: "/trips",    label: t("trips") },
        { href: "/requests", label: t("requests") },
      ];

  const avatarInitials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => { setAvatarFailed(false); }, [user?.avatarUrl]);

  return (
    <header
      className="sticky top-0 z-40 hidden border-b border-gray-200 bg-white md:block"
      style={{ height: 64 }}
    >
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-6 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-500">
            <span className="text-[14px] font-black text-white">Tj</span>
          </div>
          <span className="text-[18px] font-black tracking-tight text-gray-900">Tappjet</span>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-1 items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-[14px] font-bold transition-colors",
                  active ? colors.navActivePill : "text-gray-700 hover:bg-gray-100",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {activeMode === "driver" ? (
                <Link
                  href="/trips/create"
                  className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-[14px] font-bold text-white hover:bg-sky-600"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t("publish_btn")}
                </Link>
              ) : (
                <Link
                  href="/requests/create"
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-[14px] font-bold text-[#4A2C00] hover:bg-amber-600"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t("create_request_btn")}
                </Link>
              )}

              <Link
                href="/notifications"
                aria-label={t("notifications_aria")}
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <Bell className="h-5 w-5 text-gray-700" aria-hidden="true" />
                <UnreadBadge count={unread} />
              </Link>

              {/* User avatar + dropdown */}
              <div className="relative" ref={dropRef}>
                <button
                  type="button"
                  onClick={() => setDropOpen((o) => !o)}
                  aria-label={t("user_menu_aria")}
                  aria-expanded={dropOpen}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-[13px] font-bold transition-colors ring-2",
                    dropOpen ? colors.avatarRingOn : colors.avatarRingOff,
                  )}
                >
                  {user?.avatarUrl && !avatarFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt={user.name ?? t("avatar_alt")}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarFailed(true)}
                    />
                  ) : (
                    <span className={cn(
                      "flex h-full w-full items-center justify-center",
                      dropOpen ? colors.avatarBgOn : colors.avatarBgOff,
                    )}>
                      {avatarInitials}
                    </span>
                  )}
                </button>
                {dropOpen && <UserDropdown onClose={() => setDropOpen(false)} />}
              </div>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-xl bg-teal-600 px-5 py-2 text-[14px] font-bold text-white hover:bg-teal-700"
            >
              {t("sign_in_btn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
