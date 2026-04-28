"use client";

import { useTranslations } from "next-intl";
import { Bell, CheckCircle, XCircle } from "lucide-react";
import { type UseMutationResult } from "@tanstack/react-query";
import { DriverAvatar } from "@/components/ui";

interface Booking {
  id?: string;
  status?: string;
  seatsCount?: number;
  passenger?: { name?: string; avatarUrl?: string | null };
  trip?: { originCity?: string; destinationCity?: string };
}

interface RequestsTabProps {
  requests: Booking[];
  acceptMut: UseMutationResult<unknown, unknown, string, unknown>;
  rejectMut: UseMutationResult<unknown, unknown, string, unknown>;
}

export function RequestsTab({ requests, acceptMut, rejectMut }: RequestsTabProps) {
  const t = useTranslations("quick_actions");

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
        <Bell className="h-8 w-8 text-gray-200" />
        <p className="text-[12px] font-semibold text-gray-400">{t("no_requests")}</p>
      </div>
    );
  }

  return (
    <>
      {requests.map((b) => {
        const passenger = b.passenger as { name?: string; avatarUrl?: string | null } | undefined;
        const trip = b.trip as { originCity?: string; destinationCity?: string } | undefined;
        const busy = acceptMut.isPending || rejectMut.isPending;
        return (
          <div key={b.id} className="border-b border-gray-50 px-4 py-3 last:border-0">
            <div className="mb-2.5 flex items-center gap-2">
              <DriverAvatar name={passenger?.name ?? t("passenger_fallback")} src={passenger?.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-gray-900">
                  {passenger?.name ?? t("passenger_fallback")}
                </p>
                <p className="text-[11px] text-gray-500">
                  {trip?.originCity} → {trip?.destinationCity}
                  {" · "}{b.seatsCount} {t("seats_unit")}
                </p>
              </div>
              {b.status === "viewed" && (
                <span className="flex-shrink-0 text-[9px] font-bold text-teal-600">{t("viewed_label")}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => acceptMut.mutate(b.id!)}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-teal-600 py-1.5 text-[12px] font-bold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {t("accept_btn")}
              </button>
              <button
                type="button"
                onClick={() => rejectMut.mutate(b.id!)}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 py-1.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                {t("reject_btn")}
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
