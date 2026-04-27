"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Star, CheckCircle, XCircle, MessageCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DriverAvatar } from "@/components/ui";
import { StatusBadge } from "./status-badge";
import type { Booking } from "@/lib/api/bookings";

type BookingExt = Booking & {
  tripId?: string;
  passengerId?: string;
  totalPrice?: number;
  passenger?: {
    id?: string;
    name?: string;
    avatarUrl?: string | null;
    rating?: number | null;
    ratingCount?: number;
  };
  trip?: {
    id?: string;
    originCity?: string;
    destinationCity?: string;
    departureAt?: string;
    pricePerSeat?: number;
    driver?: { name?: string; avatarUrl?: string | null };
    driverId?: string;
  };
};

function fmtDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function RequestCard({
  booking,
  onAccept,
  onReject,
}: {
  booking: BookingExt;
  onAccept: () => void;
  onReject: (reason?: string) => void;
}) {
  const t = useTranslations("bookings");
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const passenger = booking.passenger;
  const passengerId = booking.passengerId ?? passenger?.id;
  const trip = booking.trip;
  const tripId = booking.tripId ?? trip?.id;
  const status = booking.status as string;

  const REJECT_REASONS = [
    t("reject_reason_no_seats"),
    t("reject_reason_not_route"),
    t("reject_reason_plans"),
    t("reject_reason_other"),
  ];

  return (
    <div className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {passengerId ? (
            <Link href={`/drivers/${passengerId}`} className="flex-shrink-0">
              <DriverAvatar name={passenger?.name ?? t("passenger_fallback")} src={passenger?.avatarUrl} size="md" />
            </Link>
          ) : (
            <DriverAvatar name={passenger?.name ?? t("passenger_fallback")} src={passenger?.avatarUrl} size="md" />
          )}
          <div>
            <p className="text-[15px] font-extrabold text-gray-900">{passenger?.name}</p>
            {passenger?.rating != null && (
              <div className="flex items-center gap-1 text-[12px] text-gray-500">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-bold">{passenger.rating.toFixed(1)}</span>
                <span>· {t("rating_count_short", { n: passenger.ratingCount })}</span>
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 sm:grid-cols-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("route_label")}</p>
          <p className="text-[13px] font-bold text-gray-900">
            {trip?.originCity} → {trip?.destinationCity}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("departure_label")}</p>
          <p className="text-[13px] font-bold text-gray-900">{fmtDate(trip?.departureAt)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("seats_label")}</p>
          <p className="text-[13px] font-bold text-gray-900">{booking.seatsCount}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("earn_label")}</p>
          <p className="text-[13px] font-bold text-teal-700">
            {((booking.seatsCount ?? 1) * (trip?.pricePerSeat ?? 0))} {t("som")}
          </p>
        </div>
      </div>

      {booking.comment && (
        <div className="mb-3 rounded-xl bg-gray-50 px-4 py-3 text-[13px] text-gray-700">
          <span className="font-bold text-gray-500">{t("comment_label")}: </span>«{booking.comment}»
        </div>
      )}

      {showReject ? (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-bold text-gray-700">{t("reject_reason_label")}</p>
          <div className="flex flex-wrap gap-2">
            {REJECT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  "rounded-full border-[1.5px] px-3 py-1.5 text-[12px] font-bold transition-colors",
                  reason === r
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-700 hover:border-gray-300",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowReject(false); setReason(""); }}
              className="rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-bold text-gray-700 hover:bg-gray-50"
            >
              {t("cancel_label")}
            </button>
            <button
              type="button"
              onClick={() => { onReject(reason); setShowReject(false); }}
              className="rounded-xl bg-red-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-red-700"
            >
              {t("confirm_reject")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(["pending", "viewed"] as string[]).includes(status) && (
            <>
              <button
                type="button"
                onClick={onAccept}
                className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-teal-700"
              >
                <CheckCircle className="h-4 w-4" />
                {t("accept_btn")}
              </button>
              <button
                type="button"
                onClick={() => setShowReject(true)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-bold text-gray-700 hover:bg-gray-50"
              >
                <XCircle className="h-4 w-4" />
                {t("reject_btn")}
              </button>
            </>
          )}
          <Link href={`/my/bookings/${booking.id}/chat`}>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-[13px] font-bold text-teal-700 hover:bg-teal-100"
            >
              <MessageCircle className="h-4 w-4" />
              {t("chat_btn")}
            </button>
          </Link>
          {tripId && (
            <Link href={`/trips/${tripId}`}>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50"
              >
                {t("trip_btn")} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
