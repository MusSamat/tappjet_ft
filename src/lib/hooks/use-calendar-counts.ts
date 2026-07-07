"use client";

import { useQuery } from "@tanstack/react-query";
import { getTripsCalendar } from "@/lib/api/trips";
import { getRequestsCalendar } from "@/lib/api/passenger-requests";

/**
 * Per-day counts for a route (trips or passenger requests) — availability
 * hints in date pickers. Returns undefined until loaded / without a route.
 */
export function useCalendarCounts(
  kind: "trips" | "requests",
  from: string,
  to: string,
  enabled = true,
): Record<string, number> | undefined {
  const { data } = useQuery({
    queryKey: ["calendar-counts", kind, from, to],
    queryFn: () => (kind === "requests" ? getRequestsCalendar(from, to) : getTripsCalendar(from, to)),
    enabled: enabled && Boolean(from && to),
    staleTime: 60_000,
  });
  return data;
}
