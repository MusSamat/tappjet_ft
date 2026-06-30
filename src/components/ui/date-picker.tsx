"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  LOCALE_DATA,
  type Locale,
  toYMD,
  parseYMD,
  formatDisplay,
  buildGrid,
  dayYMD,
} from "./date-picker-utils";

// ── Popup position — fixed coords so it escapes any overflow:hidden parent ───
interface PopupPos { top: number; left: number; width: number }

function usePopupPos(
  triggerRef: React.RefObject<HTMLElement>,
  open: boolean,
): PopupPos {
  const [pos, setPos] = useState<PopupPos>({ top: 0, left: 0, width: 280 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const calc = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      const popH = 348;
      const spaceBelow = window.innerHeight - r.bottom;
      const top = spaceBelow >= popH + 8 ? r.bottom + 4 : r.top - popH - 4;
      const left = Math.min(r.left, window.innerWidth - 284);
      setPos({ top, left, width: Math.max(r.width, 280) });
    };
    calc();
    window.addEventListener("scroll", calc, true);
    window.addEventListener("resize", calc);
    return () => {
      window.removeEventListener("scroll", calc, true);
      window.removeEventListener("resize", calc);
    };
  }, [open, triggerRef]);

  return pos;
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface DatePickerProps {
  value: string;          // YYYY-MM-DD or ""
  onChange: (v: string) => void;
  placeholder?: string;
  min?: string;           // YYYY-MM-DD — days before are disabled
  max?: string;
  locale?: Locale;
  /** Smaller trigger for sidebar / filter contexts */
  compact?: boolean;
  /** No border / background on trigger — embed inside a card field */
  borderless?: boolean;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function DatePicker({
  value,
  onChange,
  placeholder,
  min,
  max,
  locale = "ru",
  compact = false,
  borderless = false,
  className,
}: DatePickerProps) {
  const l = LOCALE_DATA[locale];
  const today = toYMD(new Date());

  const [open, setOpen] = useState(false);
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const triggerRef = useRef<HTMLButtonElement>(null!);
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = usePopupPos(triggerRef, open);

  // When opening, jump the calendar to the currently-selected month
  useEffect(() => {
    if (!open) return;
    const d = parseYMD(value);
    if (d) setView({ year: d.getFullYear(), month: d.getMonth() });
    else setView({ year: now.getFullYear(), month: now.getMonth() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !popupRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open]);

  const prevMonth = () =>
    setView((v) =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 },
    );
  const nextMonth = () =>
    setView((v) =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 },
    );

  const select = (day: number) => {
    onChange(dayYMD(view.year, view.month, day));
    setOpen(false);
  };

  const grid = buildGrid(view.year, view.month);
  const displayStr = formatDisplay(value, locale);

  return (
    <div className={cn("relative", className)}>
      {/* ── Trigger ─────────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-1.5 text-left transition-colors",
          borderless
            ? "bg-transparent"
            : compact
              ? cn(
                  "h-9 rounded-xl border bg-white px-3",
                  open
                    ? "border-brand-500 ring-2 ring-brand-100"
                    : "border-ink-200 hover:border-ink-300",
                )
              : cn(
                  "h-10 rounded-xl border bg-white px-3",
                  open
                    ? "border-brand-500 ring-2 ring-brand-100"
                    : "border-ink-200 hover:border-ink-300",
                ),
        )}
      >
        {!borderless && (
          <CalendarDays
            className={cn(
              "flex-shrink-0",
              compact ? "h-3.5 w-3.5" : "h-4 w-4",
              value ? "text-brand-600" : "text-ink-400",
            )}
            aria-hidden="true"
          />
        )}
        <span
          className={cn(
            "flex-1 truncate font-semibold",
            compact ? "text-[12px]" : "text-[14px]",
            displayStr ? "text-ink-900" : "text-ink-400",
          )}
        >
          {displayStr || (placeholder ?? l.any)}
        </span>
        {value && (
          <span
            role="button"
            aria-label={l.clear}
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="flex-shrink-0 cursor-pointer text-ink-300 hover:text-ink-500"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </button>

      {/* ── Popup (fixed-position — escapes overflow:hidden) ─────────── */}
      {open && (
        <div
          ref={popupRef}
          role="dialog"
          aria-modal="true"
          aria-label="Выбор даты"
          style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="min-w-[280px] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-2xl"
        >
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-50">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Предыдущий месяц"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[14px] font-extrabold text-ink-900">
              {l.months[view.month]} {view.year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Следующий месяц"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 px-3 pt-2 pb-1">
            {l.weekdays.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "text-center text-[11px] font-bold",
                  i >= 5 ? "text-coral-400" : "text-ink-400",
                )}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-0.5 px-3 pb-3">
            {grid.map((day, i) => {
              if (!day) return <div key={`_${i}`} />;
              const ymd = dayYMD(view.year, view.month, day);
              const disabled = (min !== undefined && ymd < min) || (max !== undefined && ymd > max);
              const selected = ymd === value;
              const isToday = ymd === today;
              const weekend = i % 7 >= 5;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => select(day)}
                  className={cn(
                    "flex h-8 w-full items-center justify-center rounded-lg text-[13px] font-semibold transition-colors",
                    disabled && "cursor-not-allowed opacity-25",
                    selected && "bg-brand-600 font-bold text-white",
                    !selected && !disabled && "hover:bg-ink-100",
                    !selected && isToday && "ring-1 ring-brand-500 font-extrabold text-brand-600",
                    !selected && !isToday && !disabled && weekend && "text-coral-500",
                    !selected && !isToday && !disabled && !weekend && "text-ink-800",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Clear */}
          {value && (
            <div className="border-t border-ink-100 px-4 py-2.5">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="text-[12px] font-bold text-ink-400 transition-colors hover:text-brand-600"
              >
                {l.clear}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
