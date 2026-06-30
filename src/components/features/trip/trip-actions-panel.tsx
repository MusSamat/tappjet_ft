"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/store/auth";
import { BookButton } from "@/components/features/trip/book-button";
import { formatPrice } from "@/lib/utils/date";
import { PassengerPanel } from "./_components/passenger-panel";
import { DriverPanel } from "./_components/driver-panel";
import type { TripDetail } from "@/lib/api/trips";

function BookView({ trip }: { trip: TripDetail }) {
  const t = useTranslations("trip_actions");
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5">
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

export function TripActionsPanel({ trip }: { trip: TripDetail }) {
  const { status, user } = useAuth((s) => ({ status: s.status, user: s.user }));
  const tripId = (trip.id as string | undefined) ?? "";

  if (status === "loading" || status === "idle") {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <div className="mb-4 h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
        <div className="mb-3 h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (status === "anonymous") {
    return <BookView trip={trip} />;
  }

  if ((trip.driverId as string | undefined) === user?.id) {
    return <DriverPanel trip={trip} tripId={tripId} />;
  }

  return <PassengerPanel trip={trip} tripId={tripId} />;
}
