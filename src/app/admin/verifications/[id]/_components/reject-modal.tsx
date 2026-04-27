"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { rejectVerification } from "@/lib/api/admin";

interface Props {
  id: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RejectModal({ id, open, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => rejectVerification(id, reason),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-6">
        <h2 className="mb-4 text-[18px] font-extrabold text-slate-900">
          Отклонить верификацию
        </h2>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
          Причина отказа *
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Документы нечёткие / данные не совпадают…"
          className="w-full rounded-xl border border-slate-200 p-3 text-[13px] outline-none focus:border-slate-400"
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-[14px] font-bold text-slate-700 hover:bg-slate-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => mutate()}
            disabled={!reason.trim() || isPending}
            className="flex-1 rounded-xl bg-red-600 py-3 text-[14px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Отклоняем…" : "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  );
}
