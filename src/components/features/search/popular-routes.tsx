"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPopularRoutes } from "@/lib/api/cities";

export function PopularRoutes() {
  const { data: routes } = useQuery({
    queryKey: ["popular-routes"],
    queryFn: getPopularRoutes,
    staleTime: 5 * 60_000,
  });

  if (!routes || routes.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-brand-600" aria-hidden="true" />
        <p className="text-[13px] font-bold text-ink-700 dark:text-ink-300">Популярные маршруты</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {routes.map((r) => (
          <Link
            key={`${r.from}-${r.to}`}
            href={`/trips?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`}
            className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-[12px] font-semibold text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300"
          >
            <span>{r.from}</span>
            <ArrowRight className="h-3 w-3 text-ink-400" aria-hidden="true" />
            <span>{r.to}</span>
            {r.tripCount > 0 && (
              <span className="ml-1 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                {r.tripCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
