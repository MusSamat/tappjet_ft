"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Inbox, Star, Heart } from "lucide-react";
import { listMyBookings, cancelBooking, listIncomingBookings } from "@/lib/api/bookings";
import { getPendingRatings, type PendingRating } from "@/lib/api/ratings";
import { extractError } from "@/lib/api/client";
import { useFriendlyError } from "@/lib/hooks/use-api-error";
import { toastSuccess, toastError } from "@/components/layout/quick-toast";
import { RateModal } from "@/components/features/ratings/rate-modal";
import { BackButton, Container, QueryError } from "@/components/ui";
import { BackToTop } from "@/components/ui/back-to-top";
import { useScrollRestoration } from "@/lib/hooks/use-scroll-restoration";
import { Confetti } from "@/components/ui/confetti";
import type { Booking } from "@/lib/api/bookings";
import { CancelModal } from "./_components/cancel-modal";
import { PassengerTab } from "./_components/passenger-tab";
import { LikedTab } from "./_components/liked-tab";
import { MyPostsTab } from "./_components/my-posts-tab";
import { MyRequestsTab } from "./_components/my-requests-tab";

// «Мои» — a single, mode-independent activity hub (1:1 with the Flutter smart
// hub): an attention strip (what needs you) + scrollable filter chips + a unified
// «Все» timeline (trips · bookings · requests) grouped into Скоро / Раньше.

type Filter = "trips" | "bookings" | "requests" | "liked";

type BookingExt = Booking & {
  tripId?: string;
  totalPrice?: number;
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

function mapTabToFilter(tab: string | null): Filter {
  switch (tab) {
    case "trips":
      return "trips";
    case "bookings":
      return "bookings";
    case "requests":
    case "incoming":
      return "requests";
    case "liked":
      return "liked";
    default:
      return "bookings";
  }
}

export default function MyBookingsPage() {
  const tMy = useTranslations("my");
  const tToasts = useTranslations("toasts");
  const fe = useFriendlyError();
  const searchParams = useSearchParams();

  const [filter, setFilter] = useState<Filter>(() => mapTabToFilter(searchParams.get("tab")));
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
  const incomingQ = useQuery({
    queryKey: ["bookings", "incoming"],
    queryFn: () => listIncomingBookings(),
    staleTime: 30_000,
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
  const passengerBookings = useMemo(
    () => (outgoing.data?.data ?? []) as BookingExt[],
    [outgoing.data],
  );

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

  const incomingCount = incomingQ.data?.data?.length ?? 0;
  const pendingList = pendingRatings.data?.data ?? [];

  const CHIPS: { value: Filter; label: string; heart?: boolean }[] = [
    { value: "bookings", label: tMy("tab_bookings") },
    { value: "trips", label: tMy("tab_trips") },
    { value: "requests", label: tMy("filter_requests") },
    { value: "liked", label: tMy("tab_liked"), heart: true },
  ];

  return (
    <>
      <Container className="py-8">
        {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

        <BackButton />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="shrink-0 text-[26px] font-900 text-ink-900 dark:text-white">{tMy("title")}</h1>
          <Link href="/trips/create" className="shrink-0">
            <button
              type="button"
              aria-label={tMy("publish")}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-2xl bg-accent-500 px-3 py-2.5 text-[14px] font-900 text-accent-ink shadow-cta hover:bg-accent-400 sm:px-4"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{tMy("publish")}</span>
            </button>
          </Link>
        </div>

        {/* Attention strip — actionable nudges, only when present */}
        {(incomingCount > 0 || pendingList.length > 0) && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {incomingCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter("trips")}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-brand-600/30 bg-brand-600/10 px-3 py-1.5 text-[13px] font-800 text-brand-600"
              >
                <Inbox className="h-3.5 w-3.5" aria-hidden="true" />
                {tMy("attn_incoming", { n: incomingCount })}
              </button>
            )}
            {pendingList.slice(0, 3).map((pr) => (
              <Link
                key={pr.tripId}
                href={`/trips/${pr.tripId}/rate/${pr.counterpartId}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-accent-600/30 bg-accent-500/10 px-3 py-1.5 text-[13px] font-800 text-accent-600"
              >
                <Star className="h-3.5 w-3.5" aria-hidden="true" />
                {tMy("attn_rate", { name: pr.counterpartName })}
              </Link>
            ))}
          </div>
        )}

        {/* Filter chips — scrollable, mode-independent */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CHIPS.map((c) => {
            const selected = filter === c.value;
            return (
              <button
                key={c.value}
                type="button"
                aria-label={c.label}
                onClick={() => setFilter(c.value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-800 transition ${
                  selected
                    ? "bg-brand-600 text-white shadow-brandcta ring-1 ring-brand-600"
                    : "border border-ink-200 bg-white text-ink-600 hover:border-ink-300 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300"
                }`}
              >
                {c.heart ? <Heart className="h-4 w-4" aria-hidden="true" /> : c.label}
              </button>
            );
          })}
        </div>

        {filter === "bookings" && outgoing.isError && (
          <QueryError error={outgoing.error} onRetry={() => void outgoing.refetch()} />
        )}
        {filter === "bookings" && !outgoing.isError && (
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

        {filter === "requests" && <MyRequestsTab />}
        {filter === "trips" && <MyPostsTab show="trips" />}
        {filter === "liked" && <LikedTab />}
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
