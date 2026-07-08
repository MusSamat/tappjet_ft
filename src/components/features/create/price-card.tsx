"use client";

import { Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

// Price card — design-spec §2.4: wallet icon + numeric input + «с».
// Label «Цена за место» (driver) / «Бюджет (до)» (passenger).

interface Props {
  value: number;
  label: string;
  onChange: (v: number) => void;
}

export function PriceCard({ value, label, onChange }: Props) {
  const t = useTranslations("create");
  return (
    <div className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
      <div className="mb-2 text-[15px] font-900 text-ink-900 dark:text-white">{label}</div>
      <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-4 py-2.5 dark:bg-ink-800">
        <Wallet className="h-4 w-4 shrink-0 text-accent-500" aria-hidden="true" />
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value || ""}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full bg-transparent text-[17px] font-900 text-ink-900 outline-none dark:text-white"
          aria-label={label}
        />
        <span className="shrink-0 text-[14px] font-900 text-ink-400">{t("som")}</span>
      </div>
    </div>
  );
}
