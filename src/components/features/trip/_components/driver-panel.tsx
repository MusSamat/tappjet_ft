"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Star, X, ArrowRight, Users } from "lucide-react";
import {
  listIncomingBookings,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  type Booking,
} from "@/lib/api/bookings";
import { getPendingRatings } from "@/lib/api/ratings";
import { cancelTrip, type TripDetail } from "@/lib/api/trips";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui";
import { Overlay } from "./modal-overlay";
import { DriverBookingRow } from "./driver-booking-row";

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
    driver?: { phone?: string | null };
  };
};

export function DriverPanel({ trip, tripId }: { trip: TripDetail; tripId: string }) {
  const t = useTranslations("trip_actions");
  const qc = useQueryClient();

  const REJECT_REASONS = [
    t("reject_reason_no_seats"),
    t("reject_reason_not_route"),
    t("reject_reason_plans"),
    t("reject_reason_other"),
  ];

  const { data: incoming, isLoading } = useQuery({
    queryKey: ["bookings", "incoming", tripId],
    queryFn: () => listIncomingBookings(tripId),
    staleTime: 30_000,
  });

  const { data: ratingsData } = useQuery({
    queryKey: ["ratings", "pending"],
    queryFn: getPendingRatings,
    staleTime: 60_000,
  });

  const acceptMut = useMutation({
    mutationFn: acceptBooking,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings", "incoming", tripId] });
      qc.invalidateQueries({ queryKey: ["trips"] });
    },
  });
  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings", "incoming", tripId] });
      setShowRejectFor(null);
      setRejectReason("");
    },
  });
  const cancelTripMut = useMutation({
    mutationFn: () => cancelTrip(tripId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      setCancelTripOpen(false);
    },
  });
  const cancelBookingMut = useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings", "incoming", tripId] });
      setCancelBookingTarget(null);
    },
  });

  const [showRejectFor, setShowRejectFor] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [cancelBookingTarget, setCancelBookingTarget] = useState<string | null>(null);
  const [cancelTripOpen, setCancelTripOpen] = useState(false);

  const bookings = ((incoming?.data ?? []) as BookingExt[]).filter((b) =>
    ["pending", "viewed", "accepted"].includes(b.status as string),
  );
  const pendingCount = bookings.filter(
    (b) => (["pending", "viewed"] as string[]).includes(b.status as string),
  ).length;
  const acceptedCount = bookings.filter((b) => b.status === "accepted").length;
  const pendingRatings = ratingsData?.data.filter((r) => r.tripId === tripId) ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-extrabold text-gray-900">{t("trip_control_title")}</p>
          <span className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold",
            (trip.status as string | undefined) === "active"
              ? "bg-teal-50 text-teal-700"
              : "bg-gray-100 text-gray-600",
          )}>
            {(trip.status as string | undefined) === "active" ? t("trip_active") : t("trip_completed")}
          </span>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-gray-50 p-2.5 text-center">
            <p className="text-[20px] font-extrabold text-gray-900">
              {(trip.seatsAvailable as number | undefined) ?? 0}
            </p>
            <p className="text-[10px] font-bold uppercase text-gray-500">{t("seats_free")}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-2.5 text-center">
            <p className="text-[20px] font-extrabold text-amber-700">{pendingCount}</p>
            <p className="text-[10px] font-bold uppercase text-amber-600">{t("seats_pending")}</p>
          </div>
          <div className="rounded-xl bg-teal-50 p-2.5 text-center">
            <p className="text-[20px] font-extrabold text-teal-700">{acceptedCount}</p>
            <p className="text-[10px] font-bold uppercase text-teal-600">{t("seats_accepted")}</p>
          </div>
        </div>

        {(trip.status as string | undefined) === "active" && (
          <button
            type="button"
            onClick={() => setCancelTripOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-coral-200 py-2.5 text-[13px] font-bold text-coral-600 hover:bg-coral-50"
          >
            <X className="h-4 w-4" />
            {t("cancel_trip_btn")}
          </button>
        )}
      </div>

      {pendingRatings.map((pr) => (
        <Link
          key={pr.counterpartId}
          href={`/trips/${tripId}/rate/${pr.counterpartId}`}
          className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 hover:bg-amber-100"
        >
          <Star className="h-5 w-5 flex-shrink-0 fill-amber-400 text-amber-400" />
          <div className="flex-1">
            <p className="text-[13px] font-bold text-gray-900">{t("rate_passenger_title")}</p>
            <p className="text-[12px] text-gray-600">{pr.counterpartName}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-teal-600" />
        </Link>
      ))}

      {isLoading ? (
        <div className="flex justify-center rounded-2xl border border-ink-100 bg-white py-8">
          <Spinner size={20} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center">
          <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-[14px] font-bold text-gray-700">{t("no_requests")}</p>
        </div>
      ) : (
        bookings.map((b) => {
          const bStatus = b.status as string;
          const passengerId = b.passengerId ?? b.passenger?.id;
          return (
            <DriverBookingRow
              key={b.id}
              id={b.id!}
              bookingId={b.id!}
              passenger={b.passenger}
              passengerId={passengerId}
              seatsCount={b.seatsCount}
              comment={b.comment ?? undefined}
              bStatus={bStatus}
              rejectReasons={REJECT_REASONS}
              showRejectFor={showRejectFor}
              rejectReason={rejectReason}
              acceptPending={acceptMut.isPending}
              rejectPending={rejectMut.isPending}
              onAccept={() => acceptMut.mutate(b.id!)}
              onStartReject={() => { setShowRejectFor(b.id!); setRejectReason(""); }}
              onCancelReject={() => { setShowRejectFor(null); setRejectReason(""); }}
              onConfirmReject={() => rejectMut.mutate(b.id!)}
              onSelectRejectReason={setRejectReason}
              onCancelBooking={() => setCancelBookingTarget(b.id!)}
            />
          );
        })
      )}

      {cancelBookingTarget && (
        <Overlay onClose={() => setCancelBookingTarget(null)}>
          <h2 className="mb-2 text-[18px] font-extrabold text-gray-900">{t("cancel_booking_title")}</h2>
          <div className="mt-2 rounded-2xl border border-coral-200 bg-coral-50 p-4">
            <p className="text-[13px] font-bold text-coral-700">
              {t("cancel_booking_warn")}
            </p>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setCancelBookingTarget(null)}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-bold text-gray-700"
            >
              {t("back_btn")}
            </button>
            <button
              type="button"
              onClick={() => cancelBookingMut.mutate(cancelBookingTarget)}
              disabled={cancelBookingMut.isPending}
              className="flex-1 rounded-xl bg-coral-600 py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
            >
              {cancelBookingMut.isPending ? t("cancelling") : t("confirm_btn")}
            </button>
          </div>
        </Overlay>
      )}

      {cancelTripOpen && (
        <Overlay onClose={() => setCancelTripOpen(false)}>
          <h2 className="mb-2 text-[18px] font-extrabold text-gray-900">{t("cancel_trip_title")}</h2>
          <div className="mt-2 rounded-2xl border border-coral-200 bg-coral-50 p-4">
            <p className="text-[13px] font-bold text-coral-700">
              {t("cancel_trip_warn")}
              {acceptedCount > 0 && ` ${t("cancel_trip_rating_warn")}`}
            </p>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setCancelTripOpen(false)}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-bold text-gray-700"
            >
              {t("back_btn")}
            </button>
            <button
              type="button"
              onClick={() => cancelTripMut.mutate()}
              disabled={cancelTripMut.isPending}
              className="flex-1 rounded-xl bg-coral-600 py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
            >
              {cancelTripMut.isPending ? t("cancelling") : t("confirm_btn")}
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}
