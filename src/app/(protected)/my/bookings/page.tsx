"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  listMyBookings,
  listIncomingBookings,
  acceptBooking,
  rejectBooking,
  cancelBooking,
} from "@/lib/api/bookings";
import { listMyTrips } from "@/lib/api/my-trips";
import { getPendingRatings, type PendingRating } from "@/lib/api/ratings";
import { RateModal } from "@/components/features/ratings/rate-modal";
import { useAuth } from "@/store/auth";
import { Container } from "@/components/ui";
import { Confetti } from "@/components/ui/confetti";
import { Plus } from "lucide-react";
import type { Booking } from "@/lib/api/bookings";
import { completeTrip, cancelTrip } from "@/lib/api/trips";
import type { TripListItem } from "@/lib/api/trips";
import { CancelModal } from "./_components/cancel-modal";
import { CancelTripModal } from "./_components/cancel-trip-modal";
import { PassengerTab } from "./_components/passenger-tab";
import { DriverTab } from "./_components/driver-tab";
import { RequestsTab } from "./_components/requests-tab";
import { MainTabBar } from "./_components/main-tab-bar";

type MainTab = "passenger" | "driver" | "requests";
type SubTab = "active" | "history";

type BookingExt = Booking & {
  tripId?: string;
  passengerId?: string;
  totalPrice?: number;
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
    driver?: { name?: string; avatarUrl?: string | null };
    driverId?: string;
  };
};

const ACTIVE_STATUSES = new Set(["pending", "viewed", "accepted"]);
const HISTORY_STATUSES = new Set(["completed", "rejected", "cancelled_by_passenger", "cancelled_by_driver", "cancelled_late", "no_show", "expired"]);

export default function MyBookingsPage() {
  const t = useTranslations("bookings");
  const user = useAuth((s) => s.user);
  const isDriver = user?.roles?.includes("driver") ?? false;
  const [tab, setTab] = useState<MainTab>("passenger");
  const [passengerSubTab, setPassengerSubTab] = useState<SubTab>("active");
  const [driverSubTab, setDriverSubTab] = useState<SubTab>("active");
  const [rateTarget, setRateTarget] = useState<PendingRating | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingExt | null>(null);
  const [cancelTripTarget, setCancelTripTarget] = useState<TripListItem | null>(null);
  const qc = useQueryClient();

  const outgoing = useQuery({
    queryKey: ["bookings", "my", "outgoing"],
    queryFn: () => listMyBookings(),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const incoming = useQuery({
    queryKey: ["bookings", "incoming"],
    queryFn: () => listIncomingBookings(),
    enabled: isDriver,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const myTrips = useQuery({
    queryKey: ["trips", "my", "active"],
    queryFn: () => listMyTrips("active"),
    enabled: isDriver,
    staleTime: 30_000,
  });

  const myPastTrips = useQuery({
    queryKey: ["trips", "my", "past"],
    queryFn: () => listMyTrips("past"),
    enabled: isDriver,
    staleTime: 60_000,
  });

  const myCancelledTrips = useQuery({
    queryKey: ["trips", "my", "cancelled"],
    queryFn: () => listMyTrips("cancelled"),
    enabled: isDriver,
    staleTime: 60_000,
  });

  const inTransitTrips = useQuery({
    queryKey: ["trips", "my", "in_transit"],
    queryFn: () => listMyTrips("in_transit"),
    enabled: isDriver,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const pendingRatings = useQuery({
    queryKey: ["ratings", "pending"],
    queryFn: getPendingRatings,
    staleTime: 60_000,
  });

  const acceptMut = useMutation({
    mutationFn: acceptBooking,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectBooking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: () => {
      setCancelTarget(null);
      void qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const completeMut = useMutation({
    mutationFn: (id: string) => completeTrip(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["trips", "my"] });
      void qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const cancelTripMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelTrip(id, reason),
    onSuccess: () => {
      setCancelTripTarget(null);
      void qc.invalidateQueries({ queryKey: ["trips", "my"] });
    },
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const passengerBookings = (outgoing.data?.data ?? []) as BookingExt[];

  useEffect(() => {
    if (!passengerBookings.length) return;
    const newlyAccepted = passengerBookings
      .filter((b) => b.status === "accepted")
      .find((b) => {
        const key = `tappjet_celebrated_${b.id}`;
        if (localStorage.getItem(key)) return false;
        localStorage.setItem(key, "1");
        return true;
      });
    if (newlyAccepted) setShowConfetti(true);
  }, [passengerBookings]);

  const activePassengerBookings = passengerBookings.filter((b) => ACTIVE_STATUSES.has(b.status as string));
  const historyPassengerBookings = passengerBookings.filter((b) => HISTORY_STATUSES.has(b.status as string));
  const displayedPassengerBookings = passengerSubTab === "active" ? activePassengerBookings : historyPassengerBookings;

  const pendingRatingMap = new Map<string, PendingRating>(
    (pendingRatings.data?.data ?? []).map((pr) => [pr.tripId, pr]),
  );

  const activeTrips = [
    ...(inTransitTrips.data?.data ?? []),
    ...(myTrips.data?.data ?? []),
  ];
  const pastTrips = [
    ...(myPastTrips.data?.data ?? []),
    ...(myCancelledTrips.data?.data ?? []),
  ].sort((a, b) => new Date(b.departureAt ?? 0).getTime() - new Date(a.departureAt ?? 0).getTime());
  const displayedDriverTrips = driverSubTab === "active" ? activeTrips : pastTrips;
  const isDriverTripsLoading = driverSubTab === "active"
    ? myTrips.isLoading || inTransitTrips.isLoading
    : myPastTrips.isLoading || myCancelledTrips.isLoading;

  const requestBookings = ((incoming.data?.data ?? []) as BookingExt[]).filter(
    (b) => (["pending", "viewed", "accepted"] as string[]).includes(b.status as string),
  );
  const requestsCount = requestBookings.filter(
    (b) => (["pending", "viewed"] as string[]).includes(b.status as string),
  ).length;

  const passengerCount = outgoing.isLoading ? null : activePassengerBookings.length;
  const tripsCount = (myTrips.isLoading || inTransitTrips.isLoading) ? null : activeTrips.length;
  const reqCount = incoming.isLoading ? null : requestsCount;

  const TABS = [
    { id: "passenger" as MainTab, label: t("tab_passenger"), labelShort: t("tab_passenger_short"), count: passengerCount },
    ...(isDriver ? [
      { id: "driver" as MainTab, label: t("tab_driver"), labelShort: t("tab_driver_short"), count: tripsCount },
      { id: "requests" as MainTab, label: t("tab_requests"), labelShort: t("tab_requests_short"), count: reqCount, highlight: (reqCount ?? 0) > 0 },
    ] : []),
  ];

  return (
    <>
    <Container className="py-8">
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold text-ink-900">{t("title")}</h1>
          <p className="mt-0.5 text-[12px] font-semibold text-ink-400">
            {t("subtitle")}
          </p>
        </div>
        <Link href="/trips/create">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-2xl bg-accent-500 px-4 py-2.5 text-[13px] font-bold text-[#4A2C00] hover:bg-accent-600"
          >
            <Plus className="h-4 w-4" />
            {t("publish_btn")}
          </button>
        </Link>
      </div>

      <MainTabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === "passenger" && (
        <PassengerTab
          isLoading={outgoing.isLoading}
          passengerSubTab={passengerSubTab}
          onSubTabChange={setPassengerSubTab}
          displayedBookings={displayedPassengerBookings}
          activeCount={activePassengerBookings.length}
          historyCount={historyPassengerBookings.length}
          pendingRatingMap={pendingRatingMap}
          onRate={setRateTarget}
          onCancel={setCancelTarget}
        />
      )}

      {tab === "driver" && (
        <DriverTab
          isLoading={isDriverTripsLoading}
          driverSubTab={driverSubTab}
          onSubTabChange={setDriverSubTab}
          displayedTrips={displayedDriverTrips}
          activeCount={activeTrips.length}
          historyCount={pastTrips.length}
          completingId={completeMut.isPending ? (completeMut.variables as string | undefined) : undefined}
          onComplete={(id) => completeMut.mutate(id)}
          onCancel={setCancelTripTarget}
        />
      )}

      {tab === "requests" && (
        <RequestsTab
          isLoading={incoming.isLoading}
          bookings={requestBookings}
          onAccept={(id) => acceptMut.mutate(id)}
          onReject={(id) => rejectMut.mutate(id)}
        />
      )}
    </Container>

    {rateTarget && (
      <RateModal rating={rateTarget} onClose={() => setRateTarget(null)} />
    )}
    {cancelTarget && (
      <CancelModal
        booking={cancelTarget}
        isPending={cancelMut.isPending}
        onConfirm={() => cancelMut.mutate(cancelTarget.id!)}
        onClose={() => setCancelTarget(null)}
      />
    )}
    {cancelTripTarget && (
      <CancelTripModal
        trip={cancelTripTarget}
        isPending={cancelTripMut.isPending}
        onConfirm={(reason) => cancelTripMut.mutate({ id: cancelTripTarget.id!, reason })}
        onClose={() => setCancelTripTarget(null)}
      />
    )}
    </>
  );
}
