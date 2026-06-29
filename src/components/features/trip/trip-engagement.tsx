"use client";

import { useQuery } from "@tanstack/react-query";
import { getTrip } from "@/lib/api/trips";
import { useAuth } from "@/store/auth";
import { LikeButton, ListingMetrics } from "@/components/ui";

/**
 * Per-viewer engagement for the trip detail page. The page itself is a cached
 * server component (revalidate), so its trip is fetched anonymously and always
 * has `metrics: null` / `liked: false`. This re-fetches client-side with the
 * user's token so the creator sees views/likes and the like state is accurate.
 */
export function TripEngagement({
  tripId,
  initialLiked = false,
}: {
  tripId: string;
  initialLiked?: boolean;
}) {
  const status = useAuth((s) => s.status);

  const { data } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => getTrip(tripId),
    enabled: status === "authenticated",
    staleTime: 30_000,
  });

  const liked = data?.liked ?? initialLiked;
  const metrics = data?.metrics ?? null;

  return (
    <div className="flex items-center gap-3">
      <ListingMetrics metrics={metrics} />
      <LikeButton targetType="trip" id={tripId} liked={liked} size="sm" />
    </div>
  );
}
