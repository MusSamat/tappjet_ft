"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  CarFront,
  ChevronRight,
  Gift,
  History,
  Quote,
  Settings,
  Smartphone,
  Star,
  User as UserIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { logout, logoutAll } from "@/lib/api/auth";
import { exportData, getDriverStatus } from "@/lib/api/profile";
import { getLoyaltyStatus } from "@/lib/api/loyalty";
import { getUserRatings } from "@/lib/api/users";
import { extractError } from "@/lib/api/client";
import { useFriendlyError } from "@/lib/hooks/use-api-error";
import { toastSuccess, toastError } from "@/components/layout/quick-toast";
import { QueryError } from "@/components/ui/query-error";
import { BackButton } from "@/components/ui/back-button";
import { SettingsCard } from "./_components/settings-card";
import { useAuth } from "@/store/auth";
import { useRoleTheme } from "@/lib/hooks/use-role-colors";
import { AvatarUploader } from "@/components/features/profile/avatar-uploader";
import { AddPhoneModal } from "@/components/features/auth/add-phone-modal";
import { cn } from "@/lib/utils/cn";
import { ReviewCard, ReviewCardSkeleton } from "./_components/review-card";
import { ProfileCompletion } from "./_components/profile-completion";
import { SettingsTab } from "./_components/settings-tab";
import { CarsTab } from "./_components/cars-tab";
import { HistoryTab } from "./_components/history-tab";
import { CarFront as CarFrontIcon } from "lucide-react";

type Tab = "about" | "cars" | "reviews" | "history" | "settings";

const FAB_TINT: Record<string, string> = {
  driver: "bg-brand-600",
  passenger: "bg-grape-600",
  guest: "bg-ink-600",
};

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tToasts = useTranslations("toasts");
  const fe = useFriendlyError();
  const { role, theme } = useRoleTheme();
  const user = useAuth((s) => s.user);
  const clearSession = useAuth((s) => s.clearSession);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("about");
  const [showAddPhone, setShowAddPhone] = useState(false);

  // On mobile, История / Настройки open as full sub-pages (back → about) so the
  // pill row carries only the 3 content sections and never overflows.
  const isSubPage = tab === "history" || tab === "settings";
  const isDriver = !!user?.roles?.includes("driver");
  const joinYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : null;
  const fabClass = FAB_TINT[role] ?? FAB_TINT.passenger;

  const ratingsQuery = useQuery({
    queryKey: ["ratings", user?.id],
    queryFn: () => getUserRatings(user!.id!, undefined, 20),
    enabled: !!user?.id && (tab === "about" || tab === "reviews"),
    staleTime: 60_000,
  });
  const { data: ratingsData, isLoading: ratingsLoading } = ratingsQuery;

  const { data: loyalty } = useQuery({
    queryKey: ["loyalty-status"],
    queryFn: getLoyaltyStatus,
    enabled: !!user,
    staleTime: 60_000,
  });
  const { data: driverStatus } = useQuery({
    queryKey: ["driver-status"],
    queryFn: getDriverStatus,
    enabled: isDriver,
    staleTime: 60_000,
  });
  const driverVerified = driverStatus?.status === "verified";

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearSession();
      router.replace("/");
    },
    onError: (e) => toastError(fe(extractError(e))),
  });

  const logoutAllMutation = useMutation({
    mutationFn: logoutAll,
    onSuccess: () => {
      clearSession();
      toastSuccess(tToasts("logout_all"));
      router.replace("/");
    },
    onError: (e) => toastError(fe(extractError(e))),
  });

  const exportMutation = useMutation({
    mutationFn: exportData,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "terme-data.json";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (e) => toastError(fe(extractError(e))),
  });

  const points = loyalty?.points ?? 0;
  const bio = (user as { bio?: string | null } | null)?.bio;


  const tabLabel: Record<Tab, string> = {
    about: t("tab_about"),
    cars: t("tab_cars"),
    reviews: ratingsData ? t("tab_reviews_count", { n: ratingsData.data.length }) : t("tab_reviews"),
    history: t("tab_history"),
    settings: t("tab_settings"),
  };


  const aboutContent = (
    <div className="space-y-3.5">

      {!isDriver && (
        <Link
          href="/profile/driver"
          className="flex w-full items-center gap-3 rounded-3xl bg-grape-600 px-4 py-3.5 text-white shadow-indigocta"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <CarFront className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-900">{t("become_driver_title")}</span>
            <span className="block text-[14px] font-600 text-white/80">{t("become_driver_sub")}</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
        </Link>
      )}

      <ProfileCompletion user={user} isDriver={isDriver} />

      {/* Bio */}
      <div className="rounded-3xl bg-white p-4 shadow-card dark:bg-ink-900">
        <div className="mb-2 flex items-center gap-2">
          <Quote className="h-4 w-4 text-brand-600" aria-hidden="true" />
          <span className="text-[14px] font-900 text-ink-900 dark:text-white">{t("bio_title")}</span>
        </div>
        <p className="text-[15px] font-600 leading-relaxed text-ink-500 dark:text-ink-400">
          {bio || t("bio_placeholder")}
        </p>
      </div>

      {/* Quick links */}
      <div className="divide-y divide-ink-100 overflow-hidden rounded-3xl bg-white shadow-card dark:divide-ink-800 dark:bg-ink-900">
        <Link href="/loyalty" className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-500/15">
            <Gift className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex-1 text-[15px] font-700 text-ink-800 dark:text-ink-100">{t("quick_bonuses")}</span>
          <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[12px] font-900 text-accent-700 dark:bg-accent-500/15">
            {points}
          </span>
          <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );

  const reviewsContent = (
    <div className="flex flex-col gap-3">
      {ratingsLoading ? (
        Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={i} />)
      ) : ratingsQuery.isError ? (
        <QueryError error={ratingsQuery.error} onRetry={() => void ratingsQuery.refetch()} />
      ) : ratingsData?.data.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-card dark:bg-ink-900">
          <p className="text-[18px] font-900 text-ink-900 dark:text-white">{t("no_reviews")}</p>
          <p className="mt-2 text-[15px] font-medium text-ink-500">{t("no_reviews_hint")}</p>
        </div>
      ) : (
        ratingsData?.data.map((r) => <ReviewCard key={r.id} review={r} />)
      )}
    </div>
  );

  const historyContent = <HistoryTab />;

  const settingsContent = (
    <SettingsTab
      isDriver={isDriver}
      exportMutation={exportMutation}
      logoutMutation={logoutMutation}
      logoutAllMutation={logoutAllMutation}
    />
  );

  const content: Record<Tab, ReactNode> = {
    about: aboutContent,
    cars: <CarsTab />,
    reviews: reviewsContent,
    history: historyContent,
    settings: settingsContent,
  };

  const statStrip = (
    <div className="mt-3 flex items-stretch rounded-2xl bg-ink-50 py-2.5 dark:bg-ink-800/60">
      <div className="flex flex-1 flex-col items-center">
        <span className="text-[17px] font-900 leading-none text-ink-900 dark:text-white">{user?.ratingCount ?? 0}</span>
        <span className="mt-1 text-[13px] font-600 text-ink-400">{t("stat_reviews")}</span>
      </div>
      <span className="w-px bg-ink-200 dark:bg-ink-700" />
      <div className="flex flex-1 flex-col items-center">
        <span className="text-[17px] font-900 leading-none text-accent-600">
          {user?.rating != null ? user.rating.toFixed(1) : "—"}
        </span>
        <span className="mt-1 text-[13px] font-600 text-ink-400">{t("stat_rating")}</span>
      </div>
      <span className="w-px bg-ink-200 dark:bg-ink-700" />
      <div className="flex flex-1 flex-col items-center">
        <span className="text-[17px] font-900 leading-none text-coral-500">{points}</span>
        <span className="mt-1 text-[13px] font-600 text-ink-400">{t("stat_points")}</span>
      </div>
    </div>
  );

  const trustChips = (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {user?.phoneVerified && (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-800 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          <Smartphone className="h-3 w-3" aria-hidden="true" />
          {t("chip_phone")}
        </span>
      )}
      {driverVerified && (
        <>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-800 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
            {t("chip_docs")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-800 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            <CarFront className="h-3 w-3" aria-hidden="true" />
            {t("chip_car")}
          </span>
        </>
      )}
      {user?.telegramLinked && (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-800 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          {t("chip_telegram")}
        </span>
      )}
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-ink-50 dark:bg-ink-950">
      <div className="mx-auto w-full max-w-[760px] space-y-3.5 p-3.5 pt-11 md:p-6 lg:hidden">
        {isSubPage ? (
          <>
            {/* Sub-page (История / Настройки) — back arrow returns to profile */}
            <button
              type="button"
              onClick={() => setTab("about")}
              className="flex items-center gap-2 text-[20px] font-900 text-ink-900 dark:text-white"
            >
              <ArrowLeft className="h-6 w-6" aria-hidden="true" />
              {tabLabel[tab]}
            </button>
            {content[tab]}
          </>
        ) : (
          <>
            <BackButton />
            {!user?.phoneVerified && (
              <button
                type="button"
                onClick={() => setShowAddPhone(true)}
                className="flex w-full items-center justify-between rounded-2xl bg-accent-50 px-4 py-3 text-left ring-1 ring-accent-200 dark:bg-accent-500/10 dark:ring-accent-500/20"
              >
                <span>
                  <span className="block text-[14px] font-900 text-accent-700">{t("add_phone_title")}</span>
                  <span className="block text-[14px] font-600 text-accent-700/80">{t("add_phone_sub")}</span>
                </span>
                <span className="rounded-full bg-accent-500 px-3 py-1.5 text-[13px] font-900 text-accent-ink shadow-cta">
                  {t("add_phone_cta")}
                </span>
              </button>
            )}

            {/* Hero card */}
            <div className="rounded-4xl bg-white p-4 shadow-card dark:bg-ink-900">
              <div className="flex items-start gap-3">
                <AvatarUploader
                  sizeClass="h-16 w-16"
                  shapeClass="rounded-2xl"
                  tintClass={theme.avatarTint}
                  fabClass={fabClass}
                  fontClass="text-[21px]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h1 className="truncate text-[18px] font-900 text-ink-900 dark:text-white">{user?.name}</h1>
                    {isDriver && <BadgeCheck className="h-[18px] w-[18px] shrink-0 text-brand-600" aria-hidden="true" />}
                  </div>
                  <p className="mt-0.5 text-[14px] font-600 text-ink-400">
                    <span className="text-accent-600">
                      ★ {user?.rating != null ? user.rating.toFixed(1) : "—"}
                    </span>
                    {" · "}
                    {t("rating_count", { n: user?.ratingCount ?? 0 })}
                    {joinYear ? ` · ${t("badge_since", { year: joinYear })}` : ""}
                  </p>
                </div>
              </div>
              {trustChips}
              {statStrip}
            </div>

            {/* Content pills — 3 equal sections that fit (about · cars · reviews) */}
            <div className="flex gap-1.5">
              {(["about", "cars", "reviews"] as Tab[]).map((tk) => (
                <button
                  key={tk}
                  type="button"
                  onClick={() => setTab(tk)}
                  aria-pressed={tab === tk}
                  className={cn(
                    "min-h-[40px] flex-1 touch-manipulation whitespace-nowrap rounded-full px-3 text-[14px] transition duration-100 active:scale-[0.97]",
                    tab === tk
                      ? "bg-brand-600 font-900 text-white shadow-sm"
                      : "bg-white font-700 text-ink-600 ring-1 ring-ink-200 dark:bg-ink-900 dark:text-ink-300 dark:ring-ink-700",
                  )}
                >
                  {tabLabel[tk]}
                </button>
              ))}
            </div>

            {content[tab]}

            {/* Quick settings + menu list — История / Настройки open as sub-pages */}
            <SettingsCard />
            <div className="divide-y divide-ink-100 overflow-hidden rounded-3xl bg-white shadow-card dark:divide-ink-800 dark:bg-ink-900">
              <button type="button" onClick={() => setTab("history")} className="flex w-full items-center gap-3 px-4 py-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-500 dark:bg-ink-800">
                  <History className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="flex-1 text-left text-[15px] font-700 text-ink-800 dark:text-ink-100">{t("tab_history")}</span>
                <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setTab("settings")} className="flex w-full items-center gap-3 px-4 py-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-500 dark:bg-ink-800">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="flex-1 text-left text-[15px] font-700 text-ink-800 dark:text-ink-100">{t("tab_settings")}</span>
                <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Desktop — 2-col with vertical nav (§2.7) */}
      <div className="mx-auto hidden w-full max-w-[1080px] gap-6 p-6 lg:grid lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-4xl bg-white shadow-card ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
            <div className={cn("h-24", theme.bannerGrad)} />
            <div className="px-5 pb-5">
              <div className="-mt-12 mb-3">
                <div className="inline-block rounded-3xl ring-4 ring-white dark:ring-ink-900">
                  <AvatarUploader
                    sizeClass="h-24 w-24"
                    shapeClass="rounded-3xl"
                    tintClass={theme.avatarTint}
                    fabClass={fabClass}
                    fontClass="text-[30px]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[21px] font-900 text-ink-900 dark:text-white">{user?.name}</h1>
                {isDriver && <BadgeCheck className="h-[22px] w-[22px] text-brand-600" aria-hidden="true" />}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1 text-[12px] font-800 text-accent-700 dark:bg-accent-500/15">
                  <Star className="h-3 w-3 fill-accent-400 text-accent-400" aria-hidden="true" />
                  {user?.rating != null ? user.rating.toFixed(1) : "—"}
                </span>
                {user?.phoneVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-800 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                    <Smartphone className="h-3 w-3" aria-hidden="true" />
                    {t("chip_verified")}
                  </span>
                )}
                {joinYear && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-[12px] font-800 text-ink-500 dark:bg-ink-800">
                    {t("badge_since", { year: joinYear })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1 rounded-3xl bg-white p-2 shadow-card dark:bg-ink-900">
            {(
              [
                { key: "about", label: t("tab_about"), icon: UserIcon },
                { key: "cars", label: t("tab_cars"), icon: CarFrontIcon },
                { key: "reviews", label: t("tab_reviews"), icon: Star },
                { key: "history", label: t("nav_history"), icon: History },
                { key: "settings", label: t("nav_settings"), icon: null },
              ] as { key: Tab; label: string; icon: typeof UserIcon | null }[]
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-800 transition-colors",
                  tab === key
                    ? cn(theme.navPillOn, theme.textOn)
                    : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800",
                )}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                {label}
              </button>
            ))}
          </nav>

          {/* Quick settings — same language & theme card as on mobile */}
          <SettingsCard />
        </aside>

        <section className="space-y-3.5">
          <h2 className="text-[20px] font-900 text-ink-900 dark:text-white">{tabLabel[tab]}</h2>
          {content[tab]}
        </section>
      </div>

      <AddPhoneModal open={showAddPhone} onClose={() => setShowAddPhone(false)} />
    </div>
  );
}
