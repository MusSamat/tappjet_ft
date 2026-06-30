"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RouteStops, ListingMetrics } from "@/components/ui";
import type { TripListItem } from "@/lib/api/trips";

function fmtDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function DriverTripCard({ trip, onComplete, completing, onCancel }: {
  trip: TripListItem;
  onComplete?: () => void;
  completing?: boolean;
  onCancel?: () => void;
}) {
  const t = useTranslations("bookings");
  const inTransit = trip.status === "active" && new Date(trip.departureAt ?? 0) <= new Date();
  const statusLabel = inTransit
    ? t("trip_in_transit")
    : trip.status === "active"
      ? t("trip_active")
      : trip.status === "cancelled"
        ? t("trip_cancelled")
        : t("trip_completed");
  const statusClass = inTransit
    ? "bg-sky-50 text-sky-700"
    : trip.status === "active" ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-gray-600";

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 transition-shadow hover:shadow-md">
      <Link href={`/trips/${trip.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[16px] font-extrabold text-gray-900">
              {trip.originCity} → {trip.destinationCity}
            </p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              {fmtDate(trip.departureAt)} · {trip.pricePerSeat} {t("som")}
            </p>
            <RouteStops pickup={trip.pickupCities} dropoff={trip.dropoffCities} className="mt-1.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", statusClass)}>
              {statusLabel}
            </span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("seats_free_label")}</p>
            <p className="text-[14px] font-bold text-gray-900">{trip.seatsAvailable}/{trip.seatsTotal}</p>
          </div>
          {trip.metrics && <ListingMetrics metrics={trip.metrics} />}
        </div>
      </Link>
      {(inTransit || (!inTransit && trip.status === "active")) && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          {inTransit && onComplete && (
            <button
              type="button"
              onClick={onComplete}
              disabled={completing}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {completing ? t("completing") : t("complete_trip_btn")}
            </button>
          )}
          {!inTransit && trip.status === "active" && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-bold text-gray-600 hover:border-coral-200 hover:text-coral-600"
            >
              <X className="h-4 w-4" />
              {t("cancel_trip_btn")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
