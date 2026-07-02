"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { requestVerificationDocs } from "@/lib/api/admin";
import { Button } from "@/components/ui";

const REQUESTABLE_DOCS = [
  { id: "passport", label: "Паспорт" },
  { id: "driver_license", label: "Водительское удостоверение" },
  { id: "car_registration", label: "Тех. паспорт авто" },
  { id: "selfie", label: "Сэлфи с документом" },
  { id: "car_photo", label: "Фото автомобиля" },
];

interface Props {
  id: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestDocsModal({ id, open, onClose, onSuccess }: Props) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => requestVerificationDocs(id, selectedDocs, note || undefined),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const toggle = (docId: string) =>
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((d) => d !== docId) : [...prev, docId],
    );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-6">
        <h2 className="mb-4 text-[18px] font-disp font-extrabold text-ink-900">
          Запросить документы
        </h2>
        <div className="mb-4 space-y-2">
          {REQUESTABLE_DOCS.map((d) => (
            <label
              key={d.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-100 px-4 py-2.5 hover:bg-ink-50"
            >
              <input
                type="checkbox"
                checked={selectedDocs.includes(d.id)}
                onChange={() => toggle(d.id)}
                className="h-4 w-4 rounded"
              />
              <span className="text-[13px] font-semibold text-ink-700">{d.label}</span>
            </label>
          ))}
        </div>
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-ink-500">
          Примечание (необязательно)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Дополнительные инструкции…"
          className="w-full rounded-xl border border-ink-200 p-3 text-[13px] outline-none focus:border-ink-400"
        />
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="lg"
            type="button"
            onClick={onClose}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            variant="cta"
            size="lg"
            type="button"
            onClick={() => mutate()}
            disabled={selectedDocs.length === 0 || isPending}
            className="flex-1"
          >
            {isPending ? "Отправляем…" : "Запросить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
