"use client";

import { useEffect, useRef } from "react";
import { recordTripView } from "@/lib/api/trips";
import { recordRequestView } from "@/lib/api/passenger-requests";

/**
 * Fire a single view-count POST when a listing detail is opened by a real user
 * (client-side, after mount — so SSR/crawlers/prefetch don't inflate). The
 * backend dedups per viewer, so re-mounts/refreshes never double-count.
 */
export function useRecordView(
  targetType: "trip" | "passenger_request",
  id: string | undefined,
): void {
  const recorded = useRef<string | null>(null);
  useEffect(() => {
    if (!id || recorded.current === id) return;
    recorded.current = id;
    const fn = targetType === "trip" ? recordTripView : recordRequestView;
    void fn(id).catch(() => undefined);
  }, [targetType, id]);
}
