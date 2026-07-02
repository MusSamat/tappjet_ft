"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { CardSkeletonList } from "@/components/ui/card-skeleton";
import { SubTabBar } from "./sub-tab-bar";
import { DriverTripCard } from "./driver-trip-card";
import type { TripListItem } from "@/lib/api/trips";

type SubTab = "active" | "history";

interface Props {
  isLoading: boolean;
  driverSubTab: SubTab;
  onSubTabChange: (v: SubTab) => void;
  displayedTrips: TripListItem[];
  activeCount: number;
  historyCount: number;
  completingId: string | undefined;
  onComplete: (id: string) => void;
  onCancel: (trip: TripListItem) => void;
}

export function DriverTab({
  isLoading,
  driverSubTab,
  onSubTabChange,
  displayedTrips,
  activeCount,
  historyCount,
  completingId,
  onComplete,
  onCancel,
}: Props) {
  const t = useTranslations("bookings");

  return (
    <div className="flex flex-col gap-3">
      <SubTabBar
        value={driverSubTab}
        onChange={onSubTabChange}
        activeCount={activeCount}
        historyCount={historyCount}
      />
      {isLoading ? (
        <CardSkeletonList variant="trip" />
      ) : displayedTrips.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
          {driverSubTab === "active" ? (
            <>
              <p className="text-[17px] font-bold text-ink-900">{t("no_published_trips")}</p>
              <p className="mt-2 text-[13px] text-ink-500">{t("no_published_hint")}</p>
              <Link href="/trips/create">
                <button
                  type="button"
                  className="mt-4 mx-auto flex items-center gap-2 rounded-2xl bg-accent-500 px-6 py-2.5 text-[13px] font-bold text-[#4A2C00] hover:bg-accent-600"
                >
                  <Plus className="h-4 w-4" />
                  {t("publish_btn")}
                </button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-[17px] font-bold text-ink-900">{t("no_trip_history")}</p>
              <p className="mt-2 text-[13px] text-ink-500">{t("history_hint")}</p>
            </>
          )}
        </div>
      ) : (
        displayedTrips.map((trip) => (
          <DriverTripCard
            key={trip.id}
            trip={trip}
            onComplete={() => onComplete(trip.id!)}
            completing={completingId === trip.id}
            onCancel={driverSubTab === "active" ? () => onCancel(trip) : undefined}
          />
        ))
      )}
    </div>
  );
}
