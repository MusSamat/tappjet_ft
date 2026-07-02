"use client";

import Link from "next/link";
import { ArrowRight, Clock, MessageCircle, Phone } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  acceptBooking,
  cancelBooking,
  rejectBooking,
  type Booking,
} from "@/lib/api/bookings";
import { Button, DriverAvatar, StatusBadge } from "@/components/ui";
import { formatDepartureLabel } from "@/lib/utils/date";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n.config";

interface BookingPerson {
  id?: string;
  name?: string;
  avatarUrl?: string | null;
  phone?: string | null;
}

interface BookingTrip {
  id?: string;
  originCity?: string;
  destinationCity?: string;
  departureAt?: string;
  driver?: BookingPerson;
}

interface Props {
  booking: Booking;
  role: "passenger" | "driver";
}

function ExpiresCountdown({ expiresAt }: { expiresAt: string }) {
  const t = useTranslations("booking_card");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return <span className="text-caption text-accent-700">{t("expired")}</span>;
  const min = Math.floor(diff / 60000);
  const sec = Math.floor((diff % 60000) / 1000);
  return (
    <span className="text-caption text-accent-700">
      {t("expires_prefix")} {min > 0 ? `${min} ${t("min_short")} ` : ""}{sec}{t("sec_short")}
    </span>
  );
}

export function BookingCard({ booking, role }: Props) {
  const t = useTranslations("booking_card");
  const qc = useQueryClient();
  const locale = useLocale() as Locale;
  const trip = booking.trip as BookingTrip | undefined;
  const passenger = booking.passenger as BookingPerson | undefined;
  const driver = trip?.driver;
  const status = booking.status;
  const isAccepted = status === "accepted";

  const acceptMut = useMutation({
    mutationFn: () => acceptBooking(booking.id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
  const rejectMut = useMutation({
    mutationFn: () => rejectBooking(booking.id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
  const cancelMut = useMutation({
    mutationFn: () => cancelBooking(booking.id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });

  const canAcceptReject = role === "driver" && status === "pending";
  const canCancel =
    (role === "passenger" && (status === "pending" || status === "accepted")) ||
    (role === "driver" && status === "accepted");
  const canChat = status === "accepted" || status === "completed";

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          {trip?.departureAt && (
            <div className="flex items-center gap-2 text-caption font-semibold text-ink-700">
              <Clock className="h-3.5 w-3.5 text-ink-500" aria-hidden="true" />
              {formatDepartureLabel(trip.departureAt, locale)}
            </div>
          )}
          <div className="flex items-center gap-2 text-h2 text-ink-900">
            <span className="truncate">{trip?.originCity}</span>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-ink-500" aria-hidden="true" />
            <span className="truncate">{trip?.destinationCity}</span>
          </div>
        </div>
        {status && <StatusBadge status={status} />}
      </div>

      {role === "driver" && passenger && (
        <div className="flex items-center gap-2 border-t-[0.5px] border-ink-100 pt-3">
          <DriverAvatar name={passenger.name ?? "?"} src={passenger.avatarUrl ?? null} size="sm" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-body text-ink-900">{passenger.name}</span>
            {isAccepted && passenger.phone && (
              <a
                href={`tel:${passenger.phone}`}
                className="flex items-center gap-1 text-caption text-brand-700 hover:underline"
              >
                <Phone className="h-3 w-3" aria-hidden="true" />
                {passenger.phone}
              </a>
            )}
          </div>
          <span className="text-caption text-ink-500">{booking.seatsCount} {t("seats_word")}</span>
        </div>
      )}

      {role === "passenger" && driver && (
        <div className="flex items-center gap-2 border-t-[0.5px] border-ink-100 pt-3">
          <DriverAvatar name={driver.name ?? "?"} src={driver.avatarUrl ?? null} size="sm" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-body text-ink-900">{driver.name}</span>
            {isAccepted && driver.phone && (
              <a
                href={`tel:${driver.phone}`}
                className="flex items-center gap-1 text-caption text-brand-700 hover:underline"
              >
                <Phone className="h-3 w-3" aria-hidden="true" />
                {driver.phone}
              </a>
            )}
          </div>
        </div>
      )}

      {booking.comment && (
        <p className="rounded-xl bg-ink-50 px-3 py-2 text-body-lg text-ink-700">
          «{booking.comment}»
        </p>
      )}

      {status === "pending" && booking.expiresAt && (
        <ExpiresCountdown expiresAt={booking.expiresAt} />
      )}

      {(acceptMut.isError || rejectMut.isError || cancelMut.isError) && (
        <p className="text-caption text-coral-500">{t("action_failed")}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {canAcceptReject && (
          <>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => acceptMut.mutate()}
              disabled={acceptMut.isPending || rejectMut.isPending}
            >
              {acceptMut.isPending ? t("accepting") : t("accept")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => rejectMut.mutate()}
              disabled={acceptMut.isPending || rejectMut.isPending}
            >
              {t("reject")}
            </Button>
          </>
        )}
        {canChat && booking.id && (
          <Link href={`/my/bookings/${booking.id}/chat`}>
            <Button type="button" variant="outline" size="md">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t("chat")}
            </Button>
          </Link>
        )}
        {canCancel && (
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={() => cancelMut.mutate()}
            disabled={cancelMut.isPending}
          >
            {cancelMut.isPending ? t("cancelling") : t("cancel")}
          </Button>
        )}
      </div>
    </article>
  );
}
