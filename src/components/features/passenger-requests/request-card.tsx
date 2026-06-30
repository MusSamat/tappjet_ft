"use client";

import Link from "next/link";
import { ArrowRight, Star, Zap } from "lucide-react";
import type { PassengerRequest } from "@/lib/api/passenger-requests";
import { DriverAvatar } from "@/components/ui/driver-avatar";
import { LikeButton } from "@/components/ui/like-button";
import { ListingMetrics } from "@/components/ui/listing-metrics";
import { ListingTypeBadge } from "@/components/ui/listing-type-badge";
import { SeatStack } from "@/components/ui/seat-stack";
import { cn } from "@/lib/utils/cn";

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

export function RequestCard({
  request,
  href,
  className,
  onClick,
  onCancel,
  cancelLoading,
}: RequestCardProps) {
  const { passenger } = request;
  const showRating = passenger.rating !== null && passenger.ratingCount >= 3;
  const isOpen = request.status === "open";

  const content = (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-3xl border-l-[5px] border-grape-500 bg-white px-4 py-3 shadow-card ring-1 ring-ink-100 transition-all",
        "hover:ring-grape-300",
        onClick && "cursor-pointer",
        !isOpen && "opacity-60",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {/* Avatar */}
      <DriverAvatar
        name={passenger.name}
        src={passenger.avatarUrl}
        size="sm"
        className="mt-0.5 flex-shrink-0 ring-2 ring-grape-100"
      />

      {/* Body */}
      <div className="min-w-0 flex-1">
        {/* Row 1: name + route + price slot */}
        <div className="flex items-center gap-2">
          <ListingTypeBadge type="request" className="flex-shrink-0" />
          <span className="text-[13px] font-bold text-ink-900">{passenger.name.split(" ")[0]}</span>
          {showRating && (
            <span className="flex items-center gap-0.5 text-[11px] text-ink-500">
              <Star className="h-2.5 w-2.5 fill-accent-400 text-accent-400" aria-hidden />
              {passenger.rating!.toFixed(1)}
            </span>
          )}
          <span className="ml-auto flex-shrink-0 text-[11px] font-semibold text-ink-400">
            {fmtDate(request.departureDate)}
          </span>
          <LikeButton
            targetType="passenger_request"
            id={request.id}
            liked={!!request.liked}
            size="sm"
            className="-my-1 flex-shrink-0"
          />
        </div>

        {/* Row 2: route */}
        <div className="mt-0.5 flex items-center gap-1 text-[14px] font-extrabold text-ink-900">
          <span className="truncate">{request.originCity}</span>
          <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-ink-400" aria-hidden />
          <span className="truncate">{request.destinationCity}</span>
        </div>

        {/* Row 3: badges */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-grape-100 px-2 py-0.5 text-[11px] font-extrabold text-grape-600">
            <SeatStack needed={Math.min(request.seatsNeeded, 4)} size={16} />
            нужно {request.seatsNeeded}
          </span>
          {request.flexible && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-extrabold text-accent-700">
              <Zap className="h-3 w-3" aria-hidden />
              Гибко
            </span>
          )}
          {!isOpen && (
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-bold text-ink-500">
              {request.status === "cancelled" ? "Отменена" : "Закрыта"}
            </span>
          )}
          {request.comment && (
            <span className="truncate text-[11px] italic text-ink-400">
              «{request.comment.slice(0, 40)}{request.comment.length > 40 ? "…" : ""}»
            </span>
          )}
        </div>

        {request.metrics && <ListingMetrics metrics={request.metrics} className="mt-1.5" />}
      </div>

      {/* Cancel button (own list only) */}
      {onCancel && isOpen && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCancel(); }}
          disabled={cancelLoading}
          className="flex-shrink-0 rounded-xl border border-ink-200 px-2.5 py-1 text-[11px] font-bold text-ink-500 hover:border-coral-200 hover:text-coral-600 disabled:opacity-40"
        >
          {cancelLoading ? "…" : "Отменить"}
        </button>
      )}
    </div>
  );

  if (href && !onClick) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
