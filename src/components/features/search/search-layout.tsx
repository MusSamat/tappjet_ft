"use client";

import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchTrips, type SearchTripsParams, type TripSearchResult, type TripListItem } from "@/lib/api/trips";
import Link from "next/link";
import { TripCard } from "@/components/ui/trip-card";

import { SearchFilters } from "./search-filters";
import { TripDetailPane } from "./trip-detail-pane";
import { PopularRoutes } from "./popular-routes";
import { TripCardSkeletonList } from "./trip-card-skeleton";
import { MobileRouteBar } from "./_components/mobile-route-bar";
import { SlidersHorizontal, X, Bell, SearchX } from "lucide-react";

interface Props {
  params: SearchTripsParams;
  initial: TripSearchResult;
}

export function SearchLayout({ params, initial }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
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
      : "Все поездки";

  const hasDateFilter = !!params.date;
  const hasRouteFilter = !!(params.from_city || params.to_city);

  const emptyState = (
    <div className="flex flex-col gap-5">
      <div className="rounded-[20px] border-[0.5px] border-gray-300 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <SearchX className="h-7 w-7 text-gray-400" aria-hidden="true" />
        </div>
        <p className="text-[18px] font-extrabold text-gray-900">Поездок не найдено</p>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
          {hasDateFilter
            ? "На эту дату поездок пока нет. Попробуйте другую дату или оставьте заявку — водители сами найдут вас."
            : hasRouteFilter
              ? "По этому маршруту сейчас нет поездок. Оставьте заявку и водители увидят её."
              : "Попробуйте изменить фильтры или выбрать другую дату."}
        </p>
        {(hasDateFilter || hasRouteFilter) && (
          <Link
            href={`/requests/create${params.from_city ? `?from=${encodeURIComponent(params.from_city)}` : ""}${params.to_city ? `&to=${encodeURIComponent(params.to_city)}` : ""}`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-sky-700"
          >
            <Bell className="h-3.5 w-3.5" aria-hidden="true" />
            Оставить заявку
          </Link>
        )}
      </div>
      <PopularRoutes />
    </div>
  );

  const tripList = (onCardClick?: (id: string) => void) => (
    <div className="flex flex-col gap-3">
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
            showBookButton={!!onCardClick}
          />
        </div>
      ))}
      {isFetchingNextPage && <TripCardSkeletonList count={3} />}
      <div ref={sentinel} className="flex h-8 items-center justify-center">
        {!hasNextPage && trips.length > 0 && (
          <span className="text-[12px] font-semibold text-gray-400">Больше поездок нет</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ===== DESKTOP (≥1024px): 3-column split ===== */}
      <div className="hidden lg:flex lg:justify-center" style={{ height: "calc(100vh - 64px)" }}>
        <div
          className="grid w-full max-w-[1500px]"
          style={{ gridTemplateColumns: "260px 1fr 360px" }}
        >
          <div className="overflow-y-auto border-r border-gray-200 bg-white p-5">
            <SearchFilters />
          </div>

          <div className="overflow-y-auto bg-gray-50 px-6 py-5">
            <div className="mb-4">
              <h1 className="text-h1 text-gray-900">{heading}</h1>
              <p className="mt-1 text-[12px] font-semibold text-gray-500">
                {trips.length} поездок
              </p>
            </div>
            {trips.length === 0 ? emptyState : tripList()}
          </div>

          <div className="overflow-y-auto border-l border-gray-200 bg-white px-6 py-5">
            {selectedTrip ? (
              <TripDetailPane trip={selectedTrip} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-[13px] font-semibold text-gray-500">Выберите поездку</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MOBILE/TABLET (<1024px): stacked ===== */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-20 bg-white md:top-16">
          <div className="border-b border-gray-100">
            <div className="mx-auto max-w-[1100px] px-4">
              <MobileRouteBar />
            </div>
          </div>

          <div className="border-b border-gray-100">
            <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-2">
              <p className="text-[12px] font-semibold text-gray-400">
                {trips.length > 0 ? `${trips.length} поездок` : "Поездок не найдено"}
              </p>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 shadow-sm active:bg-gray-50"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                Фильтры
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1100px] px-4 py-4">
          {trips.length === 0
            ? emptyState
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

        <div
          className={`search-sheet fixed bottom-0 left-0 right-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-white${mobileFiltersOpen ? " open" : ""}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-[17px] font-extrabold text-gray-900">Фильтры</h2>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="px-5 py-5">
            <SearchFilters />
          </div>
          <div className="border-t border-gray-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="h-12 w-full rounded-xl bg-amber-500 text-[15px] font-bold text-[#4A2C00] hover:bg-amber-600"
            >
              Показать поездки
            </button>
          </div>
        </div>

        <div
          className={`search-sheet fixed bottom-0 left-0 right-0 z-40 max-h-[90vh] overflow-y-auto rounded-t-[20px] bg-white${mobileDetailOpen ? " open" : ""}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-[17px] font-extrabold text-gray-900">Детали поездки</h2>
            <button
              type="button"
              onClick={() => setMobileDetailOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="px-5 py-5">
            {selectedTrip && <TripDetailPane trip={selectedTrip} />}
          </div>
        </div>
      </div>
    </>
  );
}
