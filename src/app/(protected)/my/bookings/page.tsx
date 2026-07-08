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

// «Мои» hub (Phase 1, no roles): Объявления (мои поездки + заявки со
// статусами) / Брони / Избранное / История — один набор для всех.

type Tab = "posts" | "active" | "liked";

// One tab set for everyone (Phase 1: no account roles):
// «Объявления» = my trips + my requests together, with status badges.
// «История» намеренно не здесь — она живёт в профиле.
const ALL_TABS: Tab[] = ["posts", "active", "liked"];

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
  const theme = ROLE_THEME[role];
  const searchParams = useSearchParams();

  const initialTab = ((): Tab => {
    const requested = searchParams.get("tab") as Tab | null;
    if (requested && ALL_TABS.includes(requested)) return requested;
    return "posts";
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




  const options = [
    { value: "posts" as Tab, label: tMy("tab_posts") },
    { value: "active" as Tab, label: tMy("tab_active") },
    { value: "liked" as Tab, label: tMy("tab_liked") },
  ];

  return (
    <>
      <Container className="py-8">
        {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

        <BackButton />
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <h1 className="shrink-0 text-[26px] font-900 text-ink-900 dark:text-white">{tMy("title")}</h1>
          </div>
          <Link href="/trips/create" className="shrink-0">
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

        {tab === "posts" && <MyPostsTab />}

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
