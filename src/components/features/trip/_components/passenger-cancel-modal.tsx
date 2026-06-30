"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { Overlay } from "./modal-overlay";

const PASSENGER_CANCEL_REASONS_KEYS = [
  "cancel_reason_wait",
  "cancel_reason_plans",
  "cancel_reason_other_transport",
  "cancel_reason_time",
  "cancel_reason_price",
] as const;

export function PassengerCancelModal({
  reasons,
  onToggle,
  onConfirm,
  onClose,
  isPending,
}: {
  reasons: string[];
  onToggle: (r: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const t = useTranslations("trip_actions");

  const cancelReasonLabels = PASSENGER_CANCEL_REASONS_KEYS.map((key) => t(key));

  return (
    <Overlay onClose={onClose}>
      <h2 className="mb-1 text-[18px] font-extrabold text-gray-900">{t("cancel_booking_title")}</h2>
      <p className="mt-1 text-[13px] text-gray-500">{t("cancel_reason_hint")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {cancelReasonLabels.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onToggle(r)}
            className={cn(
              "rounded-full border-2 px-3 py-1.5 text-[12px] font-bold transition-colors",
              reasons.includes(r)
                ? "border-teal-600 bg-teal-50 text-teal-700"
                : "border-gray-200 text-gray-700 hover:border-gray-300",
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50"
        >
          {t("back_btn")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 rounded-xl bg-coral-600 py-2.5 text-[13px] font-bold text-white hover:bg-coral-700 disabled:opacity-50"
        >
          {isPending ? t("cancelling") : t("confirm_btn")}
        </button>
      </div>
    </Overlay>
  );
}
