"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookingCardSkeletonList } from "@/components/features/my/card-skeletons";
import { SubTabBar } from "./sub-tab-bar";
import { PassengerCard } from "./passenger-card";
import type { Booking } from "@/lib/api/bookings";
import type { PendingRating } from "@/lib/api/ratings";

type SubTab = "active" | "history";

type BookingExt = Booking & {
  tripId?: string;
  trip?: { id?: string };
};

interface Props {
  isLoading: boolean;
  passengerSubTab: SubTab;
  onSubTabChange: (v: SubTab) => void;
  displayedBookings: BookingExt[];
  activeCount: number;
  historyCount: number;
  pendingRatingMap: Map<string, PendingRating>;
  onRate: (pr: PendingRating) => void;
  onCancel: (b: BookingExt) => void;
}

export function PassengerTab({
  isLoading,
  passengerSubTab,
  onSubTabChange,
  displayedBookings,
  activeCount,
  historyCount,
  pendingRatingMap,
  onRate,
  onCancel,
}: Props) {
  const t = useTranslations("bookings");

  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <BookingCardSkeletonList />
      ) : (
        <>
          <SubTabBar
            value={passengerSubTab}
            onChange={onSubTabChange}
            activeCount={activeCount}
            historyCount={historyCount}
          />
          {displayedBookings.length === 0 ? (
            <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
              {passengerSubTab === "active" ? (
                <>
                  <p className="text-[17px] font-bold text-gray-900">{t("no_active_trips")}</p>
                  <p className="mt-2 text-[13px] text-gray-500">{t("no_active_hint")}</p>
                  <Link href="/trips">
                    <button
                      type="button"
                      className="mt-4 rounded-xl bg-teal-600 px-6 py-2.5 text-[13px] font-bold text-white hover:bg-teal-700"
                    >
                      {t("find_trip_btn")}
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-[17px] font-bold text-gray-900">{t("empty_history")}</p>
                  <p className="mt-2 text-[13px] text-gray-500">{t("history_hint")}</p>
                </>
              )}
            </div>
          ) : (
            displayedBookings.map((b) => {
              const tripId = b.tripId ?? b.trip?.id ?? "";
              const pr = pendingRatingMap.get(tripId);
              return (
                <PassengerCard
                  key={b.id}
                  booking={b}
                  pendingRating={pr}
                  onRate={pr ? () => onRate(pr) : undefined}
                  onCancel={passengerSubTab === "active" ? () => onCancel(b) : undefined}
                />
              );
            })
          )}
        </>
      )}
    </div>
  );
}
