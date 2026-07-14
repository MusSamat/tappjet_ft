"use client";

import Link from "next/link";
import {
  ChevronRight,
  Sofa,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { memo, useCallback, useEffect, useRef } from "react";
import type { Locale } from "@/i18n.config";
import type { TripCardItem } from "@/lib/api/trips";
import { usePrefetchTrip } from "@/lib/hooks/use-prefetch-trip";
import { formatDepartureLabel } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { StatusBadge } from "./status-badge";
import { VerifiedBadge } from "./verified-badge";
import { DriverAvatar } from "./driver-avatar";
import { LikeButton } from "./like-button";

// Ride card — «Card F» (Tappjet Card F.html): info-only, no action buttons.
// Big departure time on the left, vertical route spine, cities, like + price
// at the right; below — a compact driver strip (avatar · name ★rating · car)
// with instant/seats at the right, and a minimal «Подробнее ›» tap hint —
// booking/calling live on the trip detail, which opens on tap as before.

interface TripCardProps {
  trip: TripCardItem;
  href?: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  /** «Мгновенно» badge — pass when the trip supports instant booking */
  instant?: boolean;
  /** «Весь салон» badge + sofa amenity */
  wholeCabin?: boolean;
  /** Viewer already has an active booking on this trip → show a badge. */
  booked?: boolean;
}

function TripCardInner({
  trip,
  href,
  className,
  active,
  onClick,
  instant,
  wholeCabin,
  booked,
}: TripCardProps) {
  const t = useTranslations("card");
  const locale = useLocale() as Locale;

  // Prefetch the detail on hover (desktop) or when the card scrolls into view
  // (mobile). Guarded once per card; staleTime dedupes.
  const prefetch = usePrefetchTrip();
  const cardRef = useRef<HTMLElement>(null);
  const prefetchedRef = useRef(false);
  const doPrefetch = useCallback(() => {
    if (prefetchedRef.current || !trip.id) return;
    prefetchedRef.current = true;
    prefetch(trip.id);
  }, [prefetch, trip.id]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || prefetchedRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          doPrefetch();
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [doPrefetch]);
  const driver = trip.driver ?? {};
  const driverName = driver.name ?? "";
  const rating = driver.rating ?? null;
  const ratingCount = driver.ratingCount ?? 0;
  const seatsAvailable = trip.seatsAvailable ?? 0;
  const price = trip.pricePerSeat ?? 0;
  const stops = trip.pickupCities?.length ? trip.pickupCities.join(" · ") : null;
  const car = driver.car ?? null;

  // «Сегодня, 06:00» → time hero «06:00» + small date «Сегодня» (Card F puts
  // the big time on the left; the date rides underneath so mixed-date lists —
  // «Мои», «Избранное» — stay unambiguous). Window end renders as a small
  // suffix next to the hero time.
  const label = trip.departureAt ? formatDepartureLabel(trip.departureAt, locale) : "";
  const sep = label.lastIndexOf(", ");
  const dateLabel = sep > -1 ? label.slice(0, sep) : "";
  const timeLabel = sep > -1 ? label.slice(sep + 2) : label;
  let windowEnd = "";
  if (timeLabel && trip.departureWindowEnd) {
    const end = new Date(trip.departureWindowEnd);
    windowEnd = `–${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
  }

  const soldOut = seatsAvailable === 0;
  const inactive = Boolean(trip.status && trip.status !== "active");

  const content = (
    <article
      ref={cardRef}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-3.5 shadow-card ring-1 ring-ink-100 transition hover:-translate-y-0.5 hover:shadow-lift dark:bg-ink-900 dark:ring-ink-800",
        (soldOut || inactive) && "opacity-55",
        active && "ring-2 ring-brand-500 dark:ring-brand-500",
        booked && "bg-emerald-50/60 ring-emerald-200 dark:bg-emerald-500/[0.07] dark:ring-emerald-500/25",
        className,
      )}
      onClick={onClick}
      onPointerEnter={doPrefetch}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {/* Row 0 — only when the trip left the active state («Мои» lists) */}
      {inactive && trip.status && (
        <div className="mb-2 flex items-center gap-1.5">
          <StatusBadge status={trip.status} className="shrink-0" />
        </div>
      )}

      {/* Row 1 — Card F: big departure time · route spine · cities · ♥ price */}
      <div className="flex items-stretch gap-3">
        <div className="flex min-w-[52px] shrink-0 flex-col">
          <span className="text-[10px] font-800 uppercase tracking-wide text-ink-400">
            {t("depart_label")}
          </span>
          <span className="font-disp text-[19px] font-700 leading-tight text-ink-900 dark:text-white">
            {timeLabel}
            {windowEnd && (
              <span className="font-sans text-[12px] font-700 text-ink-400">{windowEnd}</span>
            )}
          </span>
          {dateLabel && (
            <span className="mt-0.5 text-[11px] font-700 text-ink-400">{dateLabel}</span>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-center py-1" aria-hidden="true">
          <span className="h-2 w-2 rounded-full border-[1.5px] border-brand-600" />
          <span className="my-0.5 w-px flex-1 bg-ink-200 dark:bg-ink-700" />
          <span className="h-2 w-2 rounded-full bg-accent-500" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <p className="truncate text-[15px] font-800 leading-tight text-ink-900 dark:text-white">
            {trip.originCity ?? ""}
          </p>
          {stops && (
            <p className="truncate text-[11px] font-600 text-ink-400">{t("via", { stops })}</p>
          )}
          <p className="truncate text-[15px] font-800 leading-tight text-ink-900 dark:text-white">
            {trip.destinationCity ?? ""}
          </p>
        </div>
        {/* Like sits right before the price, with a gap */}
        <div className="flex shrink-0 items-start gap-2 self-start">
          {trip.id && (
            <LikeButton
              targetType="trip"
              id={trip.id}
              liked={!!trip.liked}
              size="sm"
              className="-mt-1 bg-transparent text-coral-400 hover:bg-transparent"
            />
          )}
          <div className="text-right">
            <p className="font-disp whitespace-nowrap text-[18px] font-700 leading-none text-brand-700 dark:text-brand-300">
              {price.toLocaleString("ru-RU")}
              <span className="font-sans text-[11px] font-700">{t("som")}</span>
            </p>
            <p className="text-[11px] font-600 text-ink-400">{t("per_seat")}</p>
          </div>
        </div>
      </div>

      {/* Row 2 — driver strip: avatar · name ★rating · car …· ⚡ · seats */}
      <div className="mt-2.5 flex items-center gap-2 border-t border-ink-100 pt-2.5 dark:border-ink-800">
        <DriverAvatar name={driverName} src={driver.avatarUrl ?? null} size="sm" />
        <p className="min-w-0 flex items-center gap-1 truncate text-[13px] font-800 text-ink-800 dark:text-ink-100">
          <span className="truncate">{driverName}</span>
          {driver.verified && <VerifiedBadge />}
        </p>
        {rating !== null && ratingCount >= 3 ? (
          <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-700 text-ink-400">
            <Star className="h-3 w-3 fill-accent-400 text-accent-400" aria-hidden="true" />
            {rating.toFixed(1)}
          </span>
        ) : (
          <span className="shrink-0 text-[12px] font-800 text-brand-600 dark:text-brand-300">
            {t("new")}
          </span>
        )}
        {car && (car.make || car.model) && (
          <span className="min-w-0 truncate text-[12px] font-600 text-ink-400">
            · {[car.make, car.model].filter(Boolean).join(" ")}
          </span>
        )}

        <span className="ml-auto flex shrink-0 items-center gap-2">
          {instant && <Zap className="h-4 w-4 text-accent-500" aria-hidden="true" />}
          {wholeCabin && <Sofa className="h-4 w-4 text-sky-500" aria-hidden="true" />}
          {soldOut ? (
            <span className="text-[11px] font-800 text-ink-400">{t("no_seats")}</span>
          ) : (
            <span
              className={cn(
                "flex items-center gap-1 text-[12px] font-800",
                seatsAvailable === 1
                  ? "text-accent-600 dark:text-accent-400"
                  : "text-brand-700 dark:text-brand-300",
              )}
            >
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {seatsAvailable}
            </span>
          )}
        </span>
      </div>

      {/* Minimal tap hint — the whole card opens the full ride info, as before */}
      <div
        className="mt-1.5 flex items-center justify-center gap-0.5 text-[12px] font-700 text-ink-400"
        aria-hidden="true"
      >
        {t("details_hint")}
        <ChevronRight className="h-3.5 w-3.5" />
      </div>

    </article>
  );

  if (href && !onClick) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

export const TripCard = memo(TripCardInner);
