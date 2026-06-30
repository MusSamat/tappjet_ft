"use client";

import { useTranslations } from "next-intl";
import { IncomingRequestSkeletonList } from "@/components/features/my/card-skeletons";
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
}

export function RequestsTab({ isLoading, bookings, onAccept, onReject }: Props) {
  const t = useTranslations("bookings");

  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <IncomingRequestSkeletonList />
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
          <p className="text-[17px] font-bold text-gray-900">{t("no_requests_label")}</p>
          <p className="mt-2 text-[13px] text-gray-500">{t("requests_hint")}</p>
        </div>
      ) : (
        bookings.map((b) => (
          <RequestCard
            key={b.id}
            booking={b}
            onAccept={() => onAccept(b.id!)}
            onReject={() => onReject(b.id!)}
          />
        ))
      )}
    </div>
  );
}
