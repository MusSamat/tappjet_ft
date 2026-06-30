"use client";

import { ArrowRight } from "lucide-react";
import { DatePicker } from "@/components/ui";
import { Chip } from "../_components/chip";

interface DateOption {
  label: string;
  value: string;
}

interface StepDateTimeProps {
  date: string;
  time: string;
  canNext: boolean;
  dateOptions: DateOption[];
  timeOptions: string[];
  todayStr: string;
  onPatchDate: (v: string) => void;
  onPatchTime: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
  t: (key: string) => string;
}

export function StepDateTime({
  date,
  time,
  canNext,
  dateOptions,
  timeOptions,
  todayStr,
  onPatchDate,
  onPatchTime,
  onBack,
  onNext,
  t,
}: StepDateTimeProps) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[17px] font-bold text-gray-900">{t("step_datetime_title")}</h2>

      <div>
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {t("date_label")}
        </p>
        <div className="flex flex-wrap gap-2">
          {dateOptions.map(({ label, value }) => (
            <Chip key={value} active={date === value} onClick={() => onPatchDate(value)}>
              {label}
            </Chip>
          ))}
          <DatePicker
            value={/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : ""}
            onChange={onPatchDate}
            min={todayStr}
            placeholder={t("date_pick")}
            compact
          />
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {t("time_label")}
        </p>
        <div className="flex flex-wrap gap-2">
          {timeOptions.map((opt) => (
            <Chip key={opt} active={time === opt} onClick={() => onPatchTime(opt)}>
              {opt}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 flex-1 items-center justify-center rounded-xl border-2 border-ink-200 text-[14px] font-bold text-gray-700 hover:bg-gray-50"
        >
          {t("back")}
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-amber-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 disabled:opacity-40"
        >
          {t("next")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
