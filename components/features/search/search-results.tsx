"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { searchTrips, type SearchTripsParams, type TripSearchResult } from "@/lib/api/trips";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { Spinner, TripCard } from "@/components/ui";

interface Props {
  params: SearchTripsParams;
  initial: TripSearchResult;
}

export function SearchResults({ params, initial }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["trips", params],
    queryFn: ({ pageParam }) => searchTrips({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialData: { pages: [initial], pageParams: [undefined as string | undefined] },
    staleTime: 60_000,
  });

  const sentinel = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  const trips = data.pages.flatMap((p) => p.data);

  if (trips.length === 0) {
    return (
      <div className="rounded-2xl border-[0.5px] border-gray-300 bg-white p-8 text-center">
        <p className="text-h2 text-gray-900">Ничего не найдено</p>
        <p className="mt-2 text-body-lg text-gray-700">
          Попробуйте другую дату или отключите фильтры.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} href={`/trips/${trip.id}`} />
      ))}

      <div ref={sentinel} className="flex h-16 items-center justify-center">
        {isFetchingNextPage && <Spinner size={24} />}
        {!hasNextPage && trips.length > 0 && (
          <span className="text-caption text-gray-500">Больше поездок нет</span>
        )}
      </div>
    </div>
  );
}
