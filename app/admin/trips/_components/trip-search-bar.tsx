"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STATUS_TABS = [
  { value: "active",    label: "Активные",     dot: "bg-teal-500" },
  { value: "completed", label: "Завершённые",   dot: "bg-blue-500" },
  { value: "cancelled", label: "Отменённые",    dot: "bg-slate-400" },
  { value: "all",       label: "Все",           dot: "bg-slate-300" },
] as const;

type StatusTab = typeof STATUS_TABS[number]["value"];

interface Props {
  status: StatusTab;
  fromInput: string;
  toInput: string;
  fromFilter: string;
  toFilter: string;
  onStatusChange: (s: StatusTab) => void;
  onFromInput: (v: string) => void;
  onToInput: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onReset: () => void;
}

export function TripSearchBar({
  status,
  fromInput,
  toInput,
  fromFilter,
  toFilter,
  onStatusChange,
  onFromInput,
  onToInput,
  onSearch,
  onReset,
}: Props) {
  return (
    <>
      <div className="mb-4 flex gap-1 rounded-2xl bg-white p-1.5 shadow-sm w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onStatusChange(tab.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors",
              status === tab.value
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full flex-shrink-0", tab.dot)} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSearch} className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={fromInput}
            onChange={(e) => onFromInput(e.target.value)}
            placeholder="Откуда…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-[13px] outline-none focus:border-slate-400"
          />
        </div>
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={toInput}
            onChange={(e) => onToInput(e.target.value)}
            placeholder="Куда…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-[13px] outline-none focus:border-slate-400"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-slate-800"
        >
          Найти
        </button>
        {(fromFilter || toFilter) && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-[13px] text-slate-500 hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" /> Сбросить
          </button>
        )}
      </form>
    </>
  );
}
