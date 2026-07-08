"use client";

import Link from "next/link";
import {
  AlarmClock,
  Ban,
  Briefcase,
  CarFront,
  CheckCircle2,
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
import { useAuth } from "@/store/auth";
import { formatDepartureLabel } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { ContactRevealButton } from "./contact-reveal-button";
import { StatusBadge } from "./status-badge";
import { VerifiedBadge } from "./verified-badge";
import { DriverAvatar } from "./driver-avatar";
import { LikeButton } from "./like-button";

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
  /** Viewer already has an active booking on this trip → show a badge. */
  booked?: boolean;
}

const BADGE_BASE =
  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-900";

function TripCardInner({
  trip,
  href,
  className,
  active,
  onClick,
  showBookButton,
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
  const seatsTotal = trip.seatsTotal ?? 0;
  const price = trip.pricePerSeat ?? 0;
  const luggage = trip.luggage as "yes" | "small" | "no" | undefined;
  const stops = trip.pickupCities?.length ? trip.pickupCities.join(" · ") : null;
  const car = driver.car ?? null;
  // Own-post check by user id — `metrics` is owner-only in the search feed but
  // not guaranteed in every list, so it can't be the ownership signal.
  const myId = useAuth((s) => s.user?.id);
  const isOwn = Boolean(myId && trip.driverId === myId);

  // «Сегодня, 06:00» → «Сегодня, 06:00–11:00» when the driver set a window.
  let when = trip.departureAt ? formatDepartureLabel(trip.departureAt, locale) : "";
  if (when && trip.departureWindowEnd) {
    const end = new Date(trip.departureWindowEnd);
    when += `–${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
  }

  // Seats indicator (Yandex «Свободно 4 из 4») — ALWAYS present on the card.
  // 0 / 1 free get their urgency variants; feature badges render alongside.
  let badge: ReactNode;
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
  } else {
    badge = (
      <span className={cn(BADGE_BASE, "bg-ink-800 text-white dark:bg-ink-700 dark:text-ink-100")}>
        {t("free_seats", { free: seatsAvailable, total: seatsTotal })}
      </span>
    );
  }

  let featureBadge: ReactNode = null;
  if (instant) {
    featureBadge = (
      <span className={cn(BADGE_BASE, "bg-accent-500 text-accent-ink")}>
        <Zap className="h-3 w-3" aria-hidden="true" />
        {t("instant")}
      </span>
    );
  } else if (wholeCabin) {
    featureBadge = (
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
        booked && "bg-emerald-50/60 ring-emerald-200 dark:bg-emerald-500/[0.07] dark:ring-emerald-500/25",
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

      {/* Row 0 — type pill + seats badge (Yandex hierarchy: state first) */}
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5 pr-8">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-900 uppercase tracking-wide text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
          <CarFront className="h-3 w-3" aria-hidden="true" />
          {t("type_driver")}
        </span>
        {badge}
        {featureBadge}
        {trip.status && trip.status !== "active" && (
          <StatusBadge status={trip.status} className="shrink-0" />
        )}
      </div>

      {/* Row 1 — departure time (hero, window-aware) + price */}
      <div className="flex items-start justify-between gap-3 pr-7">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[17px] font-900 leading-tight text-ink-900 dark:text-white">
            <Clock className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <span className="truncate">{when}</span>
          </div>
          {/* Route — thin, small: context, not the hero (route is already chosen) */}
          <div className="mt-1 truncate text-[14px] font-600 text-ink-500 dark:text-ink-400">
            {trip.originCity ?? ""} → {trip.destinationCity ?? ""}
            {stops && ` · ${t("via", { stops })}`}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[20px] font-900 leading-none text-brand-700 dark:text-brand-300">
            {price.toLocaleString("ru-RU")}
            <span className="text-[11px]">{t("som")}</span>
          </div>
          <div className="text-[11px] font-600 text-ink-400">{t("per_seat")}</div>
        </div>
      </div>

      {/* Row 2 — driver strip (Yandex: name ★rating / car · plate) */}
      <div className="mt-2.5 flex items-center gap-2 border-t border-ink-100 pt-2.5 dark:border-ink-800">
        <DriverAvatar name={driverName} src={driver.avatarUrl ?? null} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[15px] font-800 leading-tight text-ink-900 dark:text-white">
            <span className="truncate">{driverName}</span>
            {driver.verified && <VerifiedBadge />}
            {rating !== null && ratingCount >= 3 ? (
              <span className="flex shrink-0 items-center gap-0.5 font-700 text-ink-500 dark:text-ink-400">
                <Star className="h-3 w-3 fill-accent-400 text-accent-400" aria-hidden="true" />
                {rating.toFixed(1)}
              </span>
            ) : (
              <span className="shrink-0 text-[12px] font-800 text-brand-600 dark:text-brand-300">
                {t("new")}
              </span>
            )}
          </div>
          {car && (car.make || car.model) && (
            <div className="mt-0.5 truncate text-[14px] font-600 text-ink-500 dark:text-ink-400">
              {[car.make, car.model].filter(Boolean).join(" ")}
              {car.plate && ` · ${car.plate}`}
            </div>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-ink-400" aria-hidden="true">
          {luggage && luggage !== "no" && <Briefcase className="h-3.5 w-3.5" />}
          {wholeCabin ? <Sofa className="h-3.5 w-3.5 text-sky-500" /> : <Music className="h-3.5 w-3.5" />}
        </span>
        {trip.metrics && (
          <span className="flex shrink-0 items-center gap-0.5 text-[13px] font-600 text-ink-400">
            <Eye className="h-3 w-3" aria-hidden="true" />
            {trip.metrics.views}
          </span>
        )}
        {/* Call-first: one tap → number + dialer. Never on own trips.
            Hidden when the CTA row below renders its own call button. */}
        {!isOwn && trip.id && seatsAvailable > 0 && !showBookButton && (
          <ContactRevealButton variant="icon" target="trip" id={trip.id} />
        )}
      </div>

      {/* Direct book CTA (mobile lists) — disabled once the viewer has booked */}
      {showBookButton && trip.id && seatsAvailable > 0 && (
        // Booking (¾) + call (¼) share one row — book is primary, call is the
        // quick alternative (call-first market).
        <div className="mt-2.5 flex items-stretch gap-2">
          {booked ? (
            <div
              className="flex flex-[3] items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-[14px] font-900 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              aria-disabled="true"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t("booked")}
            </div>
          ) : (
            <Link
              href={`/trips/${trip.id}/book`}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-[3] items-center justify-center rounded-xl bg-accent-500 py-2 text-[14px] font-900 text-accent-ink transition-colors hover:bg-accent-400"
            >
              {t("book")}
            </Link>
          )}
          {!isOwn && (
            <ContactRevealButton
              variant="icon"
              target="trip"
              id={trip.id}
              className="h-auto w-auto flex-1 self-stretch rounded-xl"
            />
          )}
        </div>
      )}
    </article>
  );

  if (href && !onClick) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

export const TripCard = memo(TripCardInner);
