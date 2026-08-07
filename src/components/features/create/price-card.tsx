"use client";

import { useTranslations } from "next-intl";

// Price — compact row: label left, numeric input + «сом» right (matches the
// car / seats rows). Label «Цена за место» (driver) / «Бюджет (до)» (passenger).

interface Props {
  value: number;
  label: string;
  onChange: (v: number) => void;
}

export function PriceCard({ value, label, onChange }: Props) {
  const t = useTranslations("create");
  return (
    // Whole row is a <label>, so tapping the label text (or «сом») focuses the input.
    <label className="flex cursor-text items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
      <span className="text-[15px] font-900 text-ink-900 dark:text-white">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value || ""}
          placeholder="0"
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-24 bg-transparent text-right text-[18px] font-900 text-ink-900 outline-none placeholder:text-ink-300 dark:text-white"
          aria-label={label}
        />
        <span className="shrink-0 text-[14px] font-800 text-ink-400">{t("som")}</span>
      </div>
    </label>
  );
}
