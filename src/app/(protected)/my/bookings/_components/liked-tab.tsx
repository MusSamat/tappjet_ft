"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { useLikedTrips, useLikedRequests } from "@/lib/hooks/use-likes";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { Chip } from "@/components/ui/chip";
import { CardSkeletonList } from "@/components/ui/card-skeleton";
import { QueryError } from "@/components/ui/query-error";
import { TripCard } from "@/components/ui/trip-card";
import { RequestCard } from "@/components/features/passenger-requests/request-card";
import type { TripListItem } from "@/lib/api/trips";
import type { PassengerRequest } from "@/lib/api/passenger-requests";

// «Избранное» tab — design-spec §2.5. Driver likes passenger requests,
// passenger likes trips. Filter chips are a visual sort over the loaded list.

type FilterKey = "all" | "soon" | "cheap";

function EmptyLiked() {
  const t = useTranslations("my");
  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-8 text-center dark:border-ink-800 dark:bg-ink-900">
      <Heart className="mx-auto mb-2 h-8 w-8 text-coral-300" aria-hidden="true" />
      <p className="text-[16px] font-900 text-ink-900 dark:text-white">{t("liked_empty_title")}</p>
      <p className="mt-1 text-[15px] font-700 text-ink-500 dark:text-ink-400">{t("liked_empty_hint")}</p>
    </div>
  );
}

function FilterChips({ value, onChange }: { value: FilterKey; onChange: (v: FilterKey) => void }) {
  const t = useTranslations("my");
  const opts: { key: FilterKey; label: string }[] = [
    { key: "all", label: t("filter_all") },
    { key: "soon", label: t("filter_soon") },
    { key: "cheap", label: t("filter_cheap") },
  ];
  return (
    <div className="mb-2.5 flex gap-1.5 overflow-x-auto">
      {opts.map((o) => (
        <Chip key={o.key} kind="filter" accent="accent" selected={value === o.key} onClick={() => onChange(o.key)}>
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

// Phase 1: one favourites feed for everyone — liked trips AND liked requests
// together, each with its status badge; tap opens the item's page.
export function LikedTab() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");

  const trips = useLikedTrips();
  const requests = useLikedRequests();
  const q = trips;

  const sentinel = useInfiniteScroll({
    hasNextPage: q.hasNextPage,
    isFetchingNextPage: q.isFetchingNextPage,
    fetchNextPage: q.fetchNextPage,
  });

  const tripItems = useMemo(() => trips.data?.pages.flatMap((p) => p.data) ?? [], [trips.data]);
  const requestItems = useMemo(() => requests.data?.pages.flatMap((p) => p.data) ?? [], [requests.data]);

  const sortedTrips = useMemo(() => {
    const arr = [...tripItems];
    if (filter === "soon") arr.sort((a, b) => new Date(a.departureAt ?? 0).getTime() - new Date(b.departureAt ?? 0).getTime());
    if (filter === "cheap") arr.sort((a, b) => (a.pricePerSeat ?? 0) - (b.pricePerSeat ?? 0));
    return arr;
  }, [tripItems, filter]);

  const sortedRequests = useMemo(() => {
    const arr = [...requestItems];
    if (filter === "soon") arr.sort((a, b) => new Date(a.departureDate ?? 0).getTime() - new Date(b.departureDate ?? 0).getTime());
    return arr;
  }, [requestItems, filter]);

  if (trips.isLoading || requests.isLoading) {
    return <CardSkeletonList variant="trip" count={3} />;
  }

  if (q.isError) {
    return <QueryError error={q.error} onRetry={() => void q.refetch()} />;
  }

  const count = sortedTrips.length + sortedRequests.length;
  if (count === 0) return <EmptyLiked />;

  return (
    <div className="flex flex-col">
      <FilterChips value={filter} onChange={setFilter} />
      <div className="flex flex-col gap-3.5">
        {[
          ...sortedTrips.map((tr: TripListItem) => ({
            key: `t-${tr.id}`,
            d: new Date(tr.departureAt ?? 0).getTime(),
            node: <TripCard key={`t-${tr.id}`} trip={tr} onClick={() => router.push(`/trips/${tr.id}`)} />,
          })),
          ...sortedRequests.map((r: PassengerRequest) => ({
            key: `r-${r.id}`,
            d: new Date(r.departureDate ?? 0).getTime(),
            node: <RequestCard key={`r-${r.id}`} request={r} onClick={() => router.push(`/requests/${r.id}`)} />,
          })),
        ]
          .sort((a, b) => a.d - b.d)
          .map((x) => x.node)}
        {q.isFetchingNextPage && (
          <CardSkeletonList variant="trip" count={2} className="mt-0.5" />
        )}
      </div>
      <div ref={sentinel} aria-hidden="true" />
    </div>
  );
}
