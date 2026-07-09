"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useCalendarCounts } from "@/lib/hooks/use-calendar-counts";
import { cn } from "@/lib/utils/cn";

// Floating date stepper: ‹ 12 июл · 3 › — the arrows jump to the nearest
// PREVIOUS/NEXT calendar day that actually has trips/requests on this route
// (reuses the per-day counts the calendar already fetches), so the user is
// never sent to an empty day. Mobile only; desktop has the filter-sidebar calendar.

const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

function todayYmd(): string {
  // Kyrgyzstan fixed UTC+6.
  return new Date(Date.now() + 6 * 3_600_000).toISOString().slice(0, 10);
}
function fmt(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function SmartDateNav({ kind }: { kind: "trips" | "requests" }) {
  const t = useTranslations("feed");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "";
  const counts = useCalendarCounts(kind, from, to, Boolean(from && to));

  if (!from || !to || !counts) return null;

  const today = todayYmd();
  const raw = sp.get("date");
  const current = raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : today;

  // Days that actually have items, today or later, ascending.
  const available = Object.keys(counts)
    .filter((d) => (counts[d] ?? 0) > 0 && d >= today)
    .sort();
  if (available.length === 0) return null; // nothing anywhere → empty-state handles it

  const prev = [...available].reverse().find((d) => d < current);
  const next = available.find((d) => d > current);
  const currentCount = counts[current] ?? 0;

  const go = (v: string) => {
    const nextParams = new URLSearchParams(sp);
    nextParams.set("date", v);
    nextParams.delete("cursor");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false }));
  };

  const arrowCls =
    "flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 disabled:opacity-25 disabled:hover:bg-transparent dark:text-ink-300 dark:hover:bg-ink-800";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4 lg:hidden"
      style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-1 rounded-full border border-ink-100 bg-white/95 p-1 shadow-lift backdrop-blur transition-opacity dark:border-ink-800 dark:bg-ink-900/95",
          pending && "opacity-70",
        )}
      >
        <button type="button" disabled={!prev} onClick={() => prev && go(prev)} aria-label={t("date_nav_earlier")} className={arrowCls}>
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <span className="flex items-center gap-1.5 px-1.5 text-[13px] font-900 text-ink-900 dark:text-white">
          <CalendarDays className="h-4 w-4 text-brand-500" aria-hidden="true" />
          {fmt(current)}
          <span
            className={cn(
              "ml-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-900",
              currentCount > 0
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                : "bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500",
            )}
          >
            {currentCount}
          </span>
        </span>

        <button type="button" disabled={!next} onClick={() => next && go(next)} aria-label={t("date_nav_later")} className={arrowCls}>
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
