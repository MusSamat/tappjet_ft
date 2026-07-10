"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getPopularRoutes } from "@/lib/api/cities";

interface Props {
  /** When set, tapping a route calls this (stay on the same page) instead of
   *  navigating to /trips. Used inside the unified feed's entry state. */
  onPick?: (from: string, to: string) => void;
}

export function PopularRoutes({ onPick }: Props) {
  const t = useTranslations("landing");
  const { data: routes } = useQuery({
    queryKey: ["popular-routes"],
    queryFn: getPopularRoutes,
    staleTime: 5 * 60_000,
  });

  if (!routes || routes.length === 0) return null;

  const cls =
    "flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[16px] font-bold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300";

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-brand-600" aria-hidden="true" />
        <p className="text-[17px] font-900 text-ink-800 dark:text-ink-200">{t("popular_routes")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {routes.map((r) => {
          const inner = (
            <>
              <span>{r.from}</span>
              <ArrowRight className="h-3 w-3 text-ink-400" aria-hidden="true" />
              <span>{r.to}</span>
              {r.tripCount > 0 && (
                <span className="ml-1 rounded-full bg-brand-100 px-2 py-0.5 text-[12px] font-bold text-brand-700">
                  {r.tripCount}
                </span>
              )}
            </>
          );
          return onPick ? (
            <button key={`${r.from}-${r.to}`} type="button" onClick={() => onPick(r.from, r.to)} className={cls}>
              {inner}
            </button>
          ) : (
            <Link
              key={`${r.from}-${r.to}`}
              href={`/trips?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`}
              className={cls}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
