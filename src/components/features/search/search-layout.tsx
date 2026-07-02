"use client";

import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { searchTrips, type SearchTripsParams, type TripSearchResult, type TripListItem } from "@/lib/api/trips";
import { X } from "lucide-react";
import { TripCard } from "@/components/ui/trip-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeletonList } from "@/components/ui/card-skeleton";
import { QueryError } from "@/components/ui/query-error";
import { useUiRole } from "@/lib/hooks/use-role-colors";

import { SearchFilters } from "./search-filters";
import { TripDetailView, type DetailTripData } from "@/components/features/trip/trip-detail";
import { PopularRoutes } from "./popular-routes";
import { FeedHeader } from "./feed-header";

interface Props {
  params: SearchTripsParams;
  initial: TripSearchResult;
}

/** Role-aware feed empty state (spec §2.2 recommends one; copy in feed.empty_*). */
function FeedEmpty({ params }: { params: SearchTripsParams }) {
  const t = useTranslations("feed");
  const role = useUiRole();

  const requestQs = `${params.from_city ? `?from=${encodeURIComponent(params.from_city)}` : ""}${
    params.to_city ? `${params.from_city ? "&" : "?"}to=${encodeURIComponent(params.to_city)}` : ""
  }`;

  const action =
    role === "guest"
      ? { label: t("empty_cta_login"), href: "/auth/login" }
      : role === "driver"
        ? { label: t("empty_trips_cta_driver"), href: "/trips/create" }
        : { label: t("empty_trips_cta"), href: `/requests/create${requestQs}` };

  return (
    <div className="flex flex-col gap-5">
      <EmptyState
        icon="route"
        iconTone="brand"
        title={t("empty_trips_title")}
        description={role === "guest" ? t("empty_trips_desc_guest") : t("empty_trips_desc")}
        action={action}
        className="bg-white shadow-card ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
      />
      <PopularRoutes />
    </div>
  );
}

export function SearchLayout({ params, initial }: Props) {
  const t = useTranslations("feed");
  const role = useUiRole();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const listColRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError, error, refetch } = useInfiniteQuery({
    queryKey: ["trips", params],
    queryFn: ({ pageParam }) => searchTrips({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: { pages: [initial], pageParams: [undefined as string | undefined] },
    staleTime: 0,
  });

  const trips = data?.pages.flatMap((p) => p.data) ?? [];
  const selectedTrip: TripListItem | null = trips.find((t) => t.id === selectedId) ?? trips[0] ?? null;

  useEffect(() => {
    if (trips.length && !selectedId) setSelectedId(trips[0]?.id ?? null);
  }, [trips.length]);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen || mobileDetailOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileFiltersOpen, mobileDetailOpen]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting && !isFetchingNextPage) fetchNextPage(); },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const heading =
    params.from_city && params.to_city
      ? `${params.from_city} → ${params.to_city}`
      : t("all_trips");

  const tripList = (onCardClick?: (id: string) => void) => (
    <div className="space-y-2.5">
      {trips.map((trip, i) => (
        <div
          key={trip.id}
          className="animate-card-in"
          style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }}
        >
          <TripCard
            trip={trip}
            active={!onCardClick && selectedId === trip.id}
            onClick={onCardClick ? () => onCardClick(trip.id ?? "") : () => setSelectedId(trip.id ?? null)}
            showBookButton={!!onCardClick && role === "passenger"}
          />
        </div>
      ))}
      {isFetchingNextPage && <CardSkeletonList variant="trip" count={3} />}
      <div ref={sentinel} className="flex h-8 items-center justify-center">
        {!hasNextPage && trips.length > 0 && (
          <span className="text-[12px] font-800 text-ink-400">{t("no_more_trips")}</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ===== DESKTOP (≥1024px): 3-column master-detail (spec §1.3/§2.2) ===== */}
      <div className="hidden lg:flex lg:justify-center" style={{ height: "calc(100vh - 64px)" }}>
        <div className="grid w-full max-w-[1500px] lg:grid-cols-[260px_1fr_380px]">
          {/* Left: filter sidebar with amber footer CTA */}
          <div className="flex min-h-0 flex-col border-r border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <SearchFilters />
            </div>
            <div className="border-t border-ink-100 p-3 dark:border-ink-800">
              <button
                type="button"
                onClick={() => listColRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                className="h-11 w-full rounded-xl bg-accent-500 text-[13px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400"
              >
                {t("show_trips", { n: trips.length })}
              </button>
            </div>
          </div>

          {/* Middle: scrollable card list */}
          <div ref={listColRef} className="overflow-y-auto bg-ink-50 px-6 py-5 dark:bg-ink-950">
            <div className="mb-4">
              <h1 className="font-disp text-[22px] font-900 text-ink-900 dark:text-white">{heading}</h1>
              <p className="mt-1 text-[12px] font-800 text-ink-500 dark:text-ink-400">
                {t("trips_count", { n: trips.length })}
              </p>
            </div>
            {trips.length === 0
              ? isError
                ? <QueryError error={error} onRetry={() => void refetch()} />
                : <FeedEmpty params={params} />
              : tripList()}
          </div>

          {/* Right rail: detail pane */}
          <div className="overflow-y-auto border-l border-ink-100 bg-white px-6 py-5 dark:border-ink-800 dark:bg-ink-900">
            {selectedTrip ? (
              <TripDetailView trip={selectedTrip as DetailTripData} variant="rail" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-[13px] font-800 text-ink-500">{t("select_trip")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MOBILE/TABLET (<1024px): feed header + card list ===== */}
      <div className="lg:hidden">
        <FeedHeader tab="trips" onOpenFilters={() => setMobileFiltersOpen(true)} />

        <div className="px-4 pb-3">
          {trips.length === 0
            ? isError
              ? <QueryError error={error} onRetry={() => void refetch()} />
              : <FeedEmpty params={params} />
            : tripList((id) => {
                setSelectedId(id);
                setMobileDetailOpen(true);
              })}
        </div>

        {(mobileFiltersOpen || mobileDetailOpen) && (
          <div
            className="fixed inset-0 z-30 bg-black/40"
            onClick={() => { setMobileFiltersOpen(false); setMobileDetailOpen(false); }}
          />
        )}

        {/* Filters bottom sheet */}
        <div
          className={`search-sheet fixed bottom-0 left-0 right-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-4xl bg-white dark:bg-ink-900${mobileFiltersOpen ? " open" : ""}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
            <h2 className="text-[16px] font-900 text-ink-900 dark:text-white">{t("filters")}</h2>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="px-5 py-5">
            <SearchFilters />
          </div>
          <div className="border-t border-ink-100 px-5 py-4 dark:border-ink-800">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="h-12 w-full rounded-2xl bg-accent-500 text-[15px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400"
            >
              {t("show_trips", { n: trips.length })}
            </button>
          </div>
        </div>

        {/* Detail bottom sheet */}
        <div
          className={`search-sheet fixed bottom-0 left-0 right-0 z-40 max-h-[90vh] overflow-y-auto rounded-t-4xl bg-white dark:bg-ink-900${mobileDetailOpen ? " open" : ""}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
            <h2 className="text-[16px] font-900 text-ink-900 dark:text-white">{t("trip_details")}</h2>
            <button
              type="button"
              onClick={() => setMobileDetailOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="px-5 py-5">
            {selectedTrip && <TripDetailView trip={selectedTrip as DetailTripData} variant="rail" />}
          </div>
        </div>
      </div>
    </>
  );
}
