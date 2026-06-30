"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TripListItem } from "@/lib/api/trips";

function fmtDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function CancelTripModal({ trip, isPending, onConfirm, onClose }: {
  trip: TripListItem;
  isPending: boolean;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}) {
  const t = useTranslations("bookings");
  const [reason, setReason] = useState("");

  const TRIP_CANCEL_REASONS = [
    t("cancel_reason_plans"),
    t("cancel_reason_breakdown"),
    t("cancel_reason_no_passengers"),
    t("cancel_reason_other"),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full overflow-hidden rounded-t-[24px] bg-white shadow-2xl sm:max-w-[440px] sm:rounded-[24px]">
        <div className="flex justify-center pb-1 pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="px-6 pb-8 pt-4">
          <h2 className="text-[18px] font-extrabold text-gray-900">{t("cancel_trip_title")}</h2>
          <p className="mt-1 text-[13px] text-gray-500">
            {trip.originCity} → {trip.destinationCity}
            {trip.departureAt ? ` · ${fmtDate(trip.departureAt)}` : ""}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-[12px] font-bold text-gray-700">{t("cancel_reason_label")}</p>
            <div className="flex flex-wrap gap-2">
              {TRIP_CANCEL_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={cn(
                    "rounded-full border-[1.5px] px-3 py-1.5 text-[12px] font-bold transition-colors",
                    reason === r
                      ? "border-coral-400 bg-coral-50 text-coral-700"
                      : "border-gray-200 text-gray-700 hover:border-gray-300",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onConfirm(reason || undefined)}
              disabled={isPending}
              className="w-full rounded-[14px] bg-coral-600 py-3 text-[15px] font-bold text-white hover:bg-coral-700 disabled:opacity-50"
            >
              {isPending ? t("cancelling") : t("cancel_confirm")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-[14px] border border-gray-200 py-3 text-[15px] font-bold text-gray-700 hover:bg-gray-50"
            >
              {t("keep_trip")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
