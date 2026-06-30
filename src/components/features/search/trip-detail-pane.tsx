"use client";

import Link from "next/link";
import { Shield, Star, Car, Luggage, Lock, MessageCircle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TripListItem } from "@/lib/api/trips";
import { formatDepartureLabel, formatDurationMin } from "@/lib/utils/date";
import { DriverAvatar } from "@/components/ui/driver-avatar";
import { Button } from "@/components/ui/button";
import { RouteStops } from "@/components/ui/route-stops";
import { LikeButton } from "@/components/ui/like-button";
import { ListingMetrics } from "@/components/ui/listing-metrics";
import { ListingTypeBadge } from "@/components/ui/listing-type-badge";
import { SeatStack } from "@/components/ui/seat-stack";
import { useAuth } from "@/store/auth";

interface Props {
  trip: TripListItem;
}

export function TripDetailPane({ trip }: Props) {
  const t = useTranslations("search");
  const authStatus = useAuth((s) => s.status);
  const me = useAuth((s) => s.user);
  const isOwnTrip = !!(trip.driverId && me?.id && trip.driverId === me.id);
  const driver = trip.driver ?? {};
  const rating = driver.rating ?? null;
  const ratingCount = driver.ratingCount ?? 0;
  const seatsAvailable = trip.seatsAvailable ?? 0;
  const seatsTotal = trip.seatsTotal ?? 0;
  const luggage = trip.luggage as "yes" | "small" | "no" | undefined;

  const PREF_LABELS: Record<string, string> = {
    silence: t("pref_silence"),
    music: t("pref_music"),
    no_smoking: t("pref_no_smoking"),
    pets: t("pref_pets"),
  };

  const preferences = Object.entries((trip as { preferences?: Record<string, boolean> }).preferences ?? {})
    .filter(([, v]) => v === true)
    .map(([k]) => k);

  const arrivalTime = trip.departureAt && typeof trip.estimatedDurationMin === "number"
    ? new Date(new Date(trip.departureAt).getTime() + trip.estimatedDurationMin * 60000)
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Type + engagement: metrics (creator only) + like */}
      <div className="flex items-center justify-between gap-2">
        <ListingTypeBadge type="trip" />
        <div className="flex items-center gap-2">
          <ListingMetrics metrics={trip.metrics} />
          {trip.id && <LikeButton targetType="trip" id={trip.id} liked={!!trip.liked} />}
        </div>
      </div>

      {/* Driver */}
      <Link href={`/drivers/${trip.driverId}`} className="flex items-center gap-3 hover:opacity-80">
        <DriverAvatar name={driver.name ?? "?"} src={driver.avatarUrl ?? null} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-extrabold text-gray-900">{driver.name}</span>
            {driver.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-900">
                <Shield className="h-2.5 w-2.5" aria-hidden="true" /> {t("verified")}
              </span>
            )}
          </div>
          {rating !== null && ratingCount >= 3 ? (
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-[14px] font-bold text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-[12px] font-semibold text-gray-500">
                {t("ratings_trips", { ratings: ratingCount, trips: (driver as { tripsCount?: number }).tripsCount ?? 0 })}
              </span>
            </div>
          ) : (
            <span className="mt-1 text-[12px] font-semibold text-gray-500">{t("new_driver")}</span>
          )}
        </div>
      </Link>

      {/* Car */}
      {(trip as { car?: string }).car && (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
          <Car className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />
          <span className="text-[14px] font-bold text-gray-900">{(trip as { car?: string }).car}</span>
        </div>
      )}

      {/* Route */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">{t("route_label")}</p>
        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <div className="flex items-start gap-3">
            {/* Dots */}
            <div className="flex flex-col items-center pt-1">
              <span
                className="h-2.5 w-2.5 rounded-full bg-teal-500 flex-shrink-0"
                style={{ boxShadow: "0 0 0 3px #D0FBEF" }}
                aria-hidden="true"
              />
              <div className="my-1 h-10 w-0.5 bg-gray-300" aria-hidden="true" />
              <span
                className="h-2.5 w-2.5 rounded-full bg-amber-500 flex-shrink-0"
                style={{ boxShadow: "0 0 0 3px #FEEFC7" }}
                aria-hidden="true"
              />
            </div>
            {/* Cities */}
            <div className="flex flex-1 flex-col gap-4">
              <div>
                <p className="text-[16px] font-extrabold text-gray-900">{trip.originCity}</p>
                <RouteStops pickup={trip.pickupCities} className="mt-1" />
                <p className="mt-0.5 text-[12px] font-semibold text-gray-500">
                  {trip.departureAt ? formatDepartureLabel(trip.departureAt) : ""}
                </p>
              </div>
              <div>
                <p className="text-[16px] font-extrabold text-gray-900">{trip.destinationCity}</p>
                <RouteStops dropoff={trip.dropoffCities} className="mt-1" />
                <p className="mt-0.5 text-[12px] font-semibold text-gray-500">
                  {arrivalTime
                    ? t("arrival", { time: arrivalTime.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) })
                    : ""}
                  {typeof trip.estimatedDurationMin === "number"
                    ? ` · ${formatDurationMin(trip.estimatedDurationMin)} ${t("in_transit")}`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seats — stacked people (free vs taken) */}
      {seatsTotal > 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-ink-50 px-4 py-3">
          <SeatStack
            taken={Math.max(0, seatsTotal - seatsAvailable)}
            free={Math.max(0, seatsAvailable)}
            size={26}
          />
          <span className="text-[13px] font-extrabold text-brand-700">
            {t("seats_free", { free: seatsAvailable, total: seatsTotal })}
          </span>
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {luggage === "yes" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700">
            <Luggage className="h-3 w-3" aria-hidden="true" />
            {t("luggage_big")}
          </span>
        )}
        {luggage === "small" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700">
            <Luggage className="h-3 w-3" aria-hidden="true" />
            {t("luggage_small")}
          </span>
        )}
        {trip.priceNegotiable && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900">
            {t("price_negotiable")}
          </span>
        )}
      </div>

      {/* Preferences */}
      {preferences.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">{t("in_trip")}</p>
          <div className="flex flex-wrap gap-2">
            {preferences.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-teal-600 bg-teal-50 px-3 py-1 text-[12px] font-bold text-teal-700"
              >
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
                {PREF_LABELS[p] ?? p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Comment */}
      {(trip as { comment?: string | null }).comment && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">{t("driver_comment")}</p>
          <div className="rounded-2xl bg-teal-50 px-3 py-2.5 text-[13px] leading-relaxed text-gray-700">
            «{(trip as { comment?: string | null }).comment}»
          </div>
        </div>
      )}

      {/* Phone hidden — only for non-drivers */}
      {!isOwnTrip && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" aria-hidden="true" />
            <span className="text-[13px] font-bold text-gray-900">{t("phone_hidden")}</span>
          </div>
          <p className="mt-1 text-[12px] font-semibold text-gray-500">
            {t("phone_hidden_hint")}
          </p>
        </div>
      )}

      {/* Price */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[12px] font-semibold text-gray-500">{t("price_per_seat")}</p>
          <p className="text-[28px] font-extrabold text-teal-700">{t("price_som", { price: trip.pricePerSeat ?? 0 })}</p>
        </div>
        <p className="text-[12px] font-semibold text-gray-500">{t("pay_cash")}</p>
      </div>

      {/* CTA — skeleton while auth loads, own-trip notice, or booking buttons */}
      {(authStatus === "idle" || authStatus === "loading") ? (
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
      ) : isOwnTrip ? (
        <div className="rounded-xl border-[0.5px] border-teal-200 bg-teal-50 p-4 text-center">
          <p className="text-[14px] font-bold text-teal-700">{t("own_trip")}</p>
          <p className="mt-0.5 text-[12px] font-semibold text-teal-600">{t("own_trip_hint")}</p>
        </div>
      ) : (
        <>
          <Link href={`/trips/${trip.id}/book`} className="block">
            <Button variant="submit" size="lg" className="w-full">
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              {t("book_btn")}
            </Button>
          </Link>

          <Link href={`/trips/${trip.id}`} className="block">
            <Button variant="outline" size="lg" className="w-full">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t("contact_driver")}
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
