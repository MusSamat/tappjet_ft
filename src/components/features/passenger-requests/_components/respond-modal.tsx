"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PassengerRequest } from "@/lib/api/passenger-requests";
import { respondToRequest, type RespondInput } from "@/lib/api/passenger-requests";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  request: PassengerRequest;
  onClose: () => void;
}

export function RespondModal({ request, onClose }: Props) {
  const qc = useQueryClient();
  const t = useTranslations("requests");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(request.departureDate.split("T")[0] ?? "");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const iso = new Date(`${date}T${time}:00`).toISOString();
      const input: RespondInput = {
        price: Number(price),
        departureTime: iso,
        ...(message.trim() ? { message: message.trim() } : {}),
      };
      return respondToRequest(request.id, input);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["request-responses", request.id] });
      onClose();
    },
    onError: (e) => setError(friendlyError(extractError(e))),
  });

  const canSubmit = price && Number(price) > 0 && date && time;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-[16px] font-extrabold text-gray-900">{t("respond_title")}</p>
            <p className="text-[12px] text-gray-500">
              {request.originCity} → {request.destinationCity}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-600">
              {t("price_label")}
            </p>
            <input
              type="number"
              min={1}
              max={100000}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t("price_placeholder")}
              className="h-12 w-full rounded-2xl border-[1.5px] border-gray-200 bg-gray-50 px-4 text-[16px] font-bold text-gray-900 outline-none focus:border-sky-400 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-600">
                {t("date_label")}
              </p>
              <input
                type="date"
                min={request.departureDate.split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 w-full rounded-2xl border-[1.5px] border-gray-200 bg-gray-50 px-3 text-[13px] font-semibold text-gray-900 outline-none focus:border-sky-400 focus:bg-white"
              />
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-600">
                {t("time_label")}
              </p>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 w-full rounded-2xl border-[1.5px] border-gray-200 bg-gray-50 px-3 text-[13px] font-semibold text-gray-900 outline-none focus:border-sky-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {t("message_label")}
            </p>
            <textarea
              rows={2}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("message_placeholder")}
              className="w-full resize-none rounded-2xl border-[1.5px] border-gray-200 bg-gray-50 px-4 py-3 text-[13px] text-gray-900 outline-none focus:border-sky-400 focus:bg-white placeholder:text-gray-400"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-5 pb-6 pt-4">
          <button
            type="button"
            disabled={!canSubmit || isPending}
            onClick={() => {
              setError(null);
              mutate();
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 text-[14px] font-bold text-white transition-colors hover:bg-sky-700 disabled:opacity-40"
          >
            {isPending ? (
              <Spinner size={18} />
            ) : (
              <>
                <CheckCircle className="h-4 w-4" aria-hidden />
                {t("submit_response")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
