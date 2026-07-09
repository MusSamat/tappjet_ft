"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import { Chip, DatePickerModal } from "@/components/ui";
import { useCalendarCounts } from "@/lib/hooks/use-calendar-counts";

// Yandex-style result date filter: Сегодня / Завтра / calendar. Writes a
// YYYY-MM-DD `date` query param (pages convert to ISO+06:00 for the API).
// Tapping the active chip clears the filter.

function ymd(offsetDays: number): string {
  // Kyrgyzstan is fixed UTC+6 (no DST) — compute the local calendar day.
  const d = new Date(Date.now() + 6 * 3_600_000 + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export function DateQuickChips({ accent = "accent" as const }) {
  const t = useTranslations("feed");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Availability per day for the current route — fetched when the calendar
  // opens so each date shows how many trips/requests it has.
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const isRequests = pathname.startsWith("/requests");
  const dayCounts = useCalendarCounts(isRequests ? "requests" : "trips", from, to, pickerOpen);

  const today = ymd(0);
  const tomorrow = ymd(1);
  // Feeds default to today when no date param is set — reflect that here.
  // «any» (filters sheet) and legacy tokens → no chip selected.
  const raw = params.get("date") || today;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
  const isCustom = date !== "" && date !== today && date !== tomorrow;

  const setDate = (v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set("date", v);
    else next.delete("date");
    next.delete("cursor");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  // Hardcoded month names — toLocaleDateString("ru-RU") falls back to English
  // in browsers without the ru/ky ICU data.
  const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const fmt = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };

  return (
    <>
      <Chip kind="quick" accent={accent} selected={date === today} onClick={() => setDate(today)}>
        {t("today")}
      </Chip>
      <Chip kind="quick" accent={accent} selected={date === tomorrow} onClick={() => setDate(date === tomorrow ? null : tomorrow)}>
        {t("tomorrow")}
      </Chip>
      <Chip
        kind="quick"
        accent={accent}
        selected={isCustom}
        onClick={() => setPickerOpen(true)}
        icon={<Calendar className="h-3.5 w-3.5" aria-hidden="true" />}
      >
        {isCustom ? fmt(date) : t("pick_date")}
      </Chip>
      <DatePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        value={isCustom ? date : ""}
        onChange={(v) => setDate(v || null)}
        min={today}
        title={t("pick_date")}
        dayCounts={dayCounts}
      />
    </>
  );
}
