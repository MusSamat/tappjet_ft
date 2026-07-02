"use client";

import Link from "next/link";
import {
  AlarmClock,
  Ban,
  Briefcase,
  Clock,
  Eye,
  Music,
  ShieldCheck,
  Sofa,
  Star,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { memo, useCallback, useEffect, useRef } from "react";
import type { Locale } from "@/i18n.config";
import type { ReactNode } from "react";
import type { TripListItem } from "@/lib/api/trips";
import { usePrefetchTrip } from "@/lib/hooks/use-prefetch-trip";
import { formatDepartureLabel } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { DriverAvatar } from "./driver-avatar";
import { LikeButton } from "./like-button";
import { SeatMeter } from "./seat-meter";

// Ride card — design-spec §1.5: vertical route spine, price with «с»
// superscript, single priority badge, driver strip with seat meter.

interface TripCardProps {
  trip: TripListItem;
  href?: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  /** Show a direct "Забронировать" button — use on mobile list where there's no detail pane */
  showBookButton?: boolean;
  /** «Мгновенно» badge — pass when the trip supports instant booking */
  instant?: boolean;
  /** «Весь салон» badge + sofa amenity */
  wholeCabin?: boolean;
}

const BADGE_BASE =
  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-900";

function TripCardInner({
  trip,
  href,
  className,
  active,
  onClick,
  showBookButton,
  instant,
  wholeCabin,
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
  const seatsTotal = trip.seatsTotal ?? 0;
  const price = trip.pricePerSeat ?? 0;
  const luggage = trip.luggage as "yes" | "small" | "no" | undefined;
  const stops = trip.pickupCities?.length ? trip.pickupCities.join(" · ") : null;

  let badge: ReactNode = null;
  if (seatsAvailable === 0) {
    badge = (
      <span className={cn(BADGE_BASE, "bg-ink-200 text-ink-500 dark:bg-ink-700 dark:text-ink-300")}>
        <Ban className="h-3 w-3" aria-hidden="true" />
        {t("no_seats")}
      </span>
    );
  } else if (seatsAvailable === 1) {
    badge = (
      <span className={cn(BADGE_BASE, "bg-accent-500 text-accent-ink")}>
        <AlarmClock className="h-3 w-3" aria-hidden="true" />
        {t("last_seat")}
      </span>
    );
  } else if (instant) {
    badge = (
      <span className={cn(BADGE_BASE, "bg-accent-500 text-accent-ink")}>
        <Zap className="h-3 w-3" aria-hidden="true" />
        {t("instant")}
      </span>
    );
  } else if (wholeCabin) {
    badge = (
      <span className={cn(BADGE_BASE, "bg-sky-500 text-white")}>
        <Sofa className="h-3 w-3" aria-hidden="true" />
        {t("whole_cabin")}
      </span>
    );
  }

  const content = (
    <article
      ref={cardRef}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-3.5 shadow-card ring-1 ring-ink-100 transition hover:-translate-y-0.5 hover:shadow-lift dark:bg-ink-900 dark:ring-ink-800",
        active && "ring-2 ring-brand-500 dark:ring-brand-500",
        className,
      )}
      onClick={onClick}
      onPointerEnter={doPrefetch}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {/* Heart — absolute top-right */}
      {trip.id && (
        <LikeButton
          targetType="trip"
          id={trip.id}
          liked={!!trip.liked}
          size="sm"
          className="absolute right-1.5 top-1.5 z-10 bg-transparent text-coral-400 hover:bg-transparent"
        />
      )}

      {/* Row 1 — vertical route spine + cities + price */}
      <div className="flex items-center gap-2.5 pr-7">
        <div className="flex shrink-0 flex-col items-center self-stretch py-1" aria-hidden="true">
          <span className="h-2 w-2 shrink-0 rounded-full border-2 border-brand-600" />
          <span className="my-0.5 w-0.5 flex-1 rounded bg-gradient-to-b from-brand-500 to-accent-400" />
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-900 leading-tight text-ink-900 dark:text-white">
            {trip.originCity ?? ""}
          </div>
          <div className="my-0.5 flex items-center gap-1 text-[11px] font-600 text-ink-400">
            <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {trip.departureAt ? formatDepartureLabel(trip.departureAt, locale) : ""}
              {stops && ` · ${t("via", { stops })}`}
            </span>
          </div>
          <div className="truncate text-[15px] font-900 leading-tight text-ink-900 dark:text-white">
            {trip.destinationCity ?? ""}
          </div>
        </div>
        <div className="shrink-0 self-start text-right">
          <div className="text-[18px] font-900 leading-none text-brand-700 dark:text-brand-300">
            {price.toLocaleString("ru-RU")}
            <span className="text-[10px]">{t("som")}</span>
          </div>
          <div className="text-[10px] font-600 text-ink-400">{t("per_seat")}</div>
        </div>
      </div>

      {/* Badge row — single badge by priority: full > last seat > instant > cabin */}
      {badge && <div className="mt-2 pl-[18px]">{badge}</div>}

      {/* Row 2 — driver strip */}
      <div className="mt-2.5 flex items-center gap-2 border-t border-ink-100 pt-2.5 dark:border-ink-800">
        <DriverAvatar name={driverName} src={driver.avatarUrl ?? null} size="xs" />
        <span className="flex min-w-0 items-center gap-0.5 text-[12px] font-700 text-ink-700 dark:text-ink-200">
          <span className="truncate">{driverName.split(" ")[0]}</span>
          {driver.verified && (
            <ShieldCheck className="h-3 w-3 shrink-0 text-brand-600" aria-hidden="true" />
          )}
        </span>
        {rating !== null && ratingCount >= 3 ? (
          <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-700 text-ink-500 dark:text-ink-400">
            <Star className="h-3 w-3 fill-accent-400 text-accent-400" aria-hidden="true" />
            {rating.toFixed(1)}
          </span>
        ) : (
          <span className="shrink-0 text-[11px] font-800 text-brand-600 dark:text-brand-300">
            {t("new")}
          </span>
        )}
        <span className="flex shrink-0 items-center gap-1.5 text-ink-400" aria-hidden="true">
          {luggage && luggage !== "no" && <Briefcase className="h-3.5 w-3.5" />}
          {wholeCabin ? <Sofa className="h-3.5 w-3.5 text-sky-500" /> : <Music className="h-3.5 w-3.5" />}
        </span>
        {trip.metrics && (
          <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-600 text-ink-400">
            <Eye className="h-3 w-3" aria-hidden="true" />
            {trip.metrics.views}
          </span>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <SeatMeter free={seatsAvailable} total={seatsTotal} size="sm" showCount />
        </span>
      </div>

      {/* Direct book CTA (mobile lists) */}
      {showBookButton && trip.id && seatsAvailable > 0 && (
        <Link
          href={`/trips/${trip.id}/book`}
          onClick={(e) => e.stopPropagation()}
          className="mt-2.5 flex w-full items-center justify-center rounded-xl bg-accent-500 py-2 text-[13px] font-900 text-accent-ink transition-colors hover:bg-accent-400"
        >
          {t("book")}
        </Link>
      )}
    </article>
  );

  if (href && !onClick) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export const TripCard = memo(TripCardInner);
