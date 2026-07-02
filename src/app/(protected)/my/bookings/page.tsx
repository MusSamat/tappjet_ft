"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Eye, User, CarFront } from "lucide-react";
import {
  listMyBookings,
  listIncomingBookings,
  acceptBooking,
  rejectBooking,
  cancelBooking,
} from "@/lib/api/bookings";
import { listMyTrips } from "@/lib/api/my-trips";
import { getPendingRatings, type PendingRating } from "@/lib/api/ratings";
import { extractError } from "@/lib/api/client";
import { useFriendlyError } from "@/lib/hooks/use-api-error";
import { toastSuccess, toastError } from "@/components/layout/quick-toast";
import { RateModal } from "@/components/features/ratings/rate-modal";
import { useUiRole } from "@/lib/hooks/use-role-colors";
import { ROLE_THEME } from "@/lib/role-colors";
import { Container, QueryError, Segmented } from "@/components/ui";
import { Confetti } from "@/components/ui/confetti";
import type { Booking } from "@/lib/api/bookings";
import { completeTrip, cancelTrip } from "@/lib/api/trips";
import type { TripListItem } from "@/lib/api/trips";
import { cn } from "@/lib/utils/cn";
import { CancelModal } from "./_components/cancel-modal";
import { CancelTripModal } from "./_components/cancel-trip-modal";
import { PassengerTab } from "./_components/passenger-tab";
import { DriverTab } from "./_components/driver-tab";
import { RequestsTab } from "./_components/requests-tab";
import { LikedTab } from "./_components/liked-tab";
import { MyRequestsTab } from "./_components/my-requests-tab";

// Role-aware «Мои» hub — design-spec §2.5. Segmented tabs differ by role:
//   passenger → Активные / Заявки / История / Избранное
//   driver    → Поездки  / Запросы  / Избранное

type Tab = "active" | "my_requests" | "history" | "liked" | "trips" | "requests";

const PASSENGER_TABS: Tab[] = ["active", "my_requests", "liked", "history"];
const DRIVER_TABS: Tab[] = ["trips", "requests", "liked"];

type BookingExt = Booking & {
  tripId?: string;
  passengerId?: string;
  totalPrice?: number;
  passenger?: { id?: string; name?: string; avatarUrl?: string | null; rating?: number | null; ratingCount?: number };
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
const HISTORY_STATUSES = new Set([
  "completed",
  "rejected",
  "cancelled_by_passenger",
  "cancelled_by_driver",
  "cancelled_late",
  "no_show",
  "expired",
]);

const ROLE_ICON = { guest: Eye, passenger: User, driver: CarFront } as const;

export default function MyBookingsPage() {
  const tMy = useTranslations("my");
  const tRoles = useTranslations("roles");
  const tToasts = useTranslations("toasts");
  const fe = useFriendlyError();
  const role = useUiRole();
  const theme = ROLE_THEME[role];
  const isDriver = role === "driver";
  const searchParams = useSearchParams();

  const initialTab = ((): Tab => {
    const requested = searchParams.get("tab") as Tab | null;
    const roleTabs = isDriver ? DRIVER_TABS : PASSENGER_TABS;
    if (requested && roleTabs.includes(requested)) return requested;
    return isDriver ? "trips" : "active";
  })();

  const [tab, setTab] = useState<Tab>(initialTab);
  const [rateTarget, setRateTarget] = useState<PendingRating | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingExt | null>(null);
  const [cancelTripTarget, setCancelTripTarget] = useState<TripListItem | null>(null);
  const qc = useQueryClient();

  // Reset the active tab when it isn't valid for the current role (after a switch).
  useEffect(() => {
    const roleTabs = isDriver ? DRIVER_TABS : PASSENGER_TABS;
    setTab((prev) => (roleTabs.includes(prev) ? prev : isDriver ? "trips" : "active"));
  }, [isDriver]);

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
    onSuccess: () => {
      toastSuccess(tToasts("booking_accepted"));
      void qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e) => toastError(fe(extractError(e))),
  });
  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectBooking(id),
    onSuccess: () => {
      toastSuccess(tToasts("booking_rejected"));
      void qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e) => toastError(fe(extractError(e))),
  });
  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: () => {
      setCancelTarget(null);
      toastSuccess(tToasts("booking_cancelled"));
      void qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e) => toastError(fe(extractError(e))),
  });
  const completeMut = useMutation({
    mutationFn: (id: string) => completeTrip(id),
    onSuccess: () => {
      toastSuccess(tToasts("trip_completed"));
      void qc.invalidateQueries({ queryKey: ["trips", "my"] });
      void qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e) => toastError(fe(extractError(e))),
  });
  const cancelTripMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelTrip(id, reason),
    onSuccess: () => {
      setCancelTripTarget(null);
      toastSuccess(tToasts("trip_cancelled"));
      void qc.invalidateQueries({ queryKey: ["trips", "my"] });
    },
    onError: (e) => toastError(fe(extractError(e))),
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

  const pendingRatingMap = new Map<string, PendingRating>(
    (pendingRatings.data?.data ?? []).map((pr) => [pr.tripId, pr]),
  );

  const activeTrips = [...(inTransitTrips.data?.data ?? []), ...(myTrips.data?.data ?? [])];

  const requestBookings = ((incoming.data?.data ?? []) as BookingExt[]).filter((b) =>
    (["pending", "viewed", "accepted"] as string[]).includes(b.status as string),
  );
  const requestsCount = requestBookings.filter((b) =>
    (["pending", "viewed"] as string[]).includes(b.status as string),
  ).length;

  const RoleIcon = ROLE_ICON[role];

  const options = isDriver
    ? [
        { value: "trips" as Tab, label: tMy("tab_trips") },
        { value: "requests" as Tab, label: tMy("tab_requests"), count: incoming.isLoading ? 0 : requestsCount },
        { value: "liked" as Tab, label: tMy("tab_liked") },
      ]
    : [
        { value: "active" as Tab, label: tMy("tab_active") },
        { value: "my_requests" as Tab, label: tMy("tab_my_requests") },
        { value: "liked" as Tab, label: tMy("tab_liked") },
        { value: "history" as Tab, label: tMy("tab_history") },
      ];

  return (
    <>
      <Container className="py-8">
        {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-900 text-ink-900 dark:text-white">{tMy("title")}</h1>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-900", theme.badge)}>
              <RoleIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {tRoles(theme.labelKey)}
            </span>
          </div>
          <Link href={isDriver ? "/trips/create" : "/requests/create"}>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-2xl bg-accent-500 px-4 py-2.5 text-[13px] font-900 text-accent-ink shadow-cta hover:bg-accent-400"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {isDriver ? tMy("publish_trip") : tMy("publish_request")}
            </button>
          </Link>
        </div>

        <div className="mb-4">
          <Segmented options={options} value={tab} onChange={setTab} textOn={theme.textOn} />
        </div>

        {tab === "active" && outgoing.isError && (
          <QueryError error={outgoing.error} onRetry={() => void outgoing.refetch()} />
        )}
        {tab === "active" && !outgoing.isError && (
          <PassengerTab
            isLoading={outgoing.isLoading}
            passengerSubTab="active"
            onSubTabChange={() => {}}
            displayedBookings={activePassengerBookings}
            activeCount={activePassengerBookings.length}
            historyCount={historyPassengerBookings.length}
            pendingRatingMap={pendingRatingMap}
            onRate={setRateTarget}
            onCancel={setCancelTarget}
            showSubTabs={false}
          />
        )}

        {tab === "my_requests" && <MyRequestsTab />}

        {tab === "history" && outgoing.isError && (
          <QueryError error={outgoing.error} onRetry={() => void outgoing.refetch()} />
        )}
        {tab === "history" && !outgoing.isError && (
          <PassengerTab
            isLoading={outgoing.isLoading}
            passengerSubTab="history"
            onSubTabChange={() => {}}
            displayedBookings={historyPassengerBookings}
            activeCount={activePassengerBookings.length}
            historyCount={historyPassengerBookings.length}
            pendingRatingMap={pendingRatingMap}
            onRate={setRateTarget}
            onCancel={setCancelTarget}
            showSubTabs={false}
          />
        )}

        {tab === "trips" && (myTrips.isError || inTransitTrips.isError) && (
          <QueryError
            error={myTrips.error ?? inTransitTrips.error}
            onRetry={() => {
              if (myTrips.isError) void myTrips.refetch();
              if (inTransitTrips.isError) void inTransitTrips.refetch();
            }}
          />
        )}
        {tab === "trips" && !myTrips.isError && !inTransitTrips.isError && (
          <DriverTab
            isLoading={myTrips.isLoading || inTransitTrips.isLoading}
            driverSubTab="active"
            onSubTabChange={() => {}}
            displayedTrips={activeTrips}
            activeCount={activeTrips.length}
            historyCount={0}
            completingId={completeMut.isPending ? (completeMut.variables as string | undefined) : undefined}
            onComplete={(id) => completeMut.mutate(id)}
            onCancel={setCancelTripTarget}
            showSubTabs={false}
          />
        )}

        {tab === "requests" && incoming.isError && (
          <QueryError error={incoming.error} onRetry={() => void incoming.refetch()} />
        )}
        {tab === "requests" && !incoming.isError && (
          <RequestsTab
            isLoading={incoming.isLoading}
            bookings={requestBookings}
            onAccept={(id) => acceptMut.mutate(id)}
            onReject={(id) => rejectMut.mutate(id)}
            actionPending={acceptMut.isPending || rejectMut.isPending}
          />
        )}

        {tab === "liked" && <LikedTab role={role} />}
      </Container>

      {rateTarget && <RateModal rating={rateTarget} onClose={() => setRateTarget(null)} />}
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
