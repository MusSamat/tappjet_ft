"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Award } from "lucide-react";
import { getLoyaltyStatus, getLoyaltyTransactions } from "@/lib/api/loyalty";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { Container, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

const TIERS = ["novice", "traveler", "expert", "elite"] as const;
type Tier = (typeof TIERS)[number];

const TIER_COLORS: Record<Tier, {
  textColor: string;
  bgColor: string;
  ringColor: string;
  progressBg: string;
  borderColor: string;
}> = {
  novice:   { textColor: "text-gray-600",   bgColor: "bg-gray-100",   ringColor: "ring-gray-400",   progressBg: "bg-gray-500",   borderColor: "border-gray-200"   },
  traveler: { textColor: "text-sky-700",   bgColor: "bg-sky-50",    ringColor: "ring-sky-400",   progressBg: "bg-sky-600",   borderColor: "border-sky-200"   },
  expert:   { textColor: "text-purple-700", bgColor: "bg-purple-50",  ringColor: "ring-purple-400", progressBg: "bg-purple-600", borderColor: "border-purple-200" },
  elite:    { textColor: "text-amber-700",  bgColor: "bg-amber-50",   ringColor: "ring-amber-400",  progressBg: "bg-amber-500",  borderColor: "border-amber-200"  },
};

const HOW_TO_EARN_ICONS = ["🚗", "🎯", "⭐"] as const;
const HOW_TO_EARN_POINTS = ["+10", "+5", "+3"] as const;

export default function LoyaltyPage() {
  const t = useTranslations("loyalty");

  const sourceLabels: Record<string, string> = {
    trip_completed: t("sources.trip_completed"),
    bonus:          t("sources.bonus"),
    manual:         t("sources.manual"),
    referral:       t("sources.referral"),
  };
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["loyalty", "status"],
    queryFn: getLoyaltyStatus,
    staleTime: 60_000,
  });

  const txQuery = useInfiniteQuery({
    queryKey: ["loyalty", "transactions"],
    queryFn: ({ pageParam }) => getLoyaltyTransactions(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 60_000,
  });

  const sentinel = useInfiniteScroll({
    hasNextPage: txQuery.hasNextPage,
    isFetchingNextPage: txQuery.isFetchingNextPage,
    fetchNextPage: txQuery.fetchNextPage,
  });

  const transactions = txQuery.data?.pages.flatMap((p) => p.data) ?? [];
  const tier = (status?.tier ?? "novice") as Tier;
  const cfg = TIER_COLORS[tier];
  const tierIndex = TIERS.indexOf(tier);
  const progress = status
    ? status.pointsToNextTier != null
      ? Math.round((status.points / (status.points + status.pointsToNextTier)) * 100)
      : 100
    : 0;

  return (
    <Container className="py-6 sm:py-8">
      <h1 className="mb-5 text-[22px] font-extrabold text-gray-900 sm:text-[26px]">
        {t("title")}
      </h1>

      {statusLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : (
        <>
          {/* ── Status card ── */}
          <div className={cn("mb-4 rounded-2xl border p-6", cfg.bgColor, cfg.borderColor)}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Award className={cn("h-5 w-5", cfg.textColor)} aria-hidden="true" />
                  <span className={cn("text-[12px] font-bold uppercase tracking-widest", cfg.textColor)}>
                    {t(`tiers.${tier}`)}
                  </span>
                </div>
                <p className="mt-2 leading-none">
                  <span className="text-[40px] font-extrabold text-gray-900">{status?.points ?? 0}</span>
                  <span className="ml-2 text-[16px] font-semibold text-gray-500">{t("points_suffix")}</span>
                </p>
              </div>
            </div>

            {status?.nextTier && status.pointsToNextTier != null && (
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-[12px] font-semibold">
                  <span className="text-gray-600">
                    {t("to_next_tier", { tier: t(`tiers.${status.nextTier as Tier}`) })}
                  </span>
                  <span className={cfg.textColor}>{t("points_remaining", { n: status.pointsToNextTier })}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/60">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", cfg.progressBg)}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {!status?.nextTier && (
              <p className={cn("mt-4 text-[13px] font-bold", cfg.textColor)}>
                {t("max_tier_reached")}
              </p>
            )}
          </div>

          {/* ── Tier roadmap ── */}
          <div className="mb-4 rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="mb-5 text-[15px] font-extrabold text-gray-900">{t("tiers_section")}</h2>
            <div className="relative flex items-start">
              {/* Track line */}
              <div className="absolute left-[18px] right-[18px] top-[18px] h-0.5 bg-gray-200" />
              {tierIndex > 0 && (
                <div
                  className="absolute left-[18px] top-[18px] h-0.5 bg-teal-400 transition-all duration-700"
                  style={{ width: `calc(${(tierIndex / (TIERS.length - 1)) * 100}% - 0px)` }}
                />
              )}

              {TIERS.map((tierKey, i) => {
                const tcfg = TIER_COLORS[tierKey];
                const isActive = tierKey === tier;
                const isDone = i < tierIndex;
                return (
                  <div key={tierKey} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full ring-2",
                      isDone  ? "bg-teal-500 ring-teal-300" :
                      isActive ? cn(tcfg.bgColor, tcfg.ringColor) :
                                 "bg-white ring-gray-200",
                    )}>
                      <Award className={cn(
                        "h-4 w-4",
                        isDone   ? "text-white" :
                        isActive ? tcfg.textColor :
                                   "text-gray-300",
                      )} aria-hidden="true" />
                    </div>
                    <span className={cn(
                      "text-center text-[10px] font-bold leading-tight",
                      isDone   ? "text-teal-700" :
                      isActive ? tcfg.textColor :
                                 "text-gray-400",
                    )}>
                      {t(`tiers.${tierKey}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── How to earn ── */}
          <div className="mb-4 rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="mb-4 text-[15px] font-extrabold text-gray-900">{t("how_to_earn_section")}</h2>
            <div className="flex flex-col divide-y divide-gray-100">
              {(["driver", "passenger", "five_stars"] as const).map((key, idx) => (
                <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[20px]" aria-hidden="true">{HOW_TO_EARN_ICONS[idx]}</span>
                    <span className="text-[13px] font-semibold text-gray-700">{t(`earn.${key}`)}</span>
                  </div>
                  <span className="text-[14px] font-extrabold text-teal-700">{HOW_TO_EARN_POINTS[idx]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Transaction history ── */}
          <div className="rounded-2xl border border-ink-100 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-[15px] font-extrabold text-gray-900">{t("history_section")}</h2>
            </div>

            {txQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner size={20} />
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[14px] font-semibold text-gray-600">{t("empty_title")}</p>
                <p className="mt-1 text-[12px] text-gray-400">{t("empty_hint")}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-gray-900">
                        {sourceLabels[tx.source] ?? tx.source}
                      </p>
                      {tx.note && (
                        <p className="truncate text-[11px] text-gray-500">{tx.note}</p>
                      )}
                      <p className="text-[11px] text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString("ru-RU", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={cn(
                      "ml-3 flex-shrink-0 text-[16px] font-extrabold",
                      tx.points > 0 ? "text-teal-600" : "text-coral-500",
                    )}>
                      {tx.points > 0 ? "+" : ""}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {txQuery.isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <Spinner size={16} />
              </div>
            )}
            <div ref={sentinel} />
          </div>
        </>
      )}
    </Container>
  );
}
