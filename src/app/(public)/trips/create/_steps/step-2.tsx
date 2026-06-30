"use client";

import { ArrowRight } from "lucide-react";
import type { LuggageOption } from "@/lib/api/trips-create";
import { Chip } from "../_components/chip";

interface Step2Props {
  seatsTotal: number;
  pricePerSeat: number;
  priceNegotiable: boolean;
  luggage: LuggageOption;
  canStep2: boolean;
  onPatchSeats: (v: number) => void;
  onPatchPrice: (v: number) => void;
  onPatchNegotiable: (v: boolean) => void;
  onPatchLuggage: (v: LuggageOption) => void;
  onBack: () => void;
  onNext: () => void;
  t: (key: string) => string;
}

export function Step2({
  seatsTotal,
  pricePerSeat,
  priceNegotiable,
  luggage,
  canStep2,
  onPatchSeats,
  onPatchPrice,
  onPatchNegotiable,
  onPatchLuggage,
  onBack,
  onNext,
  t,
}: Step2Props) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[17px] font-bold text-gray-900">{t("step2_title")}</h2>

      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-gray-900">{t("seats_title")}</div>
            <div className="mt-0.5 text-[12px] text-gray-500">{t("seats_hint")}</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onPatchSeats(Math.max(1, seatsTotal - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-gray-200 text-[18px] font-bold text-gray-700 hover:bg-gray-50"
              aria-label={t("seats_less_aria")}
            >
              −
            </button>
            <span className="min-w-[28px] text-center text-[26px] font-extrabold text-gray-900">
              {seatsTotal}
            </span>
            <button
              type="button"
              onClick={() => onPatchSeats(Math.min(6, seatsTotal + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-gray-200 text-[18px] font-bold text-gray-700 hover:bg-gray-50"
              aria-label={t("seats_more_aria")}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <div className="mb-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("price_label")}</div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={50}
              max={10000}
              value={pricePerSeat}
              onChange={(e) => onPatchPrice(Math.max(50, Math.min(10000, Number(e.target.value))))}
              className="h-12 w-32 rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-4 text-center text-[22px] font-extrabold text-gray-900 outline-none focus:border-teal-500"
            />
            <span className="text-[17px] font-bold text-gray-500">{t("price_som")}</span>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={priceNegotiable}
            onChange={(e) => onPatchNegotiable(e.target.checked)}
            className="h-4 w-4 rounded accent-teal-600"
          />
          <span className="text-[13px] font-semibold text-gray-700">{t("price_negotiable")}</span>
        </label>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("luggage_section")}</p>
        <div className="flex flex-wrap gap-2">
          {([
            ["no", t("luggage_no")],
            ["small", t("luggage_small")],
            ["yes", t("luggage_big")],
          ] as [LuggageOption, string][]).map(([v, l]) => (
            <Chip key={v} active={luggage === v} onClick={() => onPatchLuggage(v)}>
              {l}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 flex-1 items-center justify-center rounded-xl border-[1.5px] border-gray-200 text-[14px] font-bold text-gray-700 hover:bg-gray-50"
        >
          {t("back")}
        </button>
        <button
          type="button"
          disabled={!canStep2}
          onClick={onNext}
          className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-amber-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 disabled:opacity-40"
        >
          {t("next")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
