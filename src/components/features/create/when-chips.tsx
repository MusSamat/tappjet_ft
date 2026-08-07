"use client";

import { useState } from "react";
import { Zap, Calendar, Clock, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Chip, DatePickerModal } from "@/components/ui";
import type { ChipAccent } from "@/components/ui";

// When block — date chips (Завтра / Послезавтра / Гибко / Выбрать дату) + a
// compact time row (native time input, opens the OS wheel — not a floating
// dropdown), plus an optional departure-window row for drivers.

const TIME_INPUT_CLS =
  "rounded-xl bg-ink-50 px-3 py-1.5 text-[16px] font-900 text-ink-900 outline-none [color-scheme:light] dark:bg-ink-800 dark:text-white dark:[color-scheme:dark]";

interface Props {
  date: string; // YYYY-MM-DD
  time: string;
  flexible: boolean;
  tomorrow: string;
  dayAfter: string;
  today: string;
  accent: ChipAccent;
  flexChip: string;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
  onFlexible: (v: boolean) => void;
  /** Optional departure-window end («выезжаем 06:00–11:00»). Rendered only when provided (driver mode). */
  timeEnd?: string;
  onTimeEnd?: (v: string) => void;
}

function fmt(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function WhenChips({ date, time, flexible, tomorrow, dayAfter, today, accent, flexChip, onDate, onTime, onFlexible, timeEnd = "", onTimeEnd }: Props) {
  const t = useTranslations("create");
  const [pickerOpen, setPickerOpen] = useState(false);
  const isCustom = !flexible && date !== "" && date !== tomorrow && date !== dayAfter;

  const pickDate = (v: string) => {
    onFlexible(false);
    onDate(v);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Chip kind="date" accent={accent} selected={!flexible && date === tomorrow} onClick={() => pickDate(tomorrow)}>
          {t("date_tomorrow")}
        </Chip>
        <Chip kind="date" accent={accent} selected={!flexible && date === dayAfter} onClick={() => pickDate(dayAfter)}>
          {t("date_dayafter")}
        </Chip>
        <Chip
          kind="date"
          accent={accent}
          selected={flexible}
          onClick={() => onFlexible(!flexible)}
          className={flexible ? undefined : flexChip}
          icon={<Zap className="h-3.5 w-3.5" aria-hidden="true" />}
        >
          {t("date_flexible")}
        </Chip>
        <Chip
          kind="date"
          accent={accent}
          selected={isCustom}
          onClick={() => setPickerOpen(true)}
          icon={<Calendar className="h-3.5 w-3.5" aria-hidden="true" />}
        >
          {isCustom ? fmt(date) : t("date_pick")}
        </Chip>
      </div>

      {!flexible && (
        <div className="space-y-2.5">
          {/* Time — compact row; the whole row is a <label>, so tapping the
              question focuses the native time input (opens the OS wheel). */}
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
            <span className="flex items-center gap-2 text-[15px] font-900 text-ink-900 dark:text-white">
              <Clock className="h-[18px] w-[18px] text-ink-500" aria-hidden="true" />
              {t("time_label")}
            </span>
            <input
              type="time"
              value={time || "09:00"}
              onChange={(e) => onTime(e.target.value)}
              aria-label={t("time_label")}
              className={TIME_INPUT_CLS}
            />
          </label>

          {/* Optional departure window («выезжаем 06:00–08:00») — driver only.
              Set → a <label> focuses the time input; unset → the whole row is a
              button that adds the window. */}
          {onTimeEnd &&
            (timeEnd ? (
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800" title={t("time_end_hint")}>
                <span className="min-w-0 text-[14px] font-800 text-ink-600 dark:text-ink-300">{t("time_end_label")}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <input
                    type="time"
                    value={timeEnd}
                    onChange={(e) => onTimeEnd(e.target.value)}
                    aria-label={t("time_end_label")}
                    className={TIME_INPUT_CLS}
                  />
                  <button
                    type="button"
                    onClick={() => onTimeEnd("")}
                    aria-label={t("time_end_add")}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </label>
            ) : (
              <button
                type="button"
                onClick={() => onTimeEnd(`${String((parseInt(time, 10) + 3) % 24).padStart(2, "0")}:00`)}
                title={t("time_end_hint")}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left shadow-xs ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
              >
                <span className="min-w-0 text-[14px] font-800 text-ink-600 dark:text-ink-300">{t("time_end_label")}</span>
                <span className="shrink-0 text-[13px] font-800 text-brand-600 dark:text-brand-300">{t("time_end_add")}</span>
              </button>
            ))}
        </div>
      )}

      {flexible && (
        <div className="flex items-center gap-1.5 rounded-2xl bg-accent-50 px-3 py-2 text-[14px] font-700 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
          <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t("flexible_hint")}
        </div>
      )}

      <DatePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        value={isCustom ? date : ""}
        onChange={pickDate}
        min={today}
        title={t("date_pick")}
      />
    </div>
  );
}
