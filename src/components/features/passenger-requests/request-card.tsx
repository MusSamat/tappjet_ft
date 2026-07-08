"use client";

import Link from "next/link";
import { memo } from "react";
import { CalendarClock, ChevronRight, Eye, Hand, MapPin, Star } from "lucide-react";
import { ContactRevealButton } from "@/components/ui/contact-reveal-button";
import { useAuth } from "@/store/auth";
import { useTranslations } from "next-intl";
import type { PassengerRequest } from "@/lib/api/passenger-requests";
import { DriverAvatar } from "@/components/ui/driver-avatar";
import { LikeButton } from "@/components/ui/like-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils/cn";

// Passenger-request card — design-spec §1.6: grape accent, square avatar,
// «ищет» tag, ink-50 route block with grape spine, meta row + chevron.

interface RequestCardProps {
  request: PassengerRequest;
  href?: string;
  className?: string;
  onClick?: () => void;
  onCancel?: () => void;
  cancelLoading?: boolean;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function RequestCardInner({
  request,
  href,
  className,
  onClick,
  onCancel,
  cancelLoading,
}: RequestCardProps) {
  const t = useTranslations("card");
  const { passenger } = request;
  // Own-post check by user id (metrics is not a reliable ownership signal).
  const myId = useAuth((s) => s.user?.id);
  const isOwn = Boolean(myId && request.passengerId === myId);
  const showRating = passenger.rating !== null && passenger.ratingCount >= 3;
  const isOpen = request.status === "open";

  const content = (
    <article
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-3.5 shadow-card ring-1 ring-ink-100 transition hover:-translate-y-0.5 hover:shadow-lift dark:bg-ink-900 dark:ring-ink-800",
        !isOpen && "opacity-60",
        request.myResponse && "bg-emerald-50/60 ring-emerald-200 dark:bg-emerald-500/[0.07] dark:ring-emerald-500/25",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {/* Type pill — makes it unmistakable this is a passenger looking for a ride */}
      <div className="mb-2 flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-grape-100 px-2 py-0.5 text-[11px] font-900 uppercase tracking-wide text-grape-600 dark:bg-grape-500/20 dark:text-grape-300">
          <Hand className="h-3 w-3" aria-hidden="true" />
          {t("type_passenger")}
        </span>
        {request.myResponse && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-900 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            {t("responded")}
          </span>
        )}
      </div>

      {/* Row 1 — date (hero) + seats needed; heart top-right */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[17px] font-900 leading-tight text-ink-900 dark:text-white">
            <CalendarClock className="h-4 w-4 shrink-0 text-grape-500 dark:text-grape-400" aria-hidden="true" />
            <span className="truncate">
              {fmtDate(request.departureDate)}
              {request.flexible && ` · ${t("flexible")}`}
            </span>
          </div>
          {/* Route — thin, small: context, not the hero */}
          <div className="mt-1 truncate text-[14px] font-600 text-ink-500 dark:text-ink-400">
            {request.originCity} → {request.destinationCity}
          </div>
        </div>
        <div className="flex shrink-0 items-start gap-1">
          <div className="text-right">
            <div className="text-[11px] font-600 text-ink-400">{t("needs")}</div>
            <div className="text-[18px] font-900 leading-none text-grape-600 dark:text-grape-300">
              {request.seatsNeeded}
              <span className="text-[11px]"> {t("seats_unit", { n: request.seatsNeeded })}</span>
            </div>
          </div>
          <LikeButton
            targetType="passenger_request"
            id={request.id}
            liked={!!request.liked}
            size="sm"
            className="-my-1 shrink-0 bg-transparent hover:bg-transparent"
          />
        </div>
      </div>

      {/* Row 2 — passenger strip (mirrors TripCard's driver strip) */}
      <div className="mt-2.5 flex items-center gap-2 border-t border-ink-100 pt-2.5 dark:border-ink-800">
        <DriverAvatar name={passenger.name} src={passenger.avatarUrl} size="md" shape="square" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[14px] font-800 leading-tight text-ink-900 dark:text-white">
            <span className="truncate">{passenger.name.split(" ")[0]}</span>
            {showRating ? (
              <span className="flex shrink-0 items-center gap-0.5 font-700 text-ink-500 dark:text-ink-400">
                <Star className="h-3 w-3 fill-accent-400 text-accent-400" aria-hidden="true" />
                {passenger.rating!.toFixed(1)}
              </span>
            ) : (
              <span className="shrink-0 text-[12px] font-800 text-grape-600 dark:text-grape-300">
                {t("new")}
              </span>
            )}
          </div>
          {request.comment && (
            <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[13px] font-600 text-ink-400">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{request.comment}</span>
            </div>
          )}
        </div>
        {request.metrics && (
          <span
            className="flex shrink-0 items-center gap-1 text-[14px] font-700 text-ink-500 dark:text-ink-400"
            title={t("views_title", { n: request.metrics.views })}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            {request.metrics.views}
          </span>
        )}
        {!isOpen && <StatusBadge status={request.status} className="shrink-0" />}
        {/* Call-first: one tap → number + dialer. Never on own requests. */}
        {!isOwn && isOpen && (
          <ContactRevealButton variant="icon" target="request" id={request.id} />
        )}
        <ChevronRight className="h-4 w-4 shrink-0 text-grape-400" aria-hidden="true" />
      </div>

      {/* Cancel (own list only) */}
      {onCancel && isOpen && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCancel(); }}
          disabled={cancelLoading}
          className="mt-2.5 w-full rounded-xl bg-danger-50 py-2 text-[14px] font-900 text-danger-600 transition-colors hover:bg-danger-100 disabled:opacity-40 dark:bg-danger-500/10 dark:hover:bg-danger-500/20"
        >
          {cancelLoading ? "…" : t("cancel")}
        </button>
      )}
    </article>
  );

  if (href && !onClick) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

export const RequestCard = memo(RequestCardInner);
