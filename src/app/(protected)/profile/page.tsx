"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Award, ChevronRight, Settings, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { logout } from "@/lib/api/auth";
import { exportData } from "@/lib/api/profile";
import { getUserRatings } from "@/lib/api/users";
import { getDriverStats } from "@/lib/api/drivers";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { AvatarUploader } from "@/components/features/profile/avatar-uploader";
import { RoleSwitcher } from "@/components/features/role-mode/role-switcher";
import { Container, RatingStars } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import { LoyaltyTierBadge } from "./_components/loyalty-tier-badge";
import { StatBlock } from "./_components/stat-block";
import { ReviewCard, ReviewCardSkeleton } from "./_components/review-card";
import { ProfileCompletion } from "./_components/profile-completion";
import { SettingsTab } from "./_components/settings-tab";

type Tab = "about" | "reviews" | "history" | "settings";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const user = useAuth((s) => s.user);
  const clearSession = useAuth((s) => s.clearSession);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("about");

  const tierLabel = (tier: string) =>
    tier === "novice" ? t("tier_novice") :
    tier === "traveler" ? t("tier_traveler") :
    tier === "expert" ? t("tier_expert") :
    tier === "elite" ? t("tier_elite") : tier;

  const { data: ratingsData, isLoading: ratingsLoading } = useQuery({
    queryKey: ["ratings", user?.id],
    queryFn: () => getUserRatings(user!.id!, undefined, 20),
    enabled: !!user?.id && (tab === "about" || tab === "reviews"),
    staleTime: 60_000,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearSession();
      router.replace("/");
    },
  });

  const exportMutation = useMutation({
    mutationFn: exportData,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tappjet-data.json";
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const isDriver = user?.roles?.includes("driver");

  const { data: driverStats } = useQuery({
    queryKey: ["driver", "stats"],
    queryFn: getDriverStats,
    enabled: !!isDriver && tab === "about",
    staleTime: 120_000,
  });

  const joinYear = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : null;

  return (
    <Container className="py-8">
      <div className="mb-4 rounded-2xl border-[0.5px] border-gray-200 bg-white p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          <AvatarUploader />

          <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-extrabold text-gray-900">{user?.name}</h1>
              {user?.phoneVerified && (
                <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700">
                  <Shield className="h-3 w-3" aria-hidden="true" />
                  {t("verified_badge")}
                </span>
              )}
            </div>

            {user?.rating != null && (
              <div className="flex items-center gap-2">
                <RatingStars value={user.rating} />
                <span className="text-[14px] font-bold text-gray-700">{user.rating.toFixed(1)}</span>
                <span className="text-[13px] text-gray-400">{t("rating_count", { n: user.ratingCount })}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {user?.phoneVerified && (
                <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                  {t("badge_phone")}
                </span>
              )}
              {isDriver && (
                <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                  {t("badge_driver")}
                </span>
              )}
              {user?.telegramLinked && (
                <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                  {t("badge_telegram")}
                </span>
              )}
              {joinYear && (
                <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                  {t("badge_since", { year: joinYear })}
                </span>
              )}
              {user?.loyaltyTier && user.loyaltyTier !== "novice" && (
                <LoyaltyTierBadge tier={user.loyaltyTier} />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTab("settings")}
            className="flex items-center gap-1.5 self-start rounded-xl border border-gray-200 px-3 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            {t("settings_btn")}
          </button>
        </div>
      </div>

      {isDriver && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border-[0.5px] border-gray-200 bg-white px-5 py-3 md:hidden">
          <span className="text-[13px] font-semibold text-gray-600">{t("mode_label")}</span>
          <RoleSwitcher />
        </div>
      )}

      <div className="tabs-scroll mb-4 flex overflow-x-auto border-b border-gray-200">
        {(["about", "reviews", "history", "settings"] as Tab[]).map((tabKey) => {
          const labels: Record<Tab, string> = {
            about: t("tab_about"),
            reviews: ratingsData ? t("tab_reviews_count", { n: ratingsData.data.length }) : t("tab_reviews"),
            history: t("tab_history"),
            settings: t("tab_settings"),
          };
          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => setTab(tabKey)}
              className={cn(
                "flex-shrink-0 border-b-2 px-4 py-2.5 text-[13px] font-bold transition-colors",
                tab === tabKey
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              {labels[tabKey]}
            </button>
          );
        })}
      </div>

      {tab === "about" && (
        <div className="flex flex-col gap-4">
          <ProfileCompletion user={user} isDriver={!!isDriver} />
          <div className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-[15px] font-extrabold text-gray-900">{t("stats_title")}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatBlock value={user?.rating != null ? user.rating.toFixed(1) : "—"} label={t("stat_rating")} />
              <StatBlock value={String(user?.ratingCount ?? 0)} label={t("stat_reviews")} />
              <StatBlock value={String(user?.loyaltyPoints ?? 0)} label={t("stat_points")} />
              {user?.loyaltyTier && <StatBlock value={tierLabel(user.loyaltyTier)} label={t("stat_tier")} />}
            </div>
            <Link
              href="/loyalty"
              className="mt-4 flex items-center justify-center gap-1 text-[12px] font-bold text-teal-600 hover:text-teal-700"
            >
              <Award className="h-3.5 w-3.5" aria-hidden="true" />
              {t("loyalty_link")}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {isDriver && driverStats && (
            <div className="rounded-2xl border-[0.5px] border-sky-200 bg-sky-50 p-5">
              <h2 className="mb-4 text-[15px] font-extrabold text-gray-900">{t("driver_stats_title")}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatBlock value={String(driverStats.totalTrips)} label={t("driver_stat_trips")} />
                <StatBlock
                  value={driverStats.rating != null ? driverStats.rating.toFixed(1) : "—"}
                  label={t("driver_stat_rating")}
                />
                <StatBlock value={String(driverStats.ratingCount)} label={t("driver_stat_reviews")} />
                <StatBlock value={String(driverStats.cancellations30d)} label={t("driver_stat_cancels")} />
              </div>
            </div>
          )}

          <div className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-[15px] font-extrabold text-gray-900">{t("bio_title")}</h2>
            <p className="text-[14px] leading-relaxed text-gray-700">
              {(user as { bio?: string | null } | null)?.bio || t("bio_placeholder")}
            </p>
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <div className="flex flex-col gap-3">
          {ratingsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={i} />)
          ) : ratingsData?.data.length === 0 ? (
            <div className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-10 text-center">
              <p className="text-[17px] font-bold text-gray-900">{t("no_reviews")}</p>
              <p className="mt-2 text-[13px] text-gray-500">{t("no_reviews_hint")}</p>
            </div>
          ) : (
            ratingsData?.data.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-10 text-center">
          <p className="text-[13px] font-semibold text-gray-500">
            {t("history_hint")}
          </p>
        </div>
      )}

      {tab === "settings" && (
        <SettingsTab
          isDriver={!!isDriver}
          exportMutation={exportMutation}
          logoutMutation={logoutMutation}
        />
      )}
    </Container>
  );
}
