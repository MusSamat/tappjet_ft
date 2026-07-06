"use client";

import Link from "next/link";
import { memo } from "react";
import { CalendarClock, ChevronRight, Eye, MapPin, Star, Users } from "lucide-react";
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
      {/* Row 1 — passenger identity + seats needed */}
      <div className="flex items-center gap-2.5 pr-1">
        <DriverAvatar
          name={passenger.name}
          src={passenger.avatarUrl}
          size="md"
          shape="square"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-900 text-ink-900 dark:text-white">
              {passenger.name.split(" ")[0]}
            </span>
            <span className="shrink-0 rounded bg-grape-100 px-1.5 py-0.5 text-[10px] font-900 text-grape-600 dark:bg-grape-500/20 dark:text-grape-300">
              {t("seeking")}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[12px] font-600 text-ink-400">
            {showRating ? (
              <>
                <Star className="h-3 w-3 fill-accent-400 text-accent-400" aria-hidden="true" />
                {passenger.rating!.toFixed(1)}
                <span>· {t("reviews", { n: passenger.ratingCount })}</span>
              </>
            ) : (
              <span>{t("new")}</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10px] font-600 text-ink-400">{t("needs")}</div>
          <div className="text-[17px] font-900 leading-none text-grape-600 dark:text-grape-300">
            {request.seatsNeeded}
            <span className="text-[10px]"> {t("seats_unit", { n: request.seatsNeeded })}</span>
          </div>
        </div>
        <LikeButton
          targetType="passenger_request"
          id={request.id}
          liked={!!request.liked}
          size="sm"
          className="-my-1 shrink-0 self-start bg-transparent hover:bg-transparent"
        />
      </div>

      {/* Row 2 — route block on ink-50 with grape spine */}
      <div className="mt-2.5 flex items-center gap-2.5 rounded-2xl bg-ink-50 px-3 py-2 dark:bg-ink-800/60">
        <div className="flex shrink-0 flex-col items-center self-stretch py-1" aria-hidden="true">
          <span className="h-2 w-2 shrink-0 rounded-full border-2 border-grape-500" />
          <span className="my-0.5 w-0.5 flex-1 rounded bg-gradient-to-b from-grape-400 to-accent-400" />
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-900 leading-tight text-ink-900 dark:text-white">
            {request.originCity}
          </div>
          <div className="mt-1 truncate text-[13px] font-900 leading-tight text-ink-900 dark:text-white">
            {request.destinationCity}
          </div>
        </div>
      </div>

      {/* Row 3 — meta */}
      <div className="mt-2.5 flex items-center gap-3 overflow-hidden text-[12px] font-700 text-ink-500 dark:text-ink-400">
        <span className="flex shrink-0 items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5 text-grape-500" aria-hidden="true" />
          {fmtDate(request.departureDate)}
          {request.flexible && ` · ${t("flexible")}`}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          {request.seatsNeeded}
        </span>
        {request.comment && (
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{request.comment}</span>
          </span>
        )}
        {request.metrics && (
          <span className="flex shrink-0 items-center gap-1 text-[11px] font-600 text-ink-400">
            <Eye className="h-3 w-3" aria-hidden="true" />
            {request.metrics.views}
          </span>
        )}
        {!isOpen && <StatusBadge status={request.status} className="shrink-0" />}
        <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-grape-400" aria-hidden="true" />
      </div>

      {/* Cancel (own list only) */}
      {onCancel && isOpen && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCancel(); }}
          disabled={cancelLoading}
          className="mt-2.5 w-full rounded-xl bg-danger-50 py-2 text-[13px] font-900 text-danger-600 transition-colors hover:bg-danger-100 disabled:opacity-40 dark:bg-danger-500/10 dark:hover:bg-danger-500/20"
        >
          {cancelLoading ? "…" : t("cancel")}
        </button>
      )}
    </article>
  );

  if (href && !onClick) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export const RequestCard = memo(RequestCardInner);
