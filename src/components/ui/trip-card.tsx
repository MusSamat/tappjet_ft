"use client";

import Link from "next/link";
import { Shield, Star, Users, Luggage, ArrowRight, Send } from "lucide-react";
import { useState } from "react";
import type { TripListItem } from "@/lib/api/trips";
import { formatDepartureLabel, formatDurationMin } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { DriverAvatar } from "./driver-avatar";
import { RouteStops } from "./route-stops";

interface TripCardProps {
  trip: TripListItem;
  href?: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  /** Show a direct "Забронировать" button — use on mobile list where there's no detail pane */
  showBookButton?: boolean;
}

export function TripCard({ trip, href, className, active, onClick, showBookButton }: TripCardProps) {
  const driver = trip.driver ?? {};
  const driverName = driver.name ?? "Водитель";
  const rating = driver.rating ?? null;
  const ratingCount = driver.ratingCount ?? 0;
  const seatsAvailable = trip.seatsAvailable ?? 0;
  const price = trip.pricePerSeat ?? 0;
  const luggage = trip.luggage as "yes" | "small" | "no" | undefined;
  const carPhotoUrl = driver.car?.photoUrl ?? null;
  const [carImgFailed, setCarImgFailed] = useState(false);

  const content = (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border-[0.5px] border-gray-200 bg-white px-4 py-3 transition-all",
        "hover:border-teal-300 hover:shadow-sm",
        active && "border-teal-500 shadow-[0_0_0_2px_#CCFBF1]",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {/* Car thumbnail — only if photo exists */}
      {carPhotoUrl && !carImgFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={carPhotoUrl}
          alt=""
          className="h-12 w-16 flex-shrink-0 rounded-xl object-cover"
          onError={() => setCarImgFailed(true)}
          aria-hidden="true"
        />
      )}

      {/* Route + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[14px] font-extrabold text-gray-900">
          <span className="truncate">{trip.originCity ?? ""}</span>
          <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" aria-hidden="true" />
          <span className="truncate">{trip.destinationCity ?? ""}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500">
          <span className="font-semibold">
            {trip.departureAt ? formatDepartureLabel(trip.departureAt) : ""}
          </span>
          {typeof trip.estimatedDurationMin === "number" && (
            <span>~{formatDurationMin(trip.estimatedDurationMin)}</span>
          )}
          <span className="inline-flex items-center gap-0.5">
            <Users className="h-3 w-3" aria-hidden="true" />
            {seatsAvailable}
          </span>
          {luggage === "yes" && (
            <span className="inline-flex items-center gap-0.5">
              <Luggage className="h-3 w-3" aria-hidden="true" />
              Багаж
            </span>
          )}
          {trip.priceNegotiable && (
            <span className="font-semibold text-amber-700">Торг</span>
          )}
        </div>
        <RouteStops pickup={trip.pickupCities} dropoff={trip.dropoffCities} className="mt-1" />
      </div>

      {/* Driver + price */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <span className="text-[16px] font-extrabold text-teal-700">{price} сом</span>
        <div className="flex items-center gap-1.5">
          <DriverAvatar name={driverName} src={driver.avatarUrl ?? null} size="sm" />
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-0.5">
              <span className="text-[11px] font-bold text-gray-700">{driverName.split(" ")[0]}</span>
              {driver.verified && (
                <Shield className="h-3 w-3 text-teal-600" aria-label="Верифицирован" />
              )}
            </div>
            {rating !== null && ratingCount >= 3 ? (
              <div className="flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="text-[10px] font-bold text-gray-600">{rating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-[10px] text-teal-600">Новый</span>
            )}
          </div>
        </div>
        {trip.departureAt && (
          <span className="text-[10px] font-semibold text-gray-400">
            {new Date(trip.departureAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
          </span>
        )}
        {showBookButton && trip.id && seatsAvailable > 0 && (
          <Link
            href={`/trips/${trip.id}/book`}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 active:bg-amber-700"
          >
            <Send className="h-2.5 w-2.5" aria-hidden="true" />
            Забронировать
          </Link>
        )}
      </div>
    </div>
  );

  if (href && !onClick) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
