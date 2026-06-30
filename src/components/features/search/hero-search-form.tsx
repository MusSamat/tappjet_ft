"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Users, Search, ArrowLeftRight, MapPin, Flag, CalendarDays } from "lucide-react";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

const LAST_SEARCH_KEY = "tappjet_last_search";

interface LastSearch {
  from: string;
  to: string;
  date: string;
  seats: string;
}

export function HeroSearchForm() {
  const t = useTranslations("search");
  const router = useRouter();
  const [from, setFrom] = useState("Бишкек");
  const [fromRaw, setFromRaw] = useState("Бишкек");
  const [to, setTo] = useState("");
  const [toRaw, setToRaw] = useState("");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState("1");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_SEARCH_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as LastSearch;
      const todayYMD = new Date().toISOString().split("T")[0]!;
      if (saved.from) { setFrom(saved.from); setFromRaw(saved.from); }
      if (saved.to) { setTo(saved.to); setToRaw(saved.to); }
      if (saved.date && saved.date >= todayYMD) setDate(saved.date);
      if (saved.seats) setSeats(saved.seats);
    } catch { /* ignore */ }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fromValue = from || fromRaw;
    const toValue = to || toRaw;
    try {
      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify({ from: fromValue, to: toValue, date, seats }));
    } catch { /* ignore */ }
    const params = new URLSearchParams();
    if (fromValue) params.set("from", fromValue);
    if (toValue) params.set("to", toValue);
    if (date) params.set("date", date);
    if (seats && seats !== "1") params.set("seats", seats);
    router.push(`/trips?${params.toString()}`);
  };

  const swap = () => {
    setFrom(to); setFromRaw(toRaw);
    setTo(from); setToRaw(fromRaw);
  };

  const todayStr = new Date().toISOString().split("T")[0]!;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-6 max-w-[880px] rounded-3xl bg-white shadow-[0_20px_50px_rgba(17,24,39,.10)]"
    >
      {/* ── Row 1: FROM | swap | TO ─────────────────────────────────── */}
      <div className="flex items-stretch">
        {/* FROM */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-tl-[20px] px-3 py-3 sm:px-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50">
            <MapPin className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("from_label")}</p>
            <CityAutocomplete
              borderless
              value={from}
              onChange={setFrom}
              onInputChange={setFromRaw}
              placeholder={t("from_placeholder")}
            />
          </div>
        </div>

        {/* Swap */}
        <div className="flex items-center px-1">
          <button
            type="button"
            onClick={swap}
            disabled={!from && !to}
            aria-label={t("swap_aria")}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-teal-400 hover:text-teal-600 disabled:opacity-30"
          >
            <ArrowLeftRight className="h-3 w-3" />
          </button>
        </div>

        {/* TO */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-tr-[20px] px-3 py-3 sm:px-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <Flag className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("to_label")}</p>
            <CityAutocomplete
              borderless
              value={to}
              onChange={setTo}
              onInputChange={setToRaw}
              placeholder={t("to_placeholder")}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" aria-hidden="true" />

      {/* ── Row 2: Date | Seats (always side-by-side) + Button ──────── */}
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {/* Date + Seats — always a single flex row, never stacked */}
        <div className="flex flex-1 items-stretch">
          {/* Date */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50">
              <CalendarDays className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("date_label")}</p>
              <DatePicker
                borderless
                value={date}
                onChange={setDate}
                min={todayStr}
                placeholder={t("date_any")}
              />
            </div>
          </div>

          <div className="w-px self-stretch bg-gray-100" aria-hidden="true" />

          {/* Seats */}
          <div className="flex w-[88px] flex-shrink-0 items-center gap-2 px-2.5 py-2.5 sm:w-[110px] sm:px-3 sm:py-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <Users className="h-3.5 w-3.5 text-gray-700" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("seats_label")}</p>
              <input
                type="number"
                min={1}
                max={4}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-[14px] font-semibold text-gray-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center border-t border-gray-100 p-3 sm:border-l sm:border-t-0">
          <Button
            type="submit"
            variant="submit"
            size="lg"
            className="w-full whitespace-nowrap sm:w-auto"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {t("submit")}
          </Button>
        </div>
      </div>
    </form>
  );
}
