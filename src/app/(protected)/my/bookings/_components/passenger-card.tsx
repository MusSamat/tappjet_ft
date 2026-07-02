"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Star, ArrowRight, X } from "lucide-react";
import { DriverAvatar } from "@/components/ui";
import { StatusBadge } from "@/components/ui";
import type { Booking } from "@/lib/api/bookings";
import type { PendingRating } from "@/lib/api/ratings";

type BookingExt = Booking & {
  tripId?: string;
  totalPrice?: number;
  trip?: {
    id?: string;
    originCity?: string;
    destinationCity?: string;
    departureAt?: string;
    driver?: { name?: string; avatarUrl?: string | null };
  };
};

const ACTIVE_STATUSES = new Set(["pending", "viewed", "accepted"]);

function fmtDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function PassengerCard({ booking, pendingRating, onRate, onCancel }: {
  booking: BookingExt;
  pendingRating?: PendingRating;
  onRate?: () => void;
  onCancel?: () => void;
}) {
  const t = useTranslations("bookings");
  const trip = booking.trip;
  const tripId = booking.tripId ?? trip?.id;
  const status = booking.status as string;

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 transition-shadow hover:shadow-md">
      <Link href={tripId ? `/trips/${tripId}` : "#"} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <DriverAvatar
              name={trip?.driver?.name ?? t("driver_fallback")}
              src={trip?.driver?.avatarUrl}
              size="md"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-extrabold text-ink-900">
                {trip?.originCity} → {trip?.destinationCity}
              </p>
              <p className="text-[12px] text-ink-500">
                {trip?.driver?.name ?? t("driver_fallback")} · {fmtDate(trip?.departureAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <StatusBadge status={status} />
            <ArrowRight className="h-4 w-4 text-ink-400" />
          </div>
        </div>

        <div className="mt-3 flex gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{t("seats_label")}</p>
            <p className="text-[13px] font-bold text-ink-900">{booking.seatsCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{t("sum_label")}</p>
            <p className="text-[13px] font-bold text-brand-700">
              {booking.totalPrice ?? "—"} {t("som")}
            </p>
          </div>
        </div>
      </Link>

      {(pendingRating || onCancel) && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
          {pendingRating && onRate && (
            <button
              type="button"
              onClick={onRate}
              className="flex items-center gap-1.5 rounded-2xl bg-accent-500 px-4 py-2 text-[13px] font-bold text-[#4A2C00] hover:bg-accent-600"
            >
              <Star className="h-4 w-4" />
              {t("rate_btn")}
            </button>
          )}
          {onCancel && ACTIVE_STATUSES.has(booking.status as string) && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-2xl border border-ink-200 px-4 py-2 text-[13px] font-bold text-ink-600 hover:border-coral-200 hover:text-coral-600"
            >
              <X className="h-4 w-4" />
              {t("cancel_btn")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
