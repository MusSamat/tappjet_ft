"use client";

import { useState } from "react";
import { Zap, Calendar, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Chip, SectionLabel, DatePicker } from "@/components/ui";
import { BottomSheet, BottomSheetContent, BottomSheetHeader, BottomSheetBody, BottomSheetTitle } from "@/components/ui/bottom-sheet";
import type { ChipAccent } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

// When block — design-spec §2.4: date chips (Завтра / Послезавтра / Гибко /
// Выбрать дату) + single-select time chips + a datePicker BottomSheet
// (TJ.datePicker was never implemented in the prototype).

const TIME_OPTIONS = ["06:00", "08:00", "09:00", "12:00", "15:00", "18:00"];

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
}

function fmt(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function WhenChips({ date, time, flexible, tomorrow, dayAfter, today, accent, flexChip, onDate, onTime, onFlexible }: Props) {
  const t = useTranslations("create");
  const [sheetOpen, setSheetOpen] = useState(false);
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
          onClick={() => setSheetOpen(true)}
          icon={<Calendar className="h-3.5 w-3.5" aria-hidden="true" />}
        >
          {isCustom ? fmt(date) : t("date_pick")}
        </Chip>
      </div>

      {!flexible && (
        <div className="space-y-2">
          <SectionLabel>{t("time_label")}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((tm) => (
              <Chip key={tm} kind="time" selected={time === tm} onClick={() => onTime(tm)}>
                {tm}
              </Chip>
            ))}
            <Chip
              kind="time"
              selected={false}
              onClick={() => setSheetOpen(true)}
              icon={<Clock className="h-3.5 w-3.5" aria-hidden="true" />}
            >
              {t("time_other")}
            </Chip>
          </div>
        </div>
      )}

      {flexible && (
        <div className="flex items-center gap-1.5 rounded-2xl bg-accent-50 px-3 py-2 text-[11px] font-700 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
          <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t("flexible_hint")}
        </div>
      )}

      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <BottomSheetContent className={cn("max-w-[440px]")}>
          <BottomSheetHeader>
            <BottomSheetTitle>{t("date_pick")}</BottomSheetTitle>
          </BottomSheetHeader>
          <BottomSheetBody className="pb-6">
            <DatePicker
              value={isCustom ? date : ""}
              onChange={(v) => {
                pickDate(v);
                setSheetOpen(false);
              }}
              min={today}
              placeholder={t("date_pick")}
            />
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>
    </div>
  );
}
