"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useCalendarCounts } from "@/lib/hooks/use-calendar-counts";
import { cn } from "@/lib/utils/cn";

// Date stepper pill — replaces the «Сегодня / Завтра / Выбрать» chips in the
// feed chips row: ‹ Сегодня · 3 ›. The arrows jump to the nearest PREVIOUS/NEXT
// calendar day that actually has trips/requests on this route (per-day counts),
// so the user is never sent to an empty day. Today/tomorrow show their names;
// a custom date is still reachable via the filters sheet calendar.

const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

function ymdKg(offsetDays = 0): string {
  // Kyrgyzstan fixed UTC+6.
  return new Date(Date.now() + 6 * 3_600_000 + offsetDays * 86_400_000).toISOString().slice(0, 10);
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
  // Render immediately (arrows disabled, no badge) while counts load — the
  // chips row must not jump when the data arrives.
  const counts = useCalendarCounts(kind, from, to, Boolean(from && to));

  if (!from || !to) return null;

  const today = ymdKg(0);
  const tomorrow = ymdKg(1);
  const raw = sp.get("date");
  const current = raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : today;
  const label =
    current === today ? t("today") : current === tomorrow ? t("tomorrow") : fmt(current);

  // Days that actually have items, today or later, ascending.
  const available = counts
    ? Object.keys(counts)
        .filter((d) => (counts[d] ?? 0) > 0 && d >= today)
        .sort()
    : [];
  const prev = [...available].reverse().find((d) => d < current);
  const next = available.find((d) => d > current);
  const currentCount = counts?.[current] ?? 0;

  const go = (v: string) => {
    const nextParams = new URLSearchParams(sp);
    nextParams.set("date", v);
    nextParams.delete("cursor");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false }));
  };

  const grape = kind === "requests";
  const arrowCls =
    "flex h-7 w-7 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 disabled:opacity-25 disabled:hover:bg-transparent dark:text-ink-300 dark:hover:bg-ink-800";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-full border border-ink-200 bg-white p-0.5 transition-opacity dark:border-ink-700 dark:bg-ink-900",
        pending && "opacity-60",
      )}
    >
      <button type="button" disabled={!prev} onClick={() => prev && go(prev)} aria-label={t("date_nav_earlier")} className={arrowCls}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      <span className="flex items-center gap-1 whitespace-nowrap px-1 text-[13px] font-900 text-ink-900 dark:text-white">
        <CalendarDays
          className={cn("h-3.5 w-3.5", grape ? "text-grape-500" : "text-brand-500")}
          aria-hidden="true"
        />
        {label}
        {counts && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[11px] font-900",
              currentCount > 0
                ? grape
                  ? "bg-grape-100 text-grape-600 dark:bg-grape-500/15 dark:text-grape-300"
                  : "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                : "bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500",
            )}
          >
            {currentCount}
          </span>
        )}
      </span>

      <button type="button" disabled={!next} onClick={() => next && go(next)} aria-label={t("date_nav_later")} className={arrowCls}>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
