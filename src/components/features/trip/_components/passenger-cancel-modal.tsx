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
      <h2 className="mb-1 text-[20px] font-extrabold text-ink-900 dark:text-white">{t("cancel_booking_title")}</h2>
      <p className="mt-1 text-[14px] text-ink-500 dark:text-ink-400">{t("cancel_reason_hint")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {cancelReasonLabels.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onToggle(r)}
            className={cn(
              "rounded-full border-2 px-3 py-1.5 text-[13px] font-bold transition-colors",
              reasons.includes(r)
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-ink-200 text-ink-700 hover:border-ink-300 dark:border-ink-700 dark:text-ink-200",
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
          className="flex-1 rounded-xl border border-ink-200 py-2.5 text-[14px] font-bold text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200"
        >
          {t("back_btn")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 rounded-xl bg-coral-600 py-2.5 text-[14px] font-bold text-white hover:bg-coral-700 disabled:opacity-50"
        >
          {isPending ? t("cancelling") : t("confirm_btn")}
        </button>
      </div>
    </Overlay>
  );
}
