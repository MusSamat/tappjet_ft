"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { useLikedTrips, useLikedRequests } from "@/lib/hooks/use-likes";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { CardSkeletonList } from "@/components/ui/card-skeleton";
import { TripCard } from "@/components/ui/trip-card";
import { RequestCard } from "@/components/features/passenger-requests/request-card";
import type { UiRole } from "@/lib/role-colors";
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
      <p className="text-[15px] font-900 text-ink-900 dark:text-white">{t("liked_empty_title")}</p>
      <p className="mt-1 text-[13px] font-700 text-ink-500 dark:text-ink-400">{t("liked_empty_hint")}</p>
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

export function LikedTab({ role }: { role: UiRole }) {
  const router = useRouter();
  const t = useTranslations("my");
  const isDriver = role === "driver";
  const [filter, setFilter] = useState<FilterKey>("all");

  const trips = useLikedTrips();
  const requests = useLikedRequests();
  const q = isDriver ? requests : trips;

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

  if (q.isLoading) {
    return <CardSkeletonList variant={isDriver ? "request" : "trip"} count={3} />;
  }

  const count = isDriver ? sortedRequests.length : sortedTrips.length;
  if (count === 0) return <EmptyLiked />;

  return (
    <div className="flex flex-col">
      <FilterChips value={filter} onChange={setFilter} />
      <div className="flex flex-col gap-2.5">
        {isDriver
          ? sortedRequests.map((r: PassengerRequest) => (
              <RequestCard key={r.id} request={r} onClick={() => router.push(`/requests/${r.id}`)} />
            ))
          : sortedTrips.map((tr: TripListItem) => (
              <TripCard key={tr.id} trip={tr} onClick={() => router.push(`/trips/${tr.id}`)} />
            ))}
      </div>
      {q.hasNextPage && (
        <Button variant="ghost" size="md" className="mt-3 self-center" disabled={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>
          {q.isFetchingNextPage ? "…" : t("load_more")}
        </Button>
      )}
    </div>
  );
}
