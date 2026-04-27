"use client";

import { ArrowRight } from "lucide-react";
import { CityAutocomplete, DatePicker } from "@/components/ui";
import { Chip } from "../_components/chip";

interface DateOption {
  label: string;
  value: string;
}

interface Step1Props {
  originCity: string;
  destinationCity: string;
  date: string;
  time: string;
  canStep1: boolean;
  dateOptions: DateOption[];
  timeOptions: string[];
  todayStr: string;
  onPatchOrigin: (v: string) => void;
  onPatchDestination: (v: string) => void;
  onPatchDate: (v: string) => void;
  onPatchTime: (v: string) => void;
  onNext: () => void;
  t: (key: string) => string;
}

export function Step1({
  originCity,
  destinationCity,
  date,
  time,
  canStep1,
  dateOptions,
  timeOptions,
  todayStr,
  onPatchOrigin,
  onPatchDestination,
  onPatchDate,
  onPatchTime,
  onNext,
  t,
}: Step1Props) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[17px] font-bold text-gray-900">{t("step1_title")}</h2>

      <div className="flex flex-col gap-3 overflow-hidden rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
        <CityAutocomplete
          label={t("from_label")}
          value={originCity}
          onChange={onPatchOrigin}
          placeholder={t("from_placeholder")}
        />
        <CityAutocomplete
          label={t("to_label")}
          value={destinationCity}
          onChange={onPatchDestination}
          placeholder={t("to_placeholder")}
        />
      </div>

      <div>
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">{t("date_label")}</p>
        <div className="flex flex-wrap gap-2">
          {dateOptions.map(({ label, value }) => (
            <Chip
              key={value}
              active={date === value}
              onClick={() => onPatchDate(value)}
            >
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
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">{t("time_label")}</p>
        <div className="flex flex-wrap gap-2">
          {timeOptions.map((opt) => (
            <Chip key={opt} active={time === opt} onClick={() => onPatchTime(opt)}>
              {opt}
            </Chip>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canStep1}
        onClick={onNext}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 disabled:opacity-40"
      >
        {t("next")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
