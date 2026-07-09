"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { listMyBookings, cancelBooking } from "@/lib/api/bookings";
import { getPendingRatings, type PendingRating } from "@/lib/api/ratings";
import { extractError } from "@/lib/api/client";
import { useFriendlyError } from "@/lib/hooks/use-api-error";
import { toastSuccess, toastError } from "@/components/layout/quick-toast";
import { RateModal } from "@/components/features/ratings/rate-modal";
import { useUiRole } from "@/lib/hooks/use-role-colors";
import { ROLE_THEME } from "@/lib/role-colors";
import { BackButton, Container, QueryError, Segmented } from "@/components/ui";
import { BackToTop } from "@/components/ui/back-to-top";
import { useScrollRestoration } from "@/lib/hooks/use-scroll-restoration";
import { Confetti } from "@/components/ui/confetti";
import type { Booking } from "@/lib/api/bookings";
import { CancelModal } from "./_components/cancel-modal";
import { PassengerTab } from "./_components/passenger-tab";
import { LikedTab } from "./_components/liked-tab";
import { MyPostsTab } from "./_components/my-posts-tab";
import { MyRequestsTab } from "./_components/my-requests-tab";

// «Мои» hub (Phase 1, no roles): Объявления (мои поездки + заявки со
// статусами) / Брони / Избранное / История — один набор для всех.

// Role-adaptive hub — the active mode decides the tab set:
//   passenger: Брони · Мои заявки · Избранное
//   driver:    Мои поездки · Избранное  (incoming bookings are managed per-trip)
// History lives in the profile, not here.
type Tab = "bookings" | "requests" | "trips" | "liked";

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


export default function MyBookingsPage() {
  const tMy = useTranslations("my");
  const tToasts = useTranslations("toasts");
  const fe = useFriendlyError();
  const role = useUiRole();
  const isDriver = role === "driver";
  const theme = ROLE_THEME[role];
  const searchParams = useSearchParams();

  const tabOptions: { value: Tab; label: string }[] = isDriver
    ? [
        { value: "trips", label: tMy("tab_my_trips") },
        { value: "liked", label: tMy("tab_liked") },
      ]
    : [
        { value: "bookings", label: tMy("tab_bookings") },
        { value: "requests", label: tMy("tab_my_requests") },
        { value: "liked", label: tMy("tab_liked") },
      ];

  const initialTab = ((): Tab => {
    const requested = searchParams.get("tab") as Tab | null;
    const allowed = tabOptions.map((o) => o.value);
    return requested && allowed.includes(requested) ? requested : tabOptions[0]!.value;
  })();

  const [tab, setTab] = useState<Tab>(initialTab);
  useScrollRestoration();
  const [rateTarget, setRateTarget] = useState<PendingRating | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingExt | null>(null);
  const qc = useQueryClient();

  const outgoing = useQuery({
    queryKey: ["bookings", "my", "outgoing"],
    queryFn: () => listMyBookings(),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const pendingRatings = useQuery({
    queryKey: ["ratings", "pending"],
    queryFn: getPendingRatings,
    staleTime: 60_000,
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




  return (
    <>
      <Container className="py-8">
        {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

        <BackButton />
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <h1 className="shrink-0 text-[26px] font-900 text-ink-900 dark:text-white">{tMy("title")}</h1>
          </div>
          <Link href={isDriver ? "/trips/create" : "/requests/create"} className="shrink-0">
            <button
              type="button"
              aria-label={tMy("publish")}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-2xl bg-accent-500 px-3 py-2.5 text-[14px] font-900 text-accent-ink shadow-cta hover:bg-accent-400 sm:px-4"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              {/* Label from sm up; icon-only on the tightest phones so the header never crowds. */}
              <span className="hidden sm:inline">{tMy("publish")}</span>
            </button>
          </Link>
        </div>

        <div className="mb-4">
          <Segmented options={tabOptions} value={tab} onChange={setTab} textOn={theme.textOn} />
        </div>

        {/* Passenger · Брони (outgoing bookings) */}
        {tab === "bookings" && outgoing.isError && (
          <QueryError error={outgoing.error} onRetry={() => void outgoing.refetch()} />
        )}
        {tab === "bookings" && !outgoing.isError && (
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

        {/* Passenger · Мои заявки (my requests + offers received) */}
        {tab === "requests" && <MyRequestsTab />}

        {/* Driver · Мои поездки */}
        {tab === "trips" && <MyPostsTab show="trips" />}

        {/* Both · Избранное */}
        {tab === "liked" && <LikedTab />}
      </Container>
      <BackToTop showOnDesktop />


      {rateTarget && <RateModal rating={rateTarget} onClose={() => setRateTarget(null)} />}
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          isPending={cancelMut.isPending}
          onConfirm={() => cancelMut.mutate(cancelTarget.id!)}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </>
  );
}
