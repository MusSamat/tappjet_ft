"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { MessageCircle, Star, X, Phone } from "lucide-react";
import { listMyBookings, cancelBooking, type Booking } from "@/lib/api/bookings";
import { getPendingRatings } from "@/lib/api/ratings";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui";
import { formatPrice } from "@/lib/utils/date";
import { PassengerCancelModal } from "./passenger-cancel-modal";
import { BookButton } from "@/components/features/trip/book-button";
import type { TripDetail } from "@/lib/api/trips";

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

function tripIdOf(b: BookingExt): string | undefined {
  return b.tripId ?? (b.trip as { id?: string } | undefined)?.id;
}

function BookView({ trip }: { trip: TripDetail }) {
  const t = useTranslations("trip_actions");
  return (
    <div className="rounded-2xl border-[0.5px] border-gray-300 bg-white p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-display font-extrabold text-teal-700">
          {formatPrice((trip.pricePerSeat as number | undefined) ?? 0)}
        </span>
        <span className="text-caption text-gray-500">{t("per_seat")}</span>
      </div>
      {trip.priceNegotiable && (
        <p className="mb-4 rounded-xl bg-amber-50 p-3 text-caption text-amber-900">
          {t("price_negotiable_hint")}
        </p>
      )}
      <BookButton
        tripId={(trip.id as string | undefined) ?? ""}
        seatsAvailable={(trip.seatsAvailable as number | undefined) ?? 0}
        driverId={trip.driverId as string | undefined}
      />
    </div>
  );
}

export function PassengerPanel({ trip, tripId }: { trip: TripDetail; tripId: string }) {
  const t = useTranslations("trip_actions");
  const qc = useQueryClient();

  const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    pending:                { label: t("status_pending"),             color: "text-amber-800", bg: "bg-amber-50",  dot: "bg-amber-500" },
    accepted:               { label: t("status_accepted"),            color: "text-teal-800",  bg: "bg-teal-50",   dot: "bg-teal-500" },
    completed:              { label: t("status_completed"),           color: "text-blue-700",  bg: "bg-blue-50",   dot: "bg-blue-400" },
    rejected:               { label: t("status_rejected"),            color: "text-red-700",   bg: "bg-red-50",    dot: "bg-red-500"  },
    cancelled_by_passenger: { label: t("status_cancelled_by_you"),   color: "text-gray-600",  bg: "bg-gray-100",  dot: "bg-gray-400" },
    cancelled_by_driver:    { label: t("status_cancelled_by_driver"), color: "text-gray-600",  bg: "bg-gray-100",  dot: "bg-gray-400" },
    expired:                { label: t("status_expired"),             color: "text-gray-500",  bg: "bg-gray-50",   dot: "bg-gray-300" },
  };

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ["bookings", "my", "outgoing"],
    queryFn: () => listMyBookings(),
    staleTime: 30_000,
  });

  const { data: ratingsData } = useQuery({
    queryKey: ["ratings", "pending"],
    queryFn: getPendingRatings,
    staleTime: 60_000,
  });

  const myBooking = (bookingsData?.data as BookingExt[] | undefined)?.find(
    (b) => tripIdOf(b) === tripId,
  );
  const pendingRating = ratingsData?.data.find((r) => r.tripId === tripId);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReasons, setCancelReasons] = useState<string[]>([]);

  const cancelMut = useMutation({
    mutationFn: ({ id, reasons }: { id: string; reasons?: string[] }) =>
      cancelBooking(id, reasons),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      setCancelOpen(false);
      setCancelReasons([]);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-2xl border-[0.5px] border-gray-300 bg-white py-10">
        <Spinner size={24} />
      </div>
    );
  }

  if (!myBooking) return <BookView trip={trip} />;

  const status = myBooking.status as string;
  const cfg = STATUS_CFG[status] ?? { label: status, color: "text-gray-700", bg: "bg-gray-50", dot: "bg-gray-400" };
  const driverPhone = (myBooking as BookingExt).trip?.driver?.phone;
  const canCancel = status === "pending" || status === "accepted";
  const canChat = status === "pending" || status === "accepted" || status === "completed";

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border-[0.5px] border-gray-300 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            {t("your_booking")}
          </p>
          <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", cfg.bg, cfg.color)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
          </span>
        </div>

        <div className="mb-4 flex gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("seats_label")}</p>
            <p className="text-[16px] font-bold text-gray-900">{myBooking.seatsCount}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("sum_label")}</p>
            <p className="text-[16px] font-bold text-teal-700">
              {(myBooking as BookingExt).totalPrice ?? "—"} {t("som")}
            </p>
          </div>
        </div>

        {status === "accepted" && driverPhone && (
          <a
            href={`tel:${driverPhone}`}
            className="mb-4 flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2.5 text-[13px] font-bold text-teal-700 hover:bg-teal-100"
          >
            <Phone className="h-4 w-4" />
            {driverPhone}
          </a>
        )}

        <div className="flex flex-col gap-2">
          {pendingRating && (
            <Link href={`/trips/${tripId}/rate/${pendingRating.counterpartId}`}>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-[13px] font-bold text-[#4A2C00] hover:bg-amber-600"
              >
                <Star className="h-4 w-4" />
                {t("rate_trip_btn")}
              </button>
            </Link>
          )}
          {canChat && (
            <Link href={`/my/bookings/${myBooking.id}/chat`}>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 py-2.5 text-[13px] font-bold text-teal-700 hover:bg-teal-100"
              >
                <MessageCircle className="h-4 w-4" />
                {t("open_chat_btn")}
              </button>
            </Link>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              {t("cancel_booking_btn")}
            </button>
          )}
        </div>
      </div>

      {cancelOpen && (
        <PassengerCancelModal
          reasons={cancelReasons}
          onToggle={(r) =>
            setCancelReasons((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]))
          }
          onConfirm={() =>
            cancelMut.mutate({ id: myBooking.id!, reasons: cancelReasons })
          }
          onClose={() => {
            setCancelOpen(false);
            setCancelReasons([]);
          }}
          isPending={cancelMut.isPending}
        />
      )}
    </div>
  );
}
