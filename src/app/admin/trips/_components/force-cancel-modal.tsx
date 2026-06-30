"use client";

import { AlertTriangle, X } from "lucide-react";
import type { AdminTripItem } from "@/lib/api/admin";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const CANCEL_REASONS = [
  "Нарушение правил платформы",
  "Фиктивная поездка",
  "Жалоба пассажиров",
  "Технический сбой",
  "Другое",
];

interface ForceCancelModalProps {
  cancelTarget: AdminTripItem;
  cancelReason: string;
  customReason: string;
  isPending: boolean;
  isError: boolean;
  onReasonChange: (reason: string) => void;
  onCustomReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function ForceCancelModal({
  cancelTarget,
  cancelReason,
  customReason,
  isPending,
  isError,
  onReasonChange,
  onCustomReasonChange,
  onClose,
  onConfirm,
}: ForceCancelModalProps) {
  const effectiveReason = cancelReason === "Другое" ? customReason : cancelReason;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-extrabold text-slate-900">Отменить поездку</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-xl bg-accent-50 p-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-accent-600" />
          <div>
            <p className="text-[13px] font-bold text-accent-700">
              {cancelTarget.originCity} → {cancelTarget.destinationCity}
            </p>
            <p className="text-[12px] text-accent-700">{fmtDate(cancelTarget.departureAt)}</p>
          </div>
        </div>

        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          Причина отмены *
        </p>
        <div className="mb-3 space-y-1.5">
          {CANCEL_REASONS.map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 px-4 py-2.5 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="cancel_reason"
                value={r}
                checked={cancelReason === r}
                onChange={() => onReasonChange(r)}
                className="h-4 w-4"
              />
              <span className="text-[13px] font-semibold text-slate-700">{r}</span>
            </label>
          ))}
        </div>
        {cancelReason === "Другое" && (
          <textarea
            value={customReason}
            onChange={(e) => onCustomReasonChange(e.target.value)}
            rows={2}
            placeholder="Укажите причину…"
            className="mb-3 w-full rounded-xl border border-slate-200 p-3 text-[13px] outline-none focus:border-slate-400"
          />
        )}
        {isError && (
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-[12px] text-red-700">
            Ошибка при отмене. Попробуйте снова.
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-[14px] font-bold text-slate-700 hover:bg-slate-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!effectiveReason.trim() || isPending}
            className="flex-1 rounded-xl bg-red-600 py-3 text-[14px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Отменяем…" : "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  );
}
