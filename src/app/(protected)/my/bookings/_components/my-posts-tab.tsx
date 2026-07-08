"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { listMyTrips } from "@/lib/api/my-trips";
import { getDriverStatus } from "@/lib/api/profile";
import { listMyPassengerRequests, type PassengerRequest } from "@/lib/api/passenger-requests";
import type { TripListItem } from "@/lib/api/trips";
import { TripCard } from "@/components/ui/trip-card";
import { RequestCard } from "@/components/features/passenger-requests/request-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeletonList } from "@/components/ui/card-skeleton";

// «Мои объявления» — trips AND ride requests in one feed (Phase 1: no roles).
// Cards keep their identity colors (teal trip / grape request), every card
// carries its text status badge, and tapping opens the OWN page: the trip page
// (with the management panel) or the request page (with driver offers).

type Post =
  | { kind: "trip"; createdAt: string; trip: TripListItem }
  | { kind: "request"; createdAt: string; request: PassengerRequest };

async function fetchMyPosts(): Promise<Post[]> {
  const [active, past, cancelled, requests] = await Promise.all([
    listMyTrips("active", undefined, 30),
    listMyTrips("past", undefined, 30),
    listMyTrips("cancelled", undefined, 30),
    listMyPassengerRequests(),
  ]);
  const trips: Post[] = [...active.data, ...past.data, ...cancelled.data].map((trip) => ({
    kind: "trip",
    createdAt: String(trip.createdAt ?? ""),
    trip,
  }));
  const reqs: Post[] = requests.data.map((request) => ({
    kind: "request",
    createdAt: String(request.createdAt ?? ""),
    request,
  }));
  return [...trips, ...reqs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function MyPostsTab() {
  const t = useTranslations("my");
  const { data: posts, isLoading } = useQuery({
    queryKey: ["my-posts"],
    queryFn: fetchMyPosts,
    staleTime: 15_000,
  });

  // Verification is suggested to EVERY unverified driver with a trip posted —
  // никогда не блокирует. После 3 завершённых поездок текст становится
  // праздничным («вы уже сделали N поездок»).
  const hasTripPosts = (posts ?? []).some((p) => p.kind === "trip");
  const completedTrips = (posts ?? []).filter(
    (p) => p.kind === "trip" && p.trip.status === "completed",
  ).length;
  const { data: verification } = useQuery({
    queryKey: ["driver-status"],
    queryFn: getDriverStatus,
    enabled: hasTripPosts,
    staleTime: 60_000,
  });
  const showVerifyNudge =
    hasTripPosts &&
    verification &&
    verification.status !== "verified" &&
    verification.status !== "pending" &&
    verification.status !== "docs_requested";

  if (isLoading) return <CardSkeletonList variant="trip" count={3} />;

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        icon="route"
        iconTone="brand"
        title={t("posts_empty_title")}
        description={t("posts_empty_desc")}
        action={{ label: t("publish"), href: "/trips/create" }}
        className="bg-white shadow-card ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
      />
    );
  }

  return (
    <div className="space-y-3.5">
      {showVerifyNudge && (
        <Link
          href="/profile/driver"
          className="flex items-center gap-3 rounded-3xl bg-brand-50 p-4 ring-1 ring-brand-200 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:ring-brand-500/25"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <BadgeCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-900 text-ink-900 dark:text-white">
              {completedTrips >= 3
                ? t("verify_nudge_title", { n: completedTrips })
                : t("verify_nudge_title_generic")}
            </span>
            <span className="block text-[13px] font-600 text-ink-600 dark:text-ink-300">
              {t("verify_nudge_text")}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-brand-600 px-4 py-2 text-[14px] font-800 text-white">
            {t("verify_nudge_cta")}
          </span>
        </Link>
      )}
      {posts.map((p) =>
        p.kind === "trip" ? (
          <TripCard key={`t-${p.trip.id}`} trip={p.trip} href={`/trips/${p.trip.id}`} />
        ) : (
          <RequestCard key={`r-${p.request.id}`} request={p.request} href={`/requests/${p.request.id}`} />
        ),
      )}
    </div>
  );
}
