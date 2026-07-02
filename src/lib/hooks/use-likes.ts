"use client";

import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { listTripLikes, listRequestLikes } from "@/lib/api/likes";

// Cursor-paginated liked-listings hooks (GET /users/me/likes).

export function useLikedTrips() {
  return useInfiniteQuery({
    queryKey: ["likes", "trip"],
    queryFn: ({ pageParam }) => listTripLikes(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useLikedRequests() {
  return useInfiniteQuery({
    queryKey: ["likes", "passenger_request"],
    queryFn: ({ pageParam }) => listRequestLikes(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
