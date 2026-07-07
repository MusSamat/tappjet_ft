"use client";

import { useTranslations } from "next-intl";
import { CardSkeletonList } from "@/components/ui/card-skeleton";
import { RequestCard } from "./request-card";
import type { Booking } from "@/lib/api/bookings";

type BookingExt = Booking & {
  passenger?: {
    id?: string;
    name?: string;
    avatarUrl?: string | null;
    rating?: number | null;
    ratingCount?: number;
  };
  trip?: {
    id?: string;
    originCity?: string;
    destinationCity?: string;
    departureAt?: string;
    pricePerSeat?: number;
  };
};

interface Props {
  isLoading: boolean;
  bookings: BookingExt[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  actionPending?: boolean;
}

export function RequestsTab({ isLoading, bookings, onAccept, onReject, actionPending }: Props) {
  const t = useTranslations("bookings");

  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <CardSkeletonList variant="request" />
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center dark:bg-ink-900 dark:border-ink-800">
          <p className="text-[17px] font-bold text-ink-900 dark:text-white">{t("no_requests_label")}</p>
          <p className="mt-2 text-[13px] text-ink-500">{t("requests_hint")}</p>
        </div>
      ) : (
        bookings.map((b) => (
          <RequestCard
            key={b.id}
            booking={b}
            onAccept={() => onAccept(b.id!)}
            onReject={() => onReject(b.id!)}
            actionPending={actionPending}
          />
        ))
      )}
    </div>
  );
}
