"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Star, CheckCircle, XCircle, MessageCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DriverAvatar } from "@/components/ui";
import { StatusBadge } from "@/components/ui";
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
  actionPending = false,
}: {
  booking: BookingExt;
  onAccept: () => void;
  onReject: (reason?: string) => void;
  /** Disables accept/reject while the mutation is in flight. */
  actionPending?: boolean;
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
    <div className="rounded-2xl border border-ink-100 bg-white p-5 dark:bg-ink-900 dark:border-ink-800">
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
            <p className="text-[15px] font-extrabold text-ink-900 dark:text-white">{passenger?.name}</p>
            {passenger?.rating != null && (
              <div className="flex items-center gap-1 text-[12px] text-ink-500">
                <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                <span className="font-bold">{passenger.rating.toFixed(1)}</span>
                <span>· {t("rating_count_short", { n: passenger.ratingCount })}</span>
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 rounded-xl bg-ink-50 p-3 sm:grid-cols-4 dark:bg-ink-800">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{t("route_label")}</p>
          <p className="text-[13px] font-bold text-ink-900 dark:text-white">
            {trip?.originCity} → {trip?.destinationCity}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{t("departure_label")}</p>
          <p className="text-[13px] font-bold text-ink-900 dark:text-white">{fmtDate(trip?.departureAt)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{t("seats_label")}</p>
          <p className="text-[13px] font-bold text-ink-900 dark:text-white">{booking.seatsCount}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{t("earn_label")}</p>
          <p className="text-[13px] font-bold text-brand-700">
            {((booking.seatsCount ?? 1) * (trip?.pricePerSeat ?? 0))} {t("som")}
          </p>
        </div>
      </div>

      {booking.comment && (
        <div className="mb-3 rounded-xl bg-ink-50 px-4 py-3 text-[13px] text-ink-700 dark:bg-ink-800 dark:text-ink-300">
          <span className="font-bold text-ink-500">{t("comment_label")}: </span>«{booking.comment}»
        </div>
      )}

      {showReject ? (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-bold text-ink-700 dark:text-ink-300">{t("reject_reason_label")}</p>
          <div className="flex flex-wrap gap-2">
            {REJECT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  "rounded-full border-2 px-3 py-1.5 text-[12px] font-bold transition-colors",
                  reason === r
                    ? "border-coral-400 bg-coral-50 text-coral-700"
                    : "border-ink-200 text-ink-700 hover:border-ink-300 dark:border-ink-700 dark:text-ink-300",
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
              className="rounded-2xl border border-ink-200 px-4 py-2 text-[13px] font-bold text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300"
            >
              {t("cancel_label")}
            </button>
            <button
              type="button"
              onClick={() => { onReject(reason); setShowReject(false); }}
              disabled={actionPending}
              className="rounded-2xl bg-coral-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-coral-700 disabled:opacity-50"
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
                disabled={actionPending}
                className="flex items-center gap-1.5 rounded-2xl bg-brand-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {t("accept_btn")}
              </button>
              <button
                type="button"
                onClick={() => setShowReject(true)}
                disabled={actionPending}
                className="flex items-center gap-1.5 rounded-2xl border border-ink-200 px-4 py-2 text-[13px] font-bold text-ink-700 hover:bg-ink-50 disabled:opacity-50 dark:border-ink-700 dark:text-ink-300"
              >
                <XCircle className="h-4 w-4" />
                {t("reject_btn")}
              </button>
            </>
          )}
          <Link href={`/my/bookings/${booking.id}/chat`}>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2 text-[13px] font-bold text-brand-700 hover:bg-brand-100"
            >
              <MessageCircle className="h-4 w-4" />
              {t("chat_btn")}
            </button>
          </Link>
          {tripId && (
            <Link href={`/trips/${tripId}`}>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-2xl border border-ink-200 px-4 py-2 text-[13px] font-bold text-ink-600 hover:bg-ink-50"
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
