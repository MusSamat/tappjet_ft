"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Clock } from "lucide-react";
import { getRecentRoutes, type RecentRoute } from "@/lib/recent-routes";
import { PopularRoutes } from "./popular-routes";

// Body shown in the unified feed BEFORE a route is chosen — the search header
// stays put; only this content swaps to result cards once both cities are set.
// Recent searches + popular routes are one-tap route pickers (stay on the page).
export function FeedEntryHints({ onPick }: { onPick: (from: string, to: string) => void }) {
  const t = useTranslations("feed");
  const [recent, setRecent] = useState<RecentRoute[]>([]);
  useEffect(() => setRecent(getRecentRoutes()), []);

  return (
    <div className="pt-1">
      <p className="mb-4 text-[14px] font-700 text-ink-500 dark:text-ink-400">{t("route_hint")}</p>

      {recent.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-[13px] font-800 text-ink-500 dark:text-ink-400">{t("recent_searches")}</p>
          <div className="flex flex-col gap-2">
            {recent.map((r, i) => (
              <button
                key={`${r.from}-${r.to}-${i}`}
                type="button"
                onClick={() => onPick(r.from, r.to)}
                className="flex items-center gap-2.5 rounded-2xl border border-ink-200 bg-white p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-500/40"
              >
                <Clock className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-[14px] font-800 text-ink-900 dark:text-white">
                  {r.from} <span className="text-ink-400">→</span> {r.to}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      <PopularRoutes onPick={onPick} />
    </div>
  );
}
